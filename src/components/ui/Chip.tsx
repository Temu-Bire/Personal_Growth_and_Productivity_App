import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  style,
}) => {
  const { colors, radius, typography, isDark } = useTheme();

  const selectedBg = isDark ? '#FFFFFF' : '#18181B';
  const selectedText = isDark ? '#09090B' : '#FFFFFF';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderRadius: radius.round,
          backgroundColor: selected ? selectedBg : colors.inputBg,
          borderColor: selected ? selectedBg : colors.border,
          borderWidth: 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon}
      <Text
        style={[
          styles.text,
          typography.chip,
          {
            color: selected ? selectedText : colors.textSecondary,
            marginLeft: icon ? 6 : 0,
            fontWeight: selected ? '700' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
  },
});
