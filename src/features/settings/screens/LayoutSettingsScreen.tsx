import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../hooks/useTheme';
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { ViewMode, PageLayoutConfig } from '../../customization/customization.types';

const PAGES = [
  { key: 'goals', label: 'Goals', icon: 'flag-outline' },
  { key: 'tasks', label: 'Tasks', icon: 'calendar-outline' },
  { key: 'habits', label: 'Habits', icon: 'flash-outline' },
  { key: 'projects', label: 'Projects', icon: 'folder-open-outline' },
  { key: 'study', label: 'Study Planner', icon: 'school-outline' },
  { key: 'journal', label: 'Journal', icon: 'book-outline' },
  { key: 'trading', label: 'Trading Journal', icon: 'trending-up-outline' },
  { key: 'ideas', label: 'Ideas', icon: 'bulb-outline' },
];

const VIEW_MODES: { mode: ViewMode; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  { mode: 'card', label: 'Card View', icon: 'albums-outline', desc: 'Detailed cards with comfortable spacing' },
  { mode: 'list', label: 'List View', icon: 'list-outline', desc: 'Standard single-line structured items' },
  { mode: 'compact', label: 'Compact', icon: 'reorder-two-outline', desc: 'Dense rows for maximum information density' },
  { mode: 'grid', label: 'Grid (2-Col)', icon: 'grid-outline', desc: 'Two-column visual grid layout' },
];

const SORT_OPTIONS: { key: string; label: string }[] = [
  { key: 'created_at', label: 'Created Date' },
  { key: 'title', label: 'Title / Name (A-Z)' },
  { key: 'due_date', label: 'Due / Target Date' },
  { key: 'priority', label: 'Priority / Importance' },
];

const FIELD_TOGGLES: { key: string; label: string; desc: string }[] = [
  { key: 'show_dates', label: 'Due & Target Dates', desc: 'Display scheduled dates on item cards' },
  { key: 'show_categories', label: 'Category & Tags', desc: 'Show category labels and color indicators' },
  { key: 'show_progress', label: 'Progress Indicators', desc: 'Display progress ring / completion bar' },
  { key: 'show_notes', label: 'Notes & Descriptions', desc: 'Show brief descriptions and notes' },
  { key: 'show_status', label: 'Status & Priority Badges', desc: 'High/Medium/Low priority badges' },
];

export const LayoutSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const { pageLayouts, updatePageLayout } = useCustomizationStore();

  const [activePage, setActivePage] = useState<string>('goals');

  const currentLayout: PageLayoutConfig = pageLayouts[activePage] || {
    viewMode: 'card',
    sortBy: 'created_at',
    sortDirection: 'desc',
    visibleFields: ['show_dates', 'show_categories', 'show_progress', 'show_notes', 'show_status'],
  };

  const currentVisible = currentLayout.visibleFields || [
    'show_dates',
    'show_categories',
    'show_progress',
    'show_notes',
    'show_status',
  ];

  const handleSelectMode = (mode: ViewMode) => {
    updatePageLayout(activePage, { viewMode: mode });
  };

  const handleSelectSort = (sortBy: string) => {
    updatePageLayout(activePage, { sortBy });
  };

  const handleToggleDirection = () => {
    const nextDir = currentLayout.sortDirection === 'asc' ? 'desc' : 'asc';
    updatePageLayout(activePage, { sortDirection: nextDir });
  };

  const handleToggleField = (fieldKey: string) => {
    let next: string[];
    if (currentVisible.includes(fieldKey)) {
      next = currentVisible.filter((k) => k !== fieldKey);
    } else {
      next = [...currentVisible, fieldKey];
    }
    updatePageLayout(activePage, { visibleFields: next });
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Layout',
      `Restore default card layout and sorting for ${activePage.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            updatePageLayout(activePage, {
              viewMode: 'card',
              sortBy: 'created_at',
              sortDirection: 'desc',
              visibleFields: [
                'show_dates',
                'show_categories',
                'show_progress',
                'show_notes',
                'show_status',
              ],
            });
          },
        },
      ]
    );
  };

  return (
    <Screen backgroundColor={colors.background} contentContainerStyle={styles.container} scroll>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, typography.h2, { color: colors.textPrimary }]}>
          Layout & Lists
        </Text>
        <TouchableOpacity
          onPress={handleReset}
          style={[styles.resetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Reset layout"
        >
          <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <Card variant="outlined" style={styles.infoCard}>
        <Ionicons name="layers-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
            View Mode & Sort Options
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Configure card, list, compact, and grid views independently for each screen in your workspace.
          </Text>
        </View>
      </Card>

      {/* Page Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {PAGES.map((page) => {
          const isSelected = activePage === page.key;
          return (
            <TouchableOpacity
              key={page.key}
              onPress={() => setActivePage(page.key)}
              style={[
                styles.tabChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons
                name={page.icon as any}
                size={16}
                color={isSelected ? '#FFFFFF' : colors.textPrimary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  typography.captionBold,
                  { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                {page.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 1. View Mode Selection */}
      <View style={styles.sectionHeader}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          View Mode
        </Text>
      </View>

      <View style={styles.viewModeGrid}>
        {VIEW_MODES.map((vm) => {
          const isSelected = currentLayout.viewMode === vm.mode;
          return (
            <TouchableOpacity
              key={vm.mode}
              activeOpacity={0.8}
              onPress={() => handleSelectMode(vm.mode)}
              style={[
                styles.viewModeCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.modeIconCircle,
                  {
                    backgroundColor: isSelected ? colors.accentMint : colors.background,
                  },
                ]}
              >
                <Ionicons
                  name={vm.icon}
                  size={20}
                  color={isSelected ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  typography.bodyBold,
                  { color: isSelected ? colors.primary : colors.textPrimary, marginTop: 8 },
                ]}
              >
                {vm.label}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 2 }]}
              >
                {vm.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Live Preview Box */}
      <Card variant="elevated" style={styles.previewBox}>
        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 8 }]}>
          LIVE PREVIEW: {currentLayout.viewMode.toUpperCase()} VIEW
        </Text>
        <View
          style={[
            styles.sampleItem,
            currentLayout.viewMode === 'compact' && styles.sampleCompact,
            currentLayout.viewMode === 'list' && styles.sampleList,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
              Sample Item Title
            </Text>
            {currentVisible.includes('show_dates') && (
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Target: 2026-12-31 · 85% Progress
              </Text>
            )}
          </View>
          {currentVisible.includes('show_status') && (
            <View style={[styles.sampleBadge, { backgroundColor: colors.accentMint }]}>
              <Text style={[typography.captionBold, { color: colors.primary, fontSize: 10 }]}>
                ACTIVE
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* 2. Sorting & Ordering */}
      <View style={styles.sectionHeader}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          Default Sort & Order
        </Text>
      </View>

      <Card variant="elevated" style={styles.sortCard}>
        <View style={styles.sortOptionsRow}>
          {SORT_OPTIONS.map((opt) => {
            const isSelected = currentLayout.sortBy === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => handleSelectSort(opt.key)}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
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
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.directionRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
            Sort Direction:
          </Text>
          <TouchableOpacity
            onPress={handleToggleDirection}
            style={[styles.directionBtn, { backgroundColor: colors.accentMint, borderColor: colors.primary }]}
          >
            <Ionicons
              name={currentLayout.sortDirection === 'asc' ? 'arrow-up-outline' : 'arrow-down-outline'}
              size={16}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={[typography.captionBold, { color: colors.primary }]}>
              {currentLayout.sortDirection === 'asc' ? 'Ascending (A-Z / Oldest)' : 'Descending (Z-A / Newest)'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* 3. Visible Information Fields */}
      <View style={styles.sectionHeader}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          Visible Information & Columns
        </Text>
      </View>

      <Card variant="elevated" style={styles.fieldTogglesCard}>
        {FIELD_TOGGLES.map((f, idx) => {
          const isEnabled = currentVisible.includes(f.key);
          return (
            <View
              key={f.key}
              style={[
                styles.toggleRow,
                idx < FIELD_TOGGLES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  {f.label}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {f.desc}
                </Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={() => handleToggleField(f.key)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          );
        })}
      </Card>

      <View style={{ height: 40 }} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 16,
    borderRadius: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingBottom: 14,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 6,
  },
  viewModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  viewModeCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modeIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBox: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 14,
  },
  sampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  sampleCompact: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  sampleList: {
    paddingVertical: 10,
  },
  sampleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sortCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  sortOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  directionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  fieldTogglesCard: {
    padding: 14,
    borderRadius: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
});

