import React, { useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { format, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';
import { ItineraryDay } from '@/hooks/useItineraryActions'; // adjust path

type Props = {
  days: ItineraryDay[];
  startDate?: string;
  endDate?: string;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPressPlus: () => void;
};

export const DayTabBar = ({
  days,
  startDate,
  endDate,
  selectedDate,
  onSelectDate,
  onPressPlus,
}: Props) => {
  const scrollRef = useRef<ScrollView>(null);

  // Build date range if trip has defined dates
  // Otherwise fall back to showing existing days
  const dateRange: string[] =
    startDate && endDate
      ? eachDayOfInterval({
          start: parseISO(startDate),
          end: parseISO(endDate),
        }).map(d => format(d, 'yyyy-MM-dd'))
      : days.map(d => d.date ?? `day-${d.day_number}`);

  const daysByDate = Object.fromEntries(days.map(d => [d.date, d]));

  // Auto-scroll to selected tab
  useEffect(() => {
    if (!selectedDate) return;
    const index = dateRange.indexOf(selectedDate);
    if (index !== -1) {
      // Each tab is ~64px wide, rough offset
      scrollRef.current?.scrollTo({ x: Math.max(0, index * 64 - 32), animated: true });
    }
  }, [selectedDate]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.container}
    >
      {dateRange.map((date, index) => {
        const isReal = !date.startsWith('day-');
        const hasDay = !!daysByDate[date];
        const isSelected = date === selectedDate;
        const parsed = isReal ? parseISO(date) : null;

        // Label: if real date use Mon/12 format, else Day N
        const topLabel = parsed ? format(parsed, 'EEE') : `Day`;
        const bottomLabel = parsed
          ? format(parsed, 'dd')
          : `${index + 1}`;

        return (
          <Pressable
            key={date}
            onPress={() => onSelectDate(date)}
            style={({ pressed }) => [
              styles.tab,
              isSelected && styles.tabSelected,
              pressed && styles.tabPressed,
            ]}
          >
            <Text
              style={[
                styles.weekday,
                isSelected && styles.textSelected,
                !hasDay && !isSelected && styles.textMuted,
              ]}
            >
              {topLabel}
            </Text>
            <Text
              style={[
                styles.dayNum,
                isSelected && styles.textSelected,
                !hasDay && !isSelected && styles.textMuted,
              ]}
            >
              {bottomLabel}
            </Text>
            {/* Dot indicator — shows if day has been created */}
            <View
              style={[
                styles.dot,
                hasDay ? styles.dotActive : styles.dotInactive,
                isSelected && styles.dotSelected,
              ]}
            />
          </Pressable>
        );
      })}

      {/* Plus button — always last */}
      <Pressable
        onPress={onPressPlus}
        style={({ pressed }) => [styles.plusTab, pressed && styles.tabPressed]}
      >
        <Text style={styles.plusIcon}>+</Text>
      </Pressable>
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
// Adjust colors to match your design system

const TAB_WIDTH = 56;
const SELECTED_BG = '#1A1A1A';   // your primary/accent color
const SELECTED_TEXT = '#FFFFFF';
const MUTED_TEXT = '#AAAAAA';
const DEFAULT_TEXT = '#333333';

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    width: TAB_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    gap: 2,
  },
  tabSelected: {
    backgroundColor: SELECTED_BG,
  },
  tabPressed: {
    opacity: 0.7,
  },
  weekday: {
    fontSize: 11,
    fontWeight: '500',
    color: DEFAULT_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNum: {
    fontSize: 17,
    fontWeight: '700',
    color: DEFAULT_TEXT,
  },
  textSelected: {
    color: SELECTED_TEXT,
  },
  textMuted: {
    color: MUTED_TEXT,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  dotActive: {
    backgroundColor: SELECTED_BG,
  },
  dotInactive: {
    backgroundColor: 'transparent',
  },
  dotSelected: {
    backgroundColor: SELECTED_TEXT,
  },
  plusTab: {
    width: TAB_WIDTH,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  plusIcon: {
    fontSize: 22,
    fontWeight: '300',
    color: MUTED_TEXT,
  },
});