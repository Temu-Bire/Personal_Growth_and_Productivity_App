import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export type Priority = 'high' | 'medium' | 'low';

export interface FormPriorityPickerProps {
  label?: string;
  value: Priority;
  onChange: (priority: Priority) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const PRIORITIES: { key: Priority; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: 'high', label: 'High', icon: 'flame', color: '#EF4444' },
  { key: 'medium', label: 'Medium', icon: 'remove-outline', color: '#EAB308' },
  { key: 'low', label: 'Low', icon: 'arrow-down', color: '#3B82F6' },
];

export const FormPriorityPicker: React.FC<FormPriorityPickerProps> = ({
  label = 'PRIORITY',
  value,
  onChange,
  containerStyle,
}) => {
  const { colors, typography, radius } = useTheme();

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={[styles.label, typography.captionBold, { color: colors.textSecondary }]}>
          {label.toUpperCase()}
        </Text>
      )}

      <View style={styles.row}>
        {PRIORITIES.map((p) => {
          const isSelected = value === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              activeOpacity={0.7}
              onPress={() => onChange(p.key)}
              style={[
                styles.pill,
                {
                  borderRadius: radius.md,
                  borderColor: isSelected ? p.color : colors.border,
                  backgroundColor: isSelected ? `${p.color}18` : colors.inputBg,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <Ionicons
                name={p.icon}
                size={16}
                color={isSelected ? p.color : colors.textMuted}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  typography.captionBold,
                  { color: isSelected ? p.color : colors.textSecondary },
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    letterSpacing: 0.5,
    fontSize: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1.5,
  },
});

