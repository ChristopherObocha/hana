import { useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ItineraryItem = {
  id: string;
  day_id: string;
  title: string;
  location: string | null;
  description: string | null;
  start_time: string | null; // 'HH:mm'
  end_time: string | null;   // 'HH:mm'
  position: number;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
};

export type ItineraryDay = {
  id: string;
  itinerary_id: string;
  day_number: number;
  date: string | null; // 'yyyy-MM-dd'
  title: string | null;
  itinerary_items: ItineraryItem[];
};

export type Itinerary = {
  id: string;
  group_id: string;
  created_at: string;
  itinerary_day: ItineraryDay[];
};

export type NewItineraryItem = {
  title: string;
  location?: string | null;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  image_url?: string | null;
  created_by?: string | null;
};

export type ItineraryState = {
  itinerary: Itinerary | null;
  days: ItineraryDay[];
  itemsByDayId: Record<string, ItineraryItem[]>;
  isLoading: boolean;
  error: string | null;
};

// ─── Position helper ──────────────────────────────────────────────────────────

function resolveItemPosition(
  startTime: string | null | undefined,
  existingItems: ItineraryItem[]
): number {
  if (!startTime || existingItems.length === 0) return existingItems.length;

  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m ?? 0);
  };

  const newMinutes = toMinutes(startTime);
  const sorted = [...existingItems].sort((a, b) => a.position - b.position);

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].start_time && toMinutes(sorted[i].start_time!) > newMinutes) {
      return i;
    }
  }

  return existingItems.length;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useItineraryActions
 *
 * Handles all Supabase operations for itineraries.
 * Designed to support both trips and events (group_id is the common anchor).
 *
 * Usage:
 *   const itineraryActions = useItineraryActions();
 *   // call itineraryActions.loadItinerary(groupId) on mount
 *   // spread itineraryActions into your context or use directly in a component
 */
export function useItineraryActions() {
  const [state, setState] = useState<ItineraryState>({
    itinerary: null,
    days: [],
    itemsByDayId: {},
    isLoading: false,
    error: null,
  });

  // ─── Internal helpers ──────────────────────────────────────────────────────

  const setLoading = (isLoading: boolean) =>
    setState(prev => ({ ...prev, isLoading }));

  const setError = (error: string | null) =>
    setState(prev => ({ ...prev, error }));

  /**
   * Rebuilds itemsByDayId from a flat array of days with nested items.
   */
  function buildItemsByDayId(days: ItineraryDay[]): Record<string, ItineraryItem[]> {
    return days.reduce<Record<string, ItineraryItem[]>>((acc, day) => {
      acc[day.id] = [...(day.itinerary_items ?? [])].sort(
        (a, b) => a.position - b.position
      );
      return acc;
    }, {});
  }

  /**
   * Reloads the full itinerary from Supabase and syncs state.
   * Call this after any mutation to keep state fresh.
   */
  const syncItinerary = useCallback(async (itineraryId: string) => {
    const { data, error } = await supabase
      .from('itineraries')
      .select(`
        *,
        itinerary_day (
          *,
          itinerary_items (*)
        )
      `)
      .eq('id', itineraryId)
      .order('day_number', { referencedTable: 'itinerary_day' })
      .single();

    if (error || !data) {
      setError(error?.message ?? 'Failed to sync itinerary');
      return;
    }

    const days: ItineraryDay[] = data.itinerary_day ?? [];

    setState(prev => ({
      ...prev,
      itinerary: data,
      days,
      itemsByDayId: buildItemsByDayId(days),
      error: null,
    }));
  }, []);

  // ─── Itinerary ─────────────────────────────────────────────────────────────

  /**
   * Loads the itinerary for a given group_id.
   * If no itinerary exists yet, creates one.
   * Also auto-generates days from trip date range if provided.
   *
   * @param groupId        - The group (trip or event) ID
   * @param startDate      - Optional trip start date ('yyyy-MM-dd')
   * @param endDate        - Optional trip end date ('yyyy-MM-dd')
   */
  const loadItinerary = useCallback(
    async (groupId: string, startDate?: string, endDate?: string) => {
      setLoading(true);
      setError(null);

      try {
        // 1. Check if itinerary already exists
        const { data: existing, error: fetchError } = await supabase
          .from('itineraries')
          .select(`
            *,
            itinerary_day (
              *,
              itinerary_items (*)
            )
          `)
          .eq('group_id', groupId)
          .order('day_number', { referencedTable: 'itinerary_day' })
          .maybeSingle();

        if (fetchError) throw new Error(fetchError.message);

        if (existing) {
          const days: ItineraryDay[] = existing.itinerary_day ?? [];
          setState(prev => ({
            ...prev,
            itinerary: existing,
            days,
            itemsByDayId: buildItemsByDayId(days),
            isLoading: false,
          }));
          return;
        }

        // 2. Create itinerary
        const { data: newItinerary, error: createError } = await supabase
          .from('itineraries')
          .insert({ group_id: groupId })
          .select()
          .single();

        if (createError || !newItinerary) throw new Error(createError?.message);

        // 3. Auto-generate days from date range if available
        if (startDate && endDate) {
          const dates = eachDayOfInterval({
            start: parseISO(startDate),
            end: parseISO(endDate),
          });

          const dayRows = dates.map((d, i) => ({
            itinerary_id: newItinerary.id,
            day_number: i + 1,
            date: format(d, 'yyyy-MM-dd'),
            title: `Day ${i + 1}`,
          }));

          const { error: daysError } = await supabase
            .from('itinerary_day')
            .insert(dayRows);

          if (daysError) throw new Error(daysError.message);
        }

        // 4. Sync full state
        await syncItinerary(newItinerary.id);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load itinerary');
      } finally {
        setLoading(false);
      }
    },
    [syncItinerary]
  );

  // ─── Days ──────────────────────────────────────────────────────────────────

  /**
   * Adds a new day to the itinerary.
   * Day number is always next in sequence (appended).
   *
   * @param itineraryId  - Parent itinerary ID
   * @param date         - The date to assign ('yyyy-MM-dd'), or null for a free day
   */
  const addDay = useCallback(
    async (itineraryId: string, date: string | null) => {
      setError(null);

      const currentDays = state.days;
      const nextDayNumber = currentDays.length + 1;

      const { data, error } = await supabase
        .from('itinerary_day')
        .insert({
          itinerary_id: itineraryId,
          day_number: nextDayNumber,
          date,
          title: `Day ${nextDayNumber}`,
        })
        .select()
        .single();

      if (error || !data) {
        setError(error?.message ?? 'Failed to add day');
        return null;
      }

      // Optimistic update — add the new day immediately
      const newDay: ItineraryDay = { ...data, itinerary_items: [] };
      setState(prev => ({
        ...prev,
        days: [...prev.days, newDay],
        itemsByDayId: { ...prev.itemsByDayId, [newDay.id]: [] },
      }));

      return newDay;
    },
    [state.days]
  );

  /**
   * Updates a day's title or date.
   */
  const updateDay = useCallback(
    async (dayId: string, updates: { title?: string; date?: string }) => {
      setError(null);

      const { error } = await supabase
        .from('itinerary_day')
        .update(updates)
        .eq('id', dayId);

      if (error) {
        setError(error.message);
        return;
      }

      setState(prev => ({
        ...prev,
        days: prev.days.map(d => (d.id === dayId ? { ...d, ...updates } : d)),
      }));
    },
    []
  );

  /**
   * Deletes a day and all its items (relies on CASCADE DELETE in DB).
   * Re-sequences day_number for remaining days after deletion.
   */
  const deleteDay = useCallback(
    async (dayId: string) => {
      setError(null);

      const { error } = await supabase
        .from('itinerary_day')
        .delete()
        .eq('id', dayId);

      if (error) {
        setError(error.message);
        return;
      }

      // Remove from local state and re-sequence day_number
      setState(prev => {
        const remaining = prev.days
          .filter(d => d.id !== dayId)
          .map((d, i) => ({ ...d, day_number: i + 1, title: `Day ${i + 1}` }));

        const { [dayId]: _, ...restItems } = prev.itemsByDayId;

        return {
          ...prev,
          days: remaining,
          itemsByDayId: restItems,
        };
      });

      // Fire-and-forget: update day_number in DB for remaining days
      // (non-blocking — day_number is display-only, not a FK)
      state.days
        .filter(d => d.id !== dayId)
        .forEach((d, i) => {
          supabase
            .from('itinerary_day')
            .update({ day_number: i + 1, title: `Day ${i + 1}` })
            .eq('id', d.id);
        });
    },
    [state.days]
  );

  // ─── Items ─────────────────────────────────────────────────────────────────

  /**
   * Adds an item to a day.
   * Auto-positions based on start_time if provided,
   * otherwise appends to end. Shifts existing items as needed.
   */
  const addItem = useCallback(
    async (dayId: string, item: NewItineraryItem) => {
      setError(null);

      const existingItems = state.itemsByDayId[dayId] ?? [];
      const position = resolveItemPosition(item.start_time, existingItems);

      // Shift items at or after insertion position
      const itemsToShift = existingItems.filter(i => i.position >= position);
      if (itemsToShift.length > 0) {
        await Promise.all(
          itemsToShift.map(i =>
            supabase
              .from('itinerary_items')
              .update({ position: i.position + 1 })
              .eq('id', i.id)
          )
        );
      }

      const { data, error } = await supabase
        .from('itinerary_items')
        .insert({ ...item, day_id: dayId, position })
        .select()
        .single();

      if (error || !data) {
        setError(error?.message ?? 'Failed to add item');
        return null;
      }

      // Rebuild the day's item list with updated positions
      setState(prev => {
        const current = prev.itemsByDayId[dayId] ?? [];
        const shifted = current.map(i =>
          i.position >= position ? { ...i, position: i.position + 1 } : i
        );
        const updated = [...shifted, data as ItineraryItem].sort(
          (a, b) => a.position - b.position
        );

        return {
          ...prev,
          itemsByDayId: { ...prev.itemsByDayId, [dayId]: updated },
        };
      });

      return data as ItineraryItem;
    },
    [state.itemsByDayId]
  );

  /**
   * Updates an item's fields.
   * If start_time changes, re-sorts the local list by position
   * (does not re-sequence positions in DB — call reorderItems if needed).
   */
  const updateItem = useCallback(
    async (itemId: string, dayId: string, updates: Partial<NewItineraryItem>) => {
      setError(null);

      const { data, error } = await supabase
        .from('itinerary_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error || !data) {
        setError(error?.message ?? 'Failed to update item');
        return null;
      }

      setState(prev => {
        const current = prev.itemsByDayId[dayId] ?? [];
        const updated = current
          .map(i => (i.id === itemId ? { ...i, ...updates } : i))
          .sort((a, b) => a.position - b.position);

        return {
          ...prev,
          itemsByDayId: { ...prev.itemsByDayId, [dayId]: updated },
        };
      });

      return data as ItineraryItem;
    },
    [state.itemsByDayId]
  );

  /**
   * Deletes an item and compacts positions of remaining items in the day.
   */
  const deleteItem = useCallback(
    async (itemId: string, dayId: string) => {
      setError(null);

      const { error } = await supabase
        .from('itinerary_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        setError(error.message);
        return;
      }

      setState(prev => {
        const remaining = (prev.itemsByDayId[dayId] ?? [])
          .filter(i => i.id !== itemId)
          .map((i, idx) => ({ ...i, position: idx }));

        return {
          ...prev,
          itemsByDayId: { ...prev.itemsByDayId, [dayId]: remaining },
        };
      });

      // Compact positions in DB (fire-and-forget)
      const remaining = (state.itemsByDayId[dayId] ?? [])
        .filter(i => i.id !== itemId)
        .sort((a, b) => a.position - b.position);

      remaining.forEach((item, idx) => {
        if (item.position !== idx) {
          supabase
            .from('itinerary_items')
            .update({ position: idx })
            .eq('id', item.id);
        }
      });
    },
    [state.itemsByDayId]
  );

  /**
   * Reorders items within a day after a drag-and-drop.
   * Pass the new ordered array of items.
   */
  const reorderItems = useCallback(
    async (dayId: string, reorderedItems: ItineraryItem[]) => {
      setError(null);

      // Optimistic update first
      setState(prev => ({
        ...prev,
        itemsByDayId: {
          ...prev.itemsByDayId,
          [dayId]: reorderedItems.map((item, idx) => ({ ...item, position: idx })),
        },
      }));

      // Persist to DB
      await Promise.all(
        reorderedItems.map((item, idx) =>
          supabase
            .from('itinerary_items')
            .update({ position: idx })
            .eq('id', item.id)
        )
      );
    },
    []
  );

  /**
   * Fetches a single item by ID.
   * Use in ItemDetailScreen where you only have the itemId from route params.
   */
  const fetchItem = useCallback(async (itemId: string): Promise<ItineraryItem | null> => {
    const { data, error } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error || !data) {
      setError(error?.message ?? 'Item not found');
      return null;
    }

    return data as ItineraryItem;
  }, []);

  // ─── Return ────────────────────────────────────────────────────────────────

  return {
    // State
    ...state,

    // Itinerary
    loadItinerary,

    // Days
    addDay,
    updateDay,
    deleteDay,

    // Items
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    fetchItem,
  };
}

export type ItineraryActions = ReturnType<typeof useItineraryActions>;