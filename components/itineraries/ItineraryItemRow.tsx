import React from 'react';
import {
  Pressable,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { ItineraryItem } from '@/hooks/useItineraryActions';

type Props = {
  item: ItineraryItem;
  onPress: () => void;
};

export const ItineraryItemRow = ({ item, onPress }: Props) => {
  const hasTime = item.start_time || item.end_time;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {/* Time column */}
      <View style={styles.timeCol}>
        {item.start_time ? (
          <>
            <Text style={styles.timeText}>{formatTime(item.start_time)}</Text>
            {item.end_time && (
              <Text style={styles.timeTextEnd}>{formatTime(item.end_time)}</Text>
            )}
          </>
        ) : (
          <Text style={styles.timeTextMuted}>—</Text>
        )}
      </View>

      {/* Timeline line + dot */}
      <View style={styles.timelineCol}>
        <View style={styles.dot} />
        <View style={styles.line} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          {item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {item.location && (
              <Text style={styles.location} numberOfLines={1}>
                📍 {item.location}
              </Text>
            )}
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 4,
    minHeight: 80,
  },
  pressed: {
    opacity: 0.75,
  },

  // Time column — fixed width
  timeCol: {
    width: 56,
    paddingTop: 4,
    alignItems: 'flex-end',
    paddingRight: 8,
    gap: 2,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  timeTextEnd: {
    fontSize: 10,
    color: '#888888',
  },
  timeTextMuted: {
    fontSize: 12,
    color: '#CCCCCC',
  },

  // Timeline dot + line
  timelineCol: {
    width: 20,
    alignItems: 'center',
    paddingTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1A1A1A',
    zIndex: 1,
  },
  line: {
    flex: 1,
    width: 1.5,
    backgroundColor: '#E5E5E5',
    marginTop: 2,
  },

  // Card content
  content: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 100,
  },
  textBlock: {
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  location: {
    fontSize: 12,
    color: '#666666',
  },
  description: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
  },
});