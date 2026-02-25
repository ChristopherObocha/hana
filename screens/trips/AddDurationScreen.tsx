import { View, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { Spacer, Text } from "@/components";
import { Colors, textStyles } from "@/constants";
import {
  Calendar,
  toDateId,
  useDateRange,
} from "@marceloterreiro/flash-calendar";

export default function AddDurationScreen() {
  const {
    calendarActiveDateRanges,
    onCalendarDayPress,
  } = useDateRange();


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} >
      <View style={styles.content}>
        <Text style={styles.title}>Lock in the dates ✈️</Text>
        <Text style={styles.subtitle}>
          Please select your start and end dates.
        </Text>

        <Spacer size={24} vertical />

        <View style={{ flex: 1 }}>
          <Calendar.List
            calendarActiveDateRanges={calendarActiveDateRanges}
            onCalendarDayPress={onCalendarDayPress} 
            calendarMinDateId={toDateId(new Date())}
            calendarMaxDateId={toDateId(new Date(new Date().getFullYear() + 2, 11, 31))}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  footer: {
    padding: 16,
  },
  title: {
    ...textStyles.textHeading20,
    textAlign: "center",
  },
  subtitle: {
    ...textStyles.textBody12,
    textAlign: "center",
    color: Colors.light.textBody,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    ...textStyles.textBody14,
    color: Colors.light.background,
  },
  clearText: {
    ...textStyles.textBody12,
    textAlign: "center",
    color: Colors.light.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});