import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface BarChartProps {
  data: number[];
  width?: number;
  height?: number;
  positiveColor?: string;
  negativeColor?: string;
  barWidth?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width = Dimensions.get('window').width - 64,
  height = 100,
  positiveColor,
  negativeColor,
  barWidth = 10,
}) => {
  const { colors } = useTheme();
  const posCol = positiveColor || colors.primary;
  const negCol = negativeColor || colors.danger;

  if (!data || data.length === 0) {
    return <View style={{ width, height }} />;
  }

  const maxAbs = Math.max(...data.map(Math.abs), 1);
  const baseline = height / 2;
  const availableHeight = height / 2 - 8;
  const step = width / (data.length + 1);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* Baseline */}
        <Line
          x1={0}
          y1={baseline}
          x2={width}
          y2={baseline}
          stroke={colors.border}
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {data.map((val, idx) => {
          const x = (idx + 1) * step - barWidth / 2;
          const barHeight = Math.max(4, (Math.abs(val) / maxAbs) * availableHeight);
          const y = val >= 0 ? baseline - barHeight : baseline;
          const color = val >= 0 ? posCol : negCol;

          return (
            <Rect
              key={idx}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={3}
            />
          );
        })}
      </Svg>
    </View>
  );
};
