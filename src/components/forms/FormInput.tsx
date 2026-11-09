import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export interface FormInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  required,
  error,
  helperText,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  value,
  onChangeText,
  style,
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
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={isFocused ? colors.primary : colors.textMuted}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            typography.body,
            { color: colors.textPrimary },
            style,
          ]}
          {...rest}
        />

        {value && value.length > 0 && !rightIcon && (
          <TouchableOpacity
            onPress={() => onChangeText?.('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.clearBtn}
          >
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.clearBtn}
          >
            <Ionicons name={rightIcon} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
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
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    letterSpacing: 0.5,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
  },
  clearBtn: {
    marginLeft: 6,
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
