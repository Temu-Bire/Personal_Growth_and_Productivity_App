import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { CustomizationRepository } from '../customization.repository';
import { CustomField } from '../customization.types';

interface CustomFieldsSectionProps {
  entityType: string;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export const CustomFieldsSection: React.FC<CustomFieldsSectionProps> = ({
  entityType,
  values,
  onChange,
}) => {
  const { colors, typography } = useTheme();
  const [fields, setFields] = useState<CustomField[]>([]);

  useEffect(() => {
    const list = CustomizationRepository.getFields(entityType).filter(
      (f) => f.is_system === 0 && f.is_hidden === 0
    );
    setFields(list);
  }, [entityType]);

  if (fields.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="sparkles-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={[typography.captionBold, { color: colors.primary, letterSpacing: 0.5 }]}>
          CUSTOM FIELDS ({fields.length})
        </Text>
      </View>

      {fields.map((field) => {
        let options: string[] = [];
        if (field.options_json) {
          try {
            options = JSON.parse(field.options_json);
          } catch {}
        }

        const currentValue = values[field.field_key] ?? field.default_value ?? '';

        return (
          <View key={field.id} style={styles.fieldItem}>
            <View style={styles.labelRow}>
              <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
                {field.label.toUpperCase()}
              </Text>
              {field.is_required === 1 && (
                <Text style={{ color: colors.danger, marginLeft: 4 }}>*</Text>
              )}
            </View>

            {field.help_text ? (
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 4 }]}>
                {field.help_text}
              </Text>
            ) : null}

            {field.field_type === 'long_text' ? (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    height: 70,
                    textAlignVertical: 'top',
                  },
                ]}
                multiline
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                placeholderTextColor={colors.textMuted}
                value={currentValue}
                onChangeText={(text) => onChange(field.field_key, text)}
              />
            ) : field.field_type === 'checkbox' || field.field_type === 'toggle' ? (
              <View style={styles.switchRow}>
                <Switch
                  value={Boolean(currentValue)}
                  onValueChange={(val) => onChange(field.field_key, val)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
                <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 8 }]}>
                  {currentValue ? 'Yes / Enabled' : 'No / Disabled'}
                </Text>
              </View>
            ) : field.field_type === 'dropdown' || field.field_type === 'multi_select' ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                {options.map((opt) => {
                  const isSelected = currentValue === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => onChange(field.field_key, opt)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.inputBg,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          typography.captionBold,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                keyboardType={
                  field.field_type === 'number'
                    ? 'number-pad'
                    : field.field_type === 'decimal'
                    ? 'decimal-pad'
                    : field.field_type === 'url'
                    ? 'url'
                    : 'default'
                }
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                placeholderTextColor={colors.textMuted}
                value={currentValue}
                onChangeText={(text) => onChange(field.field_key, text)}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    marginBottom: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB22',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldItem: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
});

