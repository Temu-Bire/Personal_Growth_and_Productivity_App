import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 100
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size,
  strokeWidth,
  progress,
  color,
  trackColor,
  children,
  style,
}) => {
  const { colors } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (circumference * clampedProgress) / 100;

  const activeColor = color || colors.primary;
  const inactiveColor = trackColor || colors.border;

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={inactiveColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Active Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children && <View style={StyleSheet.absoluteFill}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  svg: {
    transform: [{ rotateZ: '0deg' }],
  },
});
