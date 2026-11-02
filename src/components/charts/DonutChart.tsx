import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 160,
  strokeWidth = 22,
  centerLabel,
  centerValue,
}) => {
  const { colors, typography } = useTheme();

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {/* Background Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.inputBg}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {total > 0 &&
              segments.map((segment, index) => {
                const strokeDasharray = `${(segment.value / total) * circumference} ${circumference}`;
                const strokeDashoffset = -currentOffset;
                currentOffset += (segment.value / total) * circumference;

                return (
                  <Circle
                    key={index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                );
              })}
          </G>
        </Svg>

        <View style={styles.centerText}>
          {centerValue && (
            <Text style={[styles.centerVal, typography.h2, { color: colors.textPrimary }]}>
              {centerValue}
            </Text>
          )}
          {centerLabel && (
            <Text style={[styles.centerLbl, typography.caption, { color: colors.textSecondary }]}>
              {centerLabel}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerVal: {
    fontWeight: '700',
  },
  centerLbl: {
    marginTop: 2,
  },
});

