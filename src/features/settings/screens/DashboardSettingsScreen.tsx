import React from 'react';
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
import { DashboardWidgetConfig, DashboardWidgetType } from '../../customization/customization.types';

const WIDGET_ICONS: Record<DashboardWidgetType, keyof typeof Ionicons.glyphMap> = {
  focus_ring: 'speedometer-outline',
  quick_actions: 'flash-outline',
  priorities: 'checkbox-outline',
  current_goal: 'flag-outline',
  current_project: 'folder-open-outline',
  habits: 'flame-outline',
  study_plan: 'school-outline',
  journal: 'book-outline',
  overdue_items: 'alert-circle-outline',
  deadlines: 'calendar-outline',
};

const WIDGET_DESCRIPTIONS: Record<DashboardWidgetType, string> = {
  focus_ring: 'Daily completion ring & momentum percentage',
  quick_actions: 'Quick navigation buttons to add tasks, journal, timer',
  priorities: "Active priority task and today's schedule shortcut",
  current_goal: 'Highest priority active goal and milestone progress',
  current_project: 'Current ongoing project with progress and notes',
  habits: 'Active daily habit streaks and completion status',
  study_plan: "Today's scheduled study subjects and timetables",
  journal: 'Latest mood and reflection entry',
  overdue_items: 'Overdue or urgent pending tasks requiring attention',
  deadlines: 'Upcoming goal and project milestone deadlines',
};

export const DashboardSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const {
    dashboardWidgets,
    toggleDashboardWidget,
    setWidgetSize,
    reorderDashboardWidgets,
    resetDashboardToDefault,
  } = useCustomizationStore();

  const sortedWidgets = [...dashboardWidgets].sort((a, b) => a.order - b.order);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newWidgets = [...sortedWidgets];
    const temp = newWidgets[index];
    newWidgets[index] = newWidgets[index - 1];
    newWidgets[index - 1] = temp;

    // re-assign order
    const updated = newWidgets.map((w, idx) => ({ ...w, order: idx }));
    reorderDashboardWidgets(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedWidgets.length - 1) return;
    const newWidgets = [...sortedWidgets];
    const temp = newWidgets[index];
    newWidgets[index] = newWidgets[index + 1];
    newWidgets[index + 1] = temp;

    // re-assign order
    const updated = newWidgets.map((w, idx) => ({ ...w, order: idx }));
    reorderDashboardWidgets(updated);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Dashboard',
      'Are you sure you want to restore the default dashboard layout and widget order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetDashboardToDefault(),
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
          Dashboard Layout
        </Text>
        <TouchableOpacity
          onPress={handleReset}
          style={[styles.resetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Reset to defaults"
        >
          <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <Card variant="outlined" style={styles.infoCard}>
        <Ionicons name="apps-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
            Personalize Your Feed
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Toggle widgets, adjust their display sequence, or configure width for your ideal productivity dashboard.
          </Text>
        </View>
      </Card>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          Dashboard Widgets ({sortedWidgets.filter((w) => w.isEnabled).length} active)
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          Order & Size
        </Text>
      </View>

      {/* Widgets List */}
      {sortedWidgets.map((widget, index) => {
        const iconName = WIDGET_ICONS[widget.type] || 'apps-outline';
        const description = WIDGET_DESCRIPTIONS[widget.type] || '';
        const isFirst = index === 0;
        const isLast = index === sortedWidgets.length - 1;

        return (
          <Card
            key={widget.id}
            variant="elevated"
            style={[
              styles.widgetCard,
              {
                borderColor: widget.isEnabled ? colors.primaryLight : colors.border,
                opacity: widget.isEnabled ? 1 : 0.65,
              },
            ]}
          >
            <View style={styles.widgetRow}>
              {/* Reorder Arrows */}
              <View style={styles.reorderColumn}>
                <TouchableOpacity
                  onPress={() => handleMoveUp(index)}
                  disabled={isFirst}
                  style={[styles.arrowBtn, isFirst && styles.disabledBtn]}
                  accessibilityRole="button"
                  accessibilityLabel="Move up"
                >
                  <Ionicons
                    name="chevron-up"
                    size={20}
                    color={isFirst ? colors.textMuted : colors.textPrimary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMoveDown(index)}
                  disabled={isLast}
                  style={[styles.arrowBtn, isLast && styles.disabledBtn]}
                  accessibilityRole="button"
                  accessibilityLabel="Move down"
                >
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={isLast ? colors.textMuted : colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: widget.isEnabled ? colors.accentMint : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={22}
                  color={widget.isEnabled ? colors.primary : colors.textMuted}
                />
              </View>

              {/* Title & Description */}
              <View style={styles.infoCol}>
                <View style={styles.labelRow}>
                  <Text
                    style={[
                      typography.bodyBold,
                      { color: widget.isEnabled ? colors.textPrimary : colors.textMuted },
                    ]}
                  >
                    {widget.label}
                  </Text>
                  <View
                    style={[
                      styles.orderBadge,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 11 }]}>
                      #{index + 1}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}
                  numberOfLines={2}
                >
                  {description}
                </Text>

                {/* Size toggle */}
                {widget.isEnabled && (
                  <View style={styles.sizeControlRow}>
                    <Text style={[typography.caption, { color: colors.textSecondary, marginRight: 8 }]}>
                      Width:
                    </Text>
                    <TouchableOpacity
                      onPress={() => setWidgetSize(widget.id, 'full')}
                      style={[
                        styles.sizeBtn,
                        {
                          backgroundColor:
                            widget.size === 'full' ? colors.primary : colors.surface,
                          borderColor: widget.size === 'full' ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeBtnText,
                          { color: widget.size === 'full' ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        Full
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setWidgetSize(widget.id, 'half')}
                      style={[
                        styles.sizeBtn,
                        {
                          backgroundColor:
                            widget.size === 'half' ? colors.primary : colors.surface,
                          borderColor: widget.size === 'half' ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeBtnText,
                          { color: widget.size === 'half' ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        Compact
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Enable / Disable Switch */}
              <View style={styles.switchCol}>
                <Switch
                  value={widget.isEnabled}
                  onValueChange={() => toggleDashboardWidget(widget.id)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </Card>
        );
      })}

      {/* Reset to Default Layout Button */}
      <TouchableOpacity
        onPress={handleReset}
        style={[styles.bottomResetBtn, { borderColor: colors.border }]}
        accessibilityRole="button"
        accessibilityLabel="Reset dashboard to default"
      >
        <Ionicons name="refresh" size={18} color={colors.danger} style={{ marginRight: 8 }} />
        <Text style={[typography.bodyBold, { color: colors.danger }]}>
          Restore Default Dashboard
        </Text>
      </TouchableOpacity>

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
    marginBottom: 20,
    borderRadius: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  widgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderColumn: {
    marginRight: 8,
    alignItems: 'center',
  },
  arrowBtn: {
    padding: 4,
  },
  disabledBtn: {
    opacity: 0.25,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  sizeControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sizeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  sizeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  switchCol: {
    marginLeft: 8,
  },
  bottomResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
});
