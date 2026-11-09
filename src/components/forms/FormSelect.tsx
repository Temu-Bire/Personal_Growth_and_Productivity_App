import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export interface SelectOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export interface FormSelectProps {
  label: string;
  required?: boolean;
  value: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  required,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  error,
  containerStyle,
}) => {
  const { colors, typography, radius } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Label */}
      <View style={styles.labelRow}>
        <Text style={[styles.label, typography.captionBold, { color: colors.textSecondary }]}>
          {label.toUpperCase()} {required && <Text style={{ color: colors.danger }}>*</Text>}
        </Text>
      </View>

      {/* Select Box */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={[
          styles.selectBox,
          {
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.md,
          },
        ]}
      >
        <View style={styles.selectedContent}>
          {selectedOption?.icon && (
            <Ionicons
              name={selectedOption.icon}
              size={18}
              color={selectedOption.color || colors.primary}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              typography.body,
              { color: selectedOption ? colors.textPrimary : colors.textMuted },
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>

        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, typography.caption, { color: colors.danger }]}>
          {error}
        </Text>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdownSheet,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                  },
                ]}
              >
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[typography.h3, { color: colors.textPrimary }]}>
                    {label}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                  {options.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        activeOpacity={0.7}
                        onPress={() => {
                          onSelect(option.value);
                          setModalVisible(false);
                        }}
                        style={[
                          styles.optionItem,
                          {
                            borderRadius: radius.md,
                            backgroundColor: isSelected
                              ? colors.accentMint
                              : 'transparent',
                          },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          {option.icon && (
                            <Ionicons
                              name={option.icon}
                              size={18}
                              color={option.color || colors.primary}
                              style={{ marginRight: 10 }}
                            />
                          )}
                          <Text
                            style={[
                              typography.bodyBold,
                              {
                                color: isSelected
                                  ? colors.primary
                                  : colors.textPrimary,
                              },
                            ]}
                          >
                            {option.label}
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    letterSpacing: 0.5,
    fontSize: 12,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dropdownSheet: {
    width: '100%',
    maxHeight: 400,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  optionsList: {
    padding: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
});

