import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onToggle, size = 24 }) => {
  const { colors, radius } = useTheme();

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fail-safe
    }
    onToggle();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.touchable,
        {
          width: Math.max(44, size + 16),
          height: Math.max(44, size + 16),
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
            borderColor: checked ? colors.primary : colors.textMuted,
            backgroundColor: checked ? colors.primary : 'transparent',
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
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
