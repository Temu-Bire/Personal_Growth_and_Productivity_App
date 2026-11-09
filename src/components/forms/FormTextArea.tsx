import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface FormTextAreaProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  maxLength?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  required,
  error,
  helperText,
  maxLength,
  containerStyle,
  value,
  onChangeText,
  style,
  numberOfLines = 4,
  ...rest
}) => {
  const { colors, typography, radius } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Label Row */}
      <View style={styles.labelRow}>
        <Text style={[styles.label, typography.captionBold, { color: colors.textSecondary }]}>
          {label.toUpperCase()} {required && <Text style={{ color: colors.danger }}>*</Text>}
        </Text>
        {maxLength && (
          <Text style={[styles.counter, typography.caption, { color: colors.textMuted }]}>
            {(value?.length || 0)}/{maxLength}
          </Text>
        )}
      </View>

      {/* Input Box */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBg,
            borderColor: error
              ? colors.danger
              : isFocused
              ? colors.primary
              : colors.border,
            borderRadius: radius.md,
          },
        ]}
      >
        <TextInput
          multiline
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
          style={[
            styles.input,
            typography.body,
            { color: colors.textPrimary, minHeight: numberOfLines * 22 },
            style,
          ]}
          {...rest}
        />
      </View>

      {/* Helper / Error Text */}
      {error ? (
        <Text style={[styles.errorText, typography.caption, { color: colors.danger }]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, typography.caption, { color: colors.textMuted }]}>
          {helperText}
        </Text>
      ) : null}
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
    marginBottom: 6,
  },
  label: {
    letterSpacing: 0.5,
    fontSize: 12,
  },
  counter: {
    fontSize: 11,
  },
  inputContainer: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    padding: 0,
    fontSize: 15,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
  },
});
