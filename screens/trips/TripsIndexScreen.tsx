import { ScrollView, StyleSheet, TextStyle, View } from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacer, Text } from "@/components";
import { Colors } from "@/constants";

type Segment = "active" | "saved" | "past";

const TripsIndexScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedSegment, setSelectedSegment] = useState<Segment>("active");
  const segments = ["Active", "Saved", "Past"];

  const handleSegmentChange = (segment: Segment) => {
    setSelectedSegment(segment);
  };
  
  const isSelected = (segment: Segment) => {
    return selectedSegment.toLowerCase() === segment.toLowerCase();
  };

  const getSegmentStyle = (segment: Segment) => {
    return {
      ...styles.segmentedControlText,
      color: isSelected(segment) ? Colors.light.primary : Colors.light.text,
      borderBottomWidth: isSelected(segment) ? 2 : 1,
      borderBottomColor: isSelected(segment) ? Colors.light.primary : Colors.light.borderDefault,
    };
  };

  return (
    <ScrollView 
    style={styles.container} 
    contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top }]} 
    showsVerticalScrollIndicator={false}
    // contentInsetAdjustmentBehavior="automatic"  ios only
    >
      <Spacer size={12} vertical />
      <View style={styles.header}>
        <Text style={styles.title}>Trips</Text>
      </View>
      <Spacer size={12} vertical />
      <View style={styles.segmentedControlContainer}>
        {segments.map((segment) => (
          <Text key={segment} style={getSegmentStyle(segment as Segment) as TextStyle} onPress={() => handleSegmentChange(segment as Segment)}>
            {segment}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

export default TripsIndexScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});
