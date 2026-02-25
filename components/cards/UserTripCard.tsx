import { View, Text, Pressable, ImageBackground, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { router } from "expo-router";

import type { Trip } from "@/hooks/useTripActions";
import { useAuth } from "@/context/AuthContext";
import { textStyles, Colors } from "@/constants";

type UserTripCardProps = {
  trip: Trip;
};

export default function UserTripCard({ trip }: UserTripCardProps) {
  const { user } = useAuth();

  const role = useMemo(() => {
    let userRole = trip.group_members?.find(member => member.user_id === user?.id)?.role ?? 'Member';
    if (userRole === 'owner') return 'Leader';
    if (userRole === 'admin') return 'Co-Leader';
    return 'Member';
  }, [trip.group_members, user?.id]);

  return (
    <Pressable onPress={() => router.push(`/(tabs)/(trips)/${trip.id}`)} style={styles.container}>
      <ImageBackground source={trip.cover_image_url ? { uri: trip.cover_image_url } : undefined} style={styles.image} resizeMode="cover">
        <View style={styles.content}>
          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>{role}</Text>
          </View>


          <View style={styles.infoContainer}>
            <View style={{ gap: 4 }}>
              <Text style={styles.title}>{trip.name}</Text>
              {trip.trip_details?.destination_label && (
                <Text style={styles.subtext}>📍 {trip.trip_details?.destination_label}</Text>
              )}
            </View>
          </View>
        </View>
      </ImageBackground>  
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: "100%",
    height: 200,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#00000073',
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    ...textStyles.textHeading16,
    color: Colors.light.background,
  },
  subtext: {
    ...textStyles.textBody12,
    color: Colors.light.background,
  },

  roleContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#000000A6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    ...textStyles.textBody12,
    fontSize: 12,
    color: Colors.light.background,
  },

  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
