import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  color?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  size = 22,
  color,
}) => {
  const { colors, radius } = useTheme();

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fail-safe
    }
    onToggle();
  };

  const activeBg = color || '#22C55E';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.touchable,
        {
          width: Math.max(38, size + 14),
          height: Math.max(38, size + 14),
        },
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: radius.sm,
            borderColor: checked ? activeBg : colors.border,
            backgroundColor: checked ? activeBg : colors.inputBg,
          },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={size - 6} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
