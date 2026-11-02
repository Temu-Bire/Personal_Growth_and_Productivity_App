import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ProgressBarProps {
  progress: number; // 0 to 100 or 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color,
  backgroundColor,
  style,
}) => {
  const { colors, radius } = useTheme();

  // Normalize progress to 0-100%
  const normalizedProgress = progress <= 1 && progress > 0 ? progress * 100 : Math.min(100, Math.max(0, progress));
  const fillColor = color || colors.primary;
  const trackColor = backgroundColor || colors.accentMint;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: radius.round,
          backgroundColor: trackColor,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${normalizedProgress}%`,
            backgroundColor: fillColor,
            borderRadius: radius.round,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
