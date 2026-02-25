import { ScrollView, StyleSheet, TextStyle, View } from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Spacer, Text } from "@/components";
import { Colors } from "@/constants";

const EmptyImage = require("@/assets/svgs/empty-trip.svg");

type Segment = "Active" | "Saved" | "Past";

const SEGMENTS: Segment[] = ["Active", "Saved", "Past"];

const EMPTY_CONTENT: Record<Segment, { header: string; subtext: string }> = {
  Active: {
    header: "No active trips!",
    subtext: "Tap the + below to start planning your next adventure!",
  },
  Saved: {
    header: "No saved trips!",
    subtext: "Start browsing for destinations and add them here!",
  },
  Past: {
    header: "No past trips!",
    subtext: "Your completed adventures will show up here. Start planning your next journey!",
  },
};

const TripsIndexScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedSegment, setSelectedSegment] = useState<Segment>("Active");

  const { header, subtext } = EMPTY_CONTENT[selectedSegment];

  const getSegmentStyle = (segment: Segment): TextStyle => ({
    ...styles.segmentedControlText,
    color: selectedSegment === segment ? Colors.light.primary : Colors.light.text,
    borderBottomWidth: selectedSegment === segment ? 2 : 1,
    borderBottomColor:
      selectedSegment === segment ? Colors.light.primary : Colors.light.borderDefault,
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flex: 1 }}
    >
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <Spacer size={12} vertical />
        <View style={styles.header}>
          <Text style={styles.title}>Trips</Text>
        </View>
        <Spacer size={12} vertical />
        <View style={styles.segmentedControlContainer}>
          {SEGMENTS.map((segment) => (
            <Text
              key={segment}
              style={getSegmentStyle(segment)}
              onPress={() => setSelectedSegment(segment)}
            >
              {segment}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.emptyContainer}>
        <Image source={EmptyImage} style={styles.emptyImage} contentFit="contain" />
        <Spacer size={32} vertical />
        <Text style={styles.emptyTitle}>{header}</Text>
        <Spacer size={6} vertical />
        <Text style={styles.emptySubtext}>{subtext}</Text>
      </View>
    </ScrollView>
  );
};

export default TripsIndexScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContainer: {
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,

  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  segmentedControlContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "50%",
  },
  segmentedControlText: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  emptyContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyImage: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.textHeading,
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.light.textBody,
    textAlign: "center",
    maxWidth: 256,
  },
});
