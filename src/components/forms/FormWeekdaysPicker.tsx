import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface FormWeekdaysPickerProps {
  label?: string;
  selectedDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  onChange: (days: number[]) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const WEEKDAYS = [
  { day: 1, label: 'M' },
  { day: 2, label: 'T' },
  { day: 3, label: 'W' },
  { day: 4, label: 'T' },
  { day: 5, label: 'F' },
  { day: 6, label: 'S' },
  { day: 0, label: 'S' },
];

export const FormWeekdaysPicker: React.FC<FormWeekdaysPickerProps> = ({
  label = 'ACTIVE DAYS',
  selectedDays,
  onChange,
  containerStyle,
}) => {
  const { colors, typography } = useTheme();

  const handleToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Keep at least one day
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={[styles.label, typography.captionBold, { color: colors.textSecondary }]}>
          {label.toUpperCase()}
        </Text>
      )}

      <View style={styles.daysRow}>
        {WEEKDAYS.map((w, index) => {
          const isSelected = selectedDays.includes(w.day);
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => handleToggle(w.day)}
              style={[
                styles.dayCircle,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primary : colors.inputBg,
                },
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              <Text
                style={[
                  typography.captionBold,
                  { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                {w.label}
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
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

