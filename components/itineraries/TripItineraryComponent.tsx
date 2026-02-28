import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useItineraryActions } from '@/hooks/useItineraryActions'; // adjust path
import { DayTabBar } from './DayTabBar';
import { ActiveDayView } from './ActiveDayView';
import { AddItemModal } from './AddItemModal';

type Props = {
  groupId: string;
  startDate?: string; // 'yyyy-MM-dd'
  endDate?: string;   // 'yyyy-MM-dd'
};

export const TripItineraryComponent = ({ groupId, startDate, endDate }: Props) => {
  const itinerary = useItineraryActions();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addItemVisible, setAddItemVisible] = useState(false);

  // Load itinerary on mount
  useEffect(() => {
    itinerary.loadItinerary(groupId, startDate, endDate);
  }, [groupId]);

  // Select first date once days load
  useEffect(() => {
    if (itinerary.days.length > 0 && !selectedDate) {
      setSelectedDate(itinerary.days[0].date ?? null);
    }
  }, [itinerary.days]);

  const activeDayForDate = selectedDate
    ? itinerary.days.find(d => d.date === selectedDate) ?? null
    : null;

  const activeItems = activeDayForDate
    ? (itinerary.itemsByDayId[activeDayForDate.id] ?? [])
    : [];

  // Tapping a date tab that has no day assigned yet → create the day
  const handleSelectDate = useCallback(
    async (date: string) => {
      setSelectedDate(date);
      const alreadyExists = itinerary.days.some(d => d.date === date);
      if (!alreadyExists && itinerary.itinerary) {
        await itinerary.addDay(itinerary.itinerary.id, date);
      }
    },
    [itinerary]
  );

  // Plus button → append a date-less day and select it
  const handlePressPlus = useCallback(async () => {
    console.log('handlePressPlus: ', itinerary);
    if (!itinerary.itinerary) return;
    const newDay = await itinerary.addDay(itinerary.itinerary.id, null);
    if (newDay) setSelectedDate(newDay.date);
  }, [itinerary]);

  return (
    <View style={styles.container}>
      <DayTabBar
        days={itinerary.days}
        startDate={startDate}
        endDate={endDate}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onPressPlus={handlePressPlus}
      />

      <ActiveDayView
        tripId={groupId}
        day={activeDayForDate}
        items={activeItems}
        isLoading={itinerary.isLoading}
        onAddItem={() => setAddItemVisible(true)}
      />

      {activeDayForDate && (
        <AddItemModal
          visible={addItemVisible}
          onClose={() => setAddItemVisible(false)}
          dayId={activeDayForDate.id}
          existingItems={activeItems}
          onAdd={itinerary.addItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});