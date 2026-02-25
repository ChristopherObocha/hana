import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageBackground } from 'expo-image';

import { Spacer, Text } from '@/components';
import { useTrips } from '@/context/TripsContext';
import { useAuth } from '@/context/AuthContext';
import { Colors, textStyles } from '@/constants';

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { activeTrip, loadTrip, clearActiveTrip, deleteTrip, leaveTrip, isLoading } = useTrips();

  // Load trip when screen comes into focus, clear on blur
  useFocusEffect(
    useCallback(() => {
      loadTrip(tripId);
      return () => clearActiveTrip();
    }, [tripId])
  );

  const isOwner = activeTrip?.owner_id === user?.id;

  const handleDelete = () => {
    Alert.alert('Delete Trip', 'This will permanently delete the trip for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTrip(tripId);
          router.back();
        },
      },
    ]);
  };

  const handleLeave = () => {
    Alert.alert('Leave Trip', 'You will lose access to this trip.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          await leaveTrip(tripId);
          router.back();
        },
      },
    ]);
  };

  if (isLoading || !activeTrip) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const details = activeTrip.trip_details;


  return (
    <View style={styles.container}>
      <ImageBackground 
        source={activeTrip?.cover_image_url ? { uri: activeTrip?.cover_image_url } : undefined} 
        style={styles.backgroundImage}
        // imageStyle={{ height: 350 }}
        contentFit="cover"
      >
        <View style={[styles.header, { paddingTop: insets.top + 24 }] }>
          <Text style={styles.title}>{activeTrip?.name}</Text>
        </View>
      </ImageBackground>
      <Spacer size={16} vertical />


      <View style={styles.content}>
        <Text style={styles.title}>{activeTrip?.name}</Text>
        <Spacer size={8} vertical />

        <View style={styles.infoButtonContainer}>
          <Pressable onPress={() => router.push(`/(tabs)/(trips)/${activeTrip?.id}/add-destination`)} style={styles.infoButton}>
            <Text style={styles.infoButtonText}>📍 Add Destination</Text>
          </Pressable>
        </View>

        <Spacer size={8} vertical />
        <Text style={styles.description}>{activeTrip?.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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