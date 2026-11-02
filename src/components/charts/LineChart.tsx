import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

interface LineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = Dimensions.get('window').width - 64,
  height = 140,
  color,
  showDots = true,
}) => {
  const { colors } = useTheme();
  const strokeColor = color || colors.primary;

  if (!data || data.length < 2) {
    return <View style={{ width, height }} />;
  }

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const paddingHorizontal = 16;
  const paddingVertical = 16;
  const graphWidth = width - paddingHorizontal * 2;
  const graphHeight = height - paddingVertical * 2;

  const points = data.map((val, idx) => {
    const x = paddingHorizontal + (idx / (data.length - 1)) * graphWidth;
    const y = height - paddingVertical - ((val - minVal) / range) * graphHeight;
    return { x, y };
  });

  // Build SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    // Smooth bezier curve control points
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    pathD += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  // Closed area for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>
        {/* Gradient fill */}
        <Path d={areaD} fill="url(#lineGrad)" />
        {/* Stroke line */}
        <Path d={pathD} stroke={strokeColor} strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* Points */}
        {showDots &&
          points.map((pt, i) => (
            <Circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={i === points.length - 1 ? 5 : 3}
              fill={strokeColor}
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          ))}
      </Svg>
    </View>
  );
};
