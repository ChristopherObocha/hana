import { View, Text, Pressable, ImageBackground, StyleSheet } from "react-native";
import React from "react";
import type { Trip } from "@/hooks/useTripActions";
import { router } from "expo-router";
import { textStyles } from "@/constants/theme";

type UserTripCardProps = {
  trip: Trip;
};

export default function UserTripCard({ trip }: UserTripCardProps) {
  return (
    <Pressable onPress={() => router.push(`/(tabs)/(trips)/${trip.id}`)} style={styles.container}>
      <ImageBackground source={trip.cover_image_url ? { uri: trip.cover_image_url } : undefined} style={styles.image} resizeMode="cover">
        <View style={styles.content}>
          <Text style={styles.title}>{trip.name}</Text>
          <Text style={styles.description}>{trip.description}</Text>
        </View>
      </ImageBackground>  
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    ...textStyles.textHeading16,
  },
  description: {
    ...textStyles.textBody12,
  },
});
