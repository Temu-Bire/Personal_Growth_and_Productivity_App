import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
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
  const { colors, radius, typography } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderRadius: radius.round,
          backgroundColor: selected ? colors.primary : colors.inputBg,
          borderColor: selected ? colors.primary : colors.border,
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
            color: selected ? '#FFFFFF' : colors.textSecondary,
            marginLeft: icon ? 6 : 0,
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
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
  },
});

