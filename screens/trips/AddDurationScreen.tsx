import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import React, { useMemo } from "react";
import dayjs from 'dayjs'
import { ArrowRight } from 'lucide-react-native'


import { Spacer, Text } from "@/components";
import { Colors, textStyles } from "@/constants";
import {
  Calendar,
  toDateId,
  useDateRange,
} from "@marceloterreiro/flash-calendar";
import { useTrips } from "@/context/TripsContext";

export default function AddDurationScreen() {
  const { updateTripDetails, isLoading } = useTrips();
  const {
    calendarActiveDateRanges,
    onCalendarDayPress,
    dateRange
  } = useDateRange();

  // const handleConfirm = async () => {
  //   if (!calendarActiveDateRanges.startId || !calendarActiveDateRanges.endId) {
  //     Alert.alert("Select dates", "Please select a start and end date.");
  //     return;
  //   }
  //   try {
  //     await updateTripDetails(tripId, { start_date: calendarActiveDateRanges.startId, end_date: calendarActiveDateRanges.endId });
  //   }
  // };

  
  const startDate = useMemo(() => {
    return dateRange?.startId ?? null;
  }, [dateRange]);
  
  const endDate = useMemo(() => {
    return dateRange?.endId ?? null;
  }, [dateRange]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, paddingTop: 32 }} >
      <View style={styles.content}>
        <Text style={styles.title}>Lock in the dates ✈️</Text>
        <Text style={styles.subtitle}>
          Please select your start and end dates.
        </Text>

        <Spacer size={32} vertical />

        <View style={{ flex: 1, height: 450, backgroundColor: Colors.light.borderDefault, paddingVertical: 16, borderRadius: 12 }}>
          <Calendar.List
            calendarActiveDateRanges={calendarActiveDateRanges}
            onCalendarDayPress={onCalendarDayPress} 
            calendarMinDateId={toDateId(new Date())}
            calendarMaxDateId={toDateId(new Date(new Date().getFullYear() + 2, 11, 31))}
          />
        </View>

        <Spacer size={32} vertical />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {startDate && (
            <>
              <Text style={styles.dayText}>{dayjs(startDate).format('DD MMM')}</Text>
              <ArrowRight size={24} color={Colors.light.primary} />
            </>
          )}
          {startDate && endDate && (
            <>
              <Text style={styles.dayText}>{dayjs(endDate).format('DD MMM')}</Text>
            </>
          )}
        </View>

        <Spacer size={8} vertical />

        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>
            {isLoading ? "Saving..." : "Confirm Dates"}
          </Text>
        </TouchableOpacity>
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
  dayText: {
    ...textStyles.textBody14,
    textAlign: "center",
    color: Colors.light.primary,
    fontFamily: 'BricolageGrotesque_600SemiBold',
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