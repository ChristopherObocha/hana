import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';

import { Colors } from '@/constants';
import useHotelAction, { Hotel } from '@/hooks/useHotelAction';
import { FlashList } from '@shopify/flash-list';
import { Spacer, DiscoverCard } from '@/components';

export default function HotelsContainer({
  placeId,
  groupId,
}: {
  placeId: string | null | undefined;
  groupId: string;
}) {
  const { hotels, fetchHotels, isLoading, error } = useHotelAction();

  useEffect(() => {
    if (placeId) {
      fetchHotels(placeId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

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
      <FlashList
        data={hotels}
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
              onPress={() => {}}
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
