import { Pressable, View, StyleSheet } from "react-native";
import React, { useCallback, useEffect } from "react";
import { ImageBackground } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";


import { router, useLocalSearchParams } from "expo-router";
import { useTripsContext } from "@/context/TripsContext";
import { Spacer, Text } from "@/components";
import { Colors, textStyles } from "@/constants/theme";

export default function TripDetailsScreen() {
  const { tripId } = useLocalSearchParams();
  const { trip, fetchTrip } = useTripsContext();
  const insets = useSafeAreaInsets();

  const callFetchTrip = useCallback(() => {
    fetchTrip(tripId as string);
  }, [fetchTrip, tripId]);

  useEffect(() => {
    callFetchTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: trip?.cover_image_url }} 
        style={styles.backgroundImage}
        // imageStyle={{ height: 350 }}
        contentFit="cover"
      >
        <View style={[styles.header, { paddingTop: insets.top + 24 }] }>
          <Text style={styles.title}>{trip?.name}</Text>
        </View>
      </ImageBackground>
      <Spacer size={16} vertical />


      <View style={styles.content}>
        <Text style={styles.title}>{trip?.name}</Text>
        <Spacer size={8} vertical />

        <View style={styles.infoButtonContainer}>
          <Pressable onPress={() => router.push(`/(tabs)/(trips)/${trip?.id}/add-destination`)} style={styles.infoButton}>
            <Text style={styles.infoButtonText}>📍 Add Destination</Text>
          </Pressable>
        </View>

        <Spacer size={8} vertical />
        <Text style={styles.description}>{trip?.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    height: 350,
    width: "100%",
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    padding: 16,
  },
  title: {
    ...textStyles.textHeading16,
  },
  description: {
    ...textStyles.textBody12,
  },
  infoButtonContainer: {
    maxWidth: "50%",
  },
  infoButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.borderDefault,
    width: "100%",
  },
  infoButtonText: {
    ...textStyles.textBody12,
  },
});