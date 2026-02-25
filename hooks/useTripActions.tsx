// hooks/useTripActions.ts
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase/client';
import type { LiteAPIPlace } from '@/hooks/usePlacesAutoComplete';

// ── Types ──────────────────────────────────────────────────────────────────

export type GroupVisibility = 'public' | 'private';
export type GroupType = 'trip' | 'event';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface TripDetails {
  id: string;
  group_id: string;
  start_date: string | null;
  end_date: string | null;
  destination_label: string | null;
  destination_place_id: string | null;
  destination_address: string | null;
  cover_image_url: string | null;
  budget: number | null;
  currency: string;
}

export interface Group {
  id: string;
  type: GroupType;
  name: string;
  owner_id: string;
  created_at: string;
  visibility: GroupVisibility;
  description: string | null;
  cover_image_url: string | null;
}

export interface Trip extends Group {
  trip_details: TripDetails | null;
}

export interface CreateTripInput {
  name: string;
  description?: string;
  cover_image_url?: string;
  visibility?: GroupVisibility;
}

export interface UpdateTripInput {
  name?: string;
  description?: string;
  cover_image_url?: string;
  visibility?: GroupVisibility;
}

export interface UpdateTripDetailsInput {
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  currency?: string;
  cover_image_url?: string | null;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export const useTripActions = () => {
  const { user } = useAuth();
  if (!user) {
    throw new Error('User not authenticated');
  }
  const userId = user?.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // ── CREATE ────────────────────────────────────────────────────────────────

  const createTrip = async (input: CreateTripInput) => {
    try { 
      setLoading(true);
      const { data, error } = await supabase
        .from('groups')
        .insert({
          type: 'trip',
          name: input.name,
          description: input.description ?? null,
          cover_image_url: input.cover_image_url ?? null,
          visibility: input.visibility ?? 'public',
          owner_id: userId,
        })
        .select(`
          *,
          trip_details (*)
        `)
        .single();

      if (error) throw error;
      return data as Trip;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ── READ ──────────────────────────────────────────────────────────────────

  const fetchTrips = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          trip_details (*)
        `)
        .eq('type', 'trip')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Trip[];
  };

  const fetchMyTrips = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          trip_details (*)
        `)
        .eq('type', 'trip')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Trip[];
  };

  // Trips where user is a member (not just owner)
  const fetchJoinedTrips = async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          group:group_id (
            *,
            trip_details (*)
          )
        `)
        .eq('user_id', userId)
        .eq('group.type', 'trip');

      if (error) throw error;
      return data?.map((row: any) => row.group).filter(Boolean) as Trip[];
  };

  const fetchTripById = async (groupId: string) => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          trip_details (*),
          group_members (
            id,
            user_id,
            role
          )
        `)
        .eq('id', groupId)
        .eq('type', 'trip')
        .single();

      if (error) throw error;
      return data as Trip;
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────

  const updateTrip = async (groupId: string, input: UpdateTripInput) => {
      const { data, error } = await supabase
        .from('groups')
        .update(input)
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;
      return data as Group;
  };

  const updateTripDetails = async (groupId: string, input: UpdateTripDetailsInput) => {
      const { data, error } = await supabase
        .from('trip_details')
        .update(input)
        .eq('group_id', groupId)
        .select()
        .single();

      if (error) throw error;
      return data as TripDetails;
  };

  const updateDestination = async (groupId: string, place: LiteAPIPlace) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_details')
        .update({
          destination_label: `${place.displayName}, ${place.formattedAddress}`,
          destination_place_id: place.placeId,
          destination_address: place.formattedAddress,
        })
        .eq('group_id', groupId)
        .select()
        .single();

      if (error) throw error;
      return data as TripDetails;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────

  const deleteTrip = async (groupId: string) => {
    try {
      setLoading(true);
      // Cascades to trip_details, group_members, itinerary via FK constraints
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)
        .eq('owner_id', userId); // extra safety — only owner can delete

      if (error) throw error;
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ── MEMBERS ───────────────────────────────────────────────────────────────

  const leaveTrip = async (groupId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (groupId: string, targetUserId: string, role: MemberRole) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('group_members')
        .update({ role })
        .eq('group_id', groupId)
        .eq('user_id', targetUserId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (groupId: string, targetUserId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', targetUserId);

      if (error) throw error;
      return true;
      } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // Create
    createTrip,
    // Read
    fetchTrips,
    fetchMyTrips,
    fetchJoinedTrips,
    fetchTripById,
    // Update
    updateTrip,
    updateTripDetails,
    updateDestination,
    // Delete
    deleteTrip,
    // Members
    leaveTrip,
    updateMemberRole,
    removeMember,
  };
};