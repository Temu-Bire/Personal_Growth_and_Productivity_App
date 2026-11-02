import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SegmentedTabsProps<T extends string> {
  tabs: { key: T; label: string }[];
  activeTab: T;
  onTabChange: (key: T) => void;
  style?: ViewStyle;
}

export function SegmentedTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  style,
}: SegmentedTabsProps<T>) {
  const { colors, radius, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.inputBg,
          borderRadius: radius.lg,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.key)}
            style={[
              styles.tab,
              {
                borderRadius: radius.md,
                backgroundColor: isActive ? colors.surface : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                typography.bodyMedium,
                {
                  color: isActive ? colors.primary : colors.textMuted,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
    marginVertical: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
  },
});

