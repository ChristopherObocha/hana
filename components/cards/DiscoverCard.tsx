import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import React from 'react';

import { ImageBackground } from 'expo-image';
import { Spacer } from '..';
import { PlusIcon } from 'lucide-react-native';
import { Colors, textStyles } from '@/constants';

type DiscoverCardProps = {
  id: string;
  title: string;
  image: string;
  type: 'hotel' | 'activity' | 'restaurant' | 'attraction';
  description?: string;
  price?: number;
  rating?: number;
  details?: object;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const DiscoverCard = ({
  id,
  title,
  description,
  image,
  type,
  price,
  rating,
  details,
  onPress,
  style,
}: DiscoverCardProps) => {
  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      <ImageBackground
        source={{ uri: image }}
        style={styles.frameParent}
        contentFit="cover">
        <View style={styles.typeWrapper}>
          <Text style={styles.type}>{type}</Text>
        </View>
      </ImageBackground>
      <Spacer size={8} vertical />
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Spacer size={4} vertical />
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.viewMoreText}>View More</Text>
        <Pressable style={styles.addButton}>
          <PlusIcon size={14} color={Colors.light.background} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default DiscoverCard;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  frameParent: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  typeWrapper: {
    position: 'absolute',
    top: 7,
    left: 7,
    boxShadow: '0px 16px 32px rgba(62, 52, 69, 0.1)',
    elevation: 32,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  type: {
    ...textStyles.textBody12,
    color: Colors.light.background,
    textAlign: 'left',
    fontSize: 11,
    lineHeight: 17,
  },

  title: {
    ...textStyles.textHeading16,
    color: Colors.light.textHeading,
    textAlign: 'left',
  },
  description: {
    ...textStyles.textBody12,
    color: Colors.light.textBody,
    textAlign: 'left',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  viewMoreText: {
    ...textStyles.textBody14,
    color: Colors.light.primary,
    textDecorationStyle: 'solid',
    textDecorationColor: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    ...textStyles.textBody14,
    color: Colors.light.primary,
  },
});
