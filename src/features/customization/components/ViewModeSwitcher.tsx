import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { ViewMode } from '../customization.types';

interface ViewModeSwitcherProps {
  pageKey: string;
}

interface ViewModeOption {
  mode: ViewMode;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
}

const VIEW_MODES: ViewModeOption[] = [
  {
    mode: 'card',
    icon: 'albums-outline',
    label: 'Card View',
    description: 'Detailed cards with all badges and metrics',
  },
  {
    mode: 'list',
    icon: 'list-outline',
    label: 'List View',
    description: 'Clean, structured rows with chevron navigation',
  },
  {
    mode: 'compact',
    icon: 'reorder-two-outline',
    label: 'Compact View',
    description: 'Dense list to view more items on one screen',
  },
  {
    mode: 'grid',
    icon: 'grid-outline',
    label: 'Grid View',
    description: '2-column side-by-side card grid',
  },
];

export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({ pageKey }) => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentMode: ViewMode = useCustomizationStore(
    (s) => s.pageLayouts[pageKey]?.viewMode || 'card'
  );
  const updatePageLayout = useCustomizationStore((s) => s.updatePageLayout);

  const activeOption = VIEW_MODES.find((m) => m.mode === currentMode) || VIEW_MODES[0];

  const handleSelectMode = (mode: ViewMode) => {
    updatePageLayout(pageKey, { viewMode: mode });
    setIsOpen(false);
  };

  const handleOpenSettings = () => {
    setIsOpen(false);
    navigation.navigate('LayoutSettingsScreen');
  };

  return (
    <View style={styles.wrapper}>
      {/* Compact Dropdown Trigger Button (won't hide the + icon) */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setIsOpen(true)}
        style={[
          styles.triggerBtn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`View Mode: ${activeOption.label}. Tap to change.`}
      >
        <Ionicons name={activeOption.icon} size={18} color={colors.primary} />
        <Ionicons
          name="chevron-down"
          size={12}
          color={colors.textSecondary}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {/* Dropdown / Modal Selector */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                  },
                ]}
              >
                {/* Dropdown Header */}
                <View style={[styles.menuHeader, { borderBottomColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name="layers-outline"
                      size={18}
                      color={colors.primary}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[typography.h3, { color: colors.textPrimary }]}>
                      View Mode
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsOpen(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Options List */}
                <View style={styles.optionsList}>
                  {VIEW_MODES.map((option) => {
                    const isSelected = option.mode === currentMode;
                    return (
                      <TouchableOpacity
                        key={option.mode}
                        activeOpacity={0.7}
                        onPress={() => handleSelectMode(option.mode)}
                        style={[
                          styles.optionItem,
                          {
                            borderRadius: radius.md,
                            backgroundColor: isSelected
                              ? colors.accentMint
                              : 'transparent',
                          },
                        ]}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                      >
                        <View
                          style={[
                            styles.optionIconBox,
                            {
                              backgroundColor: isSelected
                                ? colors.primary
                                : colors.inputBg,
                            },
                          ]}
                        >
                          <Ionicons
                            name={option.icon}
                            size={18}
                            color={isSelected ? '#FFFFFF' : colors.textPrimary}
                          />
                        </View>

                        <View style={styles.optionTextCol}>
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
                          <Text
                            style={[
                              typography.caption,
                              {
                                color: isSelected
                                  ? colors.primary
                                  : colors.textSecondary,
                                marginTop: 1,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {option.description}
                          </Text>
                        </View>

                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Footer Settings Action */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleOpenSettings}
                  style={[
                    styles.menuFooter,
                    {
                      borderTopColor: colors.border,
                      backgroundColor: colors.inputBg,
                      borderBottomLeftRadius: radius.lg,
                      borderBottomRightRadius: radius.lg,
                    },
                  ]}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="options-outline"
                    size={16}
                    color={colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    Customize Fields & Layout Preferences...
                  </Text>
                </TouchableOpacity>
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
    marginRight: 8,
  },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    minWidth: 44,
  },
  chevron: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dropdownMenu: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  optionsList: {
    padding: 10,
    gap: 6,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextCol: {
    flex: 1,
  },
  menuFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
