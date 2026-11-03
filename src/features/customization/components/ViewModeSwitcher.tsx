import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { ViewMode } from '../customization.types';

interface ViewModeSwitcherProps {
  pageKey: string;
}

const VIEW_MODES: { mode: ViewMode; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { mode: 'card', icon: 'albums-outline', label: 'Card' },
  { mode: 'list', icon: 'list-outline', label: 'List' },
  { mode: 'compact', icon: 'reorder-two-outline', label: 'Compact' },
  { mode: 'grid', icon: 'grid-outline', label: 'Grid' },
];

export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({ pageKey }) => {
  const navigation = useNavigation<any>();
  const { colors, typography } = useTheme();
  const { pageLayouts, updatePageLayout } = useCustomizationStore();

  const currentMode: ViewMode = pageLayouts[pageKey]?.viewMode || 'card';

  const handleSelectMode = (mode: ViewMode) => {
    updatePageLayout(pageKey, { viewMode: mode });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.switcherBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {VIEW_MODES.map((vm) => {
          const isSelected = currentMode === vm.mode;
          return (
            <TouchableOpacity
              key={vm.mode}
              onPress={() => handleSelectMode(vm.mode)}
              style={[
                styles.modeBtn,
                isSelected && { backgroundColor: colors.accentMint },
              ]}
              accessibilityLabel={`${vm.label} view`}
            >
              <Ionicons
                name={vm.icon}
                size={16}
                color={isSelected ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('LayoutSettingsScreen')}
        style={[styles.settingsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        accessibilityLabel="Layout & sorting settings"
      >
        <Ionicons name="options-outline" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switcherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  modeBtn: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

