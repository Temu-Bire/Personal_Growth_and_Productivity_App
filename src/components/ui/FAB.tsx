import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface FABProps {
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  size?: number;
  style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({
  onPress,
  iconName = 'add',
  size = 54,
  style,
}) => {
  const { isDark, shadows } = useTheme();

  const bgColor = isDark ? '#FFFFFF' : '#09090B';
  const iconColor = isDark ? '#09090B' : '#FFFFFF';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.fab,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          ...shadows.floating,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Add"
    >
      <Ionicons name={iconName} size={size * 0.5} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
});
