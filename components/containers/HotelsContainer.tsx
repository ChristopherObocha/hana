import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';

import { Colors } from '@/constants';
import useHotelAction, { Hotel } from '@/hooks/useHotelAction';
import { FlashList } from '@shopify/flash-list';
import { Spacer, DiscoverCard } from '@/components';
import { router } from 'expo-router';

type SortOrder = 'asc' | 'desc';

export default function HotelsContainer({
  placeId,
  groupId,
}: {
  placeId: string | null | undefined;
  groupId: string;
}) {
  const { hotels, fetchHotels, isLoading, error } = useHotelAction();
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    if (placeId) {
      fetchHotels(placeId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

  const sortedHotels = useMemo(() => {
    return hotels.sort((a, b) => {
      return sortOrder === 'asc' ? a.stars - b.stars : b.stars - a.stars;
    });
  }, [hotels, sortOrder]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (error || !hotels) {
    return (
      <View style={styles.container}>
        <Text>Error: </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() =>
          setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
        }>
        <Text>Stars {sortOrder === 'desc' ? '↓' : '↑'}</Text>
      </Pressable>
      <Spacer size={16} vertical />
      <FlashList
        data={sortedHotels}
        renderItem={({ item, index }: { item: Hotel; index: number }) => {
          const isLeftColumn = index % 2 === 0;
          return (
            <DiscoverCard
              id={item.id}
              title={item.name}
              description={item.hotelDescription}
              image={item.main_photo}
              type="hotel"
              details={item}
              groupId={groupId}
              onPress={() => {
                router.push(`/(tabs)/(trips)/${groupId}/hotels/${item.id}`);
              }}
              style={{
                marginRight: isLeftColumn ? 8 : 0, // right margin for left column
                marginLeft: !isLeftColumn ? 8 : 0, // left margin for right column
                marginBottom: 16, // vertical spacing
              }}
            />
          );
        }}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ gap: 16 }}
        ItemSeparatorComponent={() => <Spacer size={16} horizontal />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
  },
});
