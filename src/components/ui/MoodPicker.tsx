import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface MoodPickerProps {
  value: number; // 1 to 5
  onChange: (val: number) => void;
}

const MOODS = [
  { value: 1, emoji: '😢', label: 'Terrible' },
  { value: 2, emoji: '😔', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Great' },
];

export const MoodPicker: React.FC<MoodPickerProps> = ({ value, onChange }) => {
  const { colors, radius } = useTheme();

  return (
    <View style={styles.container}>
      {MOODS.map((item) => {
        const isSelected = value === item.value;
        return (
          <TouchableOpacity
            key={item.value}
            activeOpacity={0.7}
            onPress={() => onChange(item.value)}
            style={[
              styles.moodItem,
              {
                borderRadius: radius.xl,
                backgroundColor: isSelected ? colors.accentMint : colors.inputBg,
                borderColor: isSelected ? colors.primary : colors.border,
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  moodItem: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
});
