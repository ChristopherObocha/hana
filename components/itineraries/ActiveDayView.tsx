import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { ItineraryDay, ItineraryItem } from '@/hooks/useItineraryActions';
import { ItineraryItemRow } from './ItineraryItemRow';

type Props = {
  tripId: string;
  day: ItineraryDay | null;
  items: ItineraryItem[];
  isLoading: boolean;
  onAddItem: () => void;
};

export const ActiveDayView = ({ tripId, day, items, isLoading, onAddItem }: Props) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  // No day assigned to the selected date yet
  // (addDay is triggered in TripItineraryComponent.handleSelectDate, so this
  // state is transient — shows briefly while the insert completes)
  if (!day) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Nothing here yet</Text>
        <Text style={styles.emptySubtitle}>Select a date to get started</Text>
      </View>
    );
  }

  // Day exists but has no items
  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No activities yet</Text>
        <Text style={styles.emptySubtitle}>Add something to do on this day</Text>
        <TouchableOpacity onPress={onAddItem} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Activity</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Day has items
  return (
    <FlashList
      data={items} // already sorted by position from hook
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <ItineraryItemRow
          item={item}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/(trips)/[tripId]/item/[itemId]',
              params: { tripId: tripId, itemId: item.id },
            })
          }
        />
      )}
      ListFooterComponent={
        <TouchableOpacity onPress={onAddItem} style={styles.addMoreBtn}>
          <Text style={styles.addMoreText}>+ Add Activity</Text>
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  addBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  addMoreBtn: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
});