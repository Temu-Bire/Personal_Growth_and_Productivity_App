import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface FormRatingSliderProps {
  label: string;
  value: number; // 1 to 5
  onChange: (rating: number) => void;
  lowLabel?: string;
  highLabel?: string;
  emojis?: string[];
  containerStyle?: StyleProp<ViewStyle>;
}

const DEFAULT_EMOJIS = ['1', '2', '3', '4', '5'];

export const FormRatingSlider: React.FC<FormRatingSliderProps> = ({
  label,
  value,
  onChange,
  lowLabel = 'Low',
  highLabel = 'High',
  emojis,
  containerStyle,
}) => {
  const { colors, typography, radius } = useTheme();

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, typography.captionBold, { color: colors.textSecondary }]}>
          {label.toUpperCase()}
        </Text>
        <Text style={[typography.captionBold, { color: colors.primary }]}>
          {value} / 5
        </Text>
      </View>

      <View style={styles.buttonsRow}>
        {[1, 2, 3, 4, 5].map((num) => {
          const isSelected = value === num;
          const displayLabel = emojis ? emojis[num - 1] : String(num);

          return (
            <TouchableOpacity
              key={num}
              activeOpacity={0.7}
              onPress={() => onChange(num)}
              style={[
                styles.rateBtn,
                {
                  borderRadius: radius.md,
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primary : colors.inputBg,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  typography.bodyBold,
                  { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                {displayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.subLabelsRow}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{lowLabel}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{highLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    letterSpacing: 0.5,
    fontSize: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rateBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 2,
  },
});

