import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Checkbox } from '../../components/ui/Checkbox';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTheme } from '../../hooks/useTheme';
import { TasksRepository } from '../tasks/tasks.repository';
import { HabitsRepository } from '../habits/habits.repository';
import { Task } from '../tasks/tasks.types';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profileName } = useSettingsStore();
  const { colors, typography, radius } = useTheme();

  const todayStr = new Date().toISOString().split('T')[0];

  const [priorities, setPriorities] = useState<Task[]>([]);
  const [focusPercentage, setFocusPercentage] = useState<number>(78);

  const loadData = useCallback(() => {
    const todayPriorities = TasksRepository.getTodayPriorities(todayStr);
    setPriorities(todayPriorities);

    const taskStats = TasksRepository.getCompletionStats(todayStr);
    const habits = HabitsRepository.getAllWithProgress(todayStr);

    let totalItems = taskStats.total + habits.length;
    let completedItems = taskStats.completed;

    habits.forEach((h) => {
      if ((h.todayCount || 0) >= (h.target_count || 1)) {
        completedItems++;
      }
    });

    const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 78;
    setFocusPercentage(percent);
  }, [todayStr]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleToggleTask = (taskId: string) => {
    TasksRepository.toggleComplete(taskId);
    loadData();
  };

  return (
    <Screen scroll backgroundColor={colors.background} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.container}>
        {/* Header: Greeting & Notification Bell */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.openDrawer()}
              style={[styles.menuBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Open Menu"
            >
              <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.greeting, typography.h2, { color: colors.textPrimary }]}>
                Hello, {profileName || 'Temesgen'} 👋
              </Text>
              <Text style={[styles.greetingSub, typography.caption, { color: colors.textSecondary }]}>
                Keep going! You're doing great.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SettingsScreen')}
            style={[styles.bellBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            <View style={[styles.bellBadge, { backgroundColor: colors.orange }]} />
          </TouchableOpacity>
        </View>

        {/* Today's Focus Card with Circular Ring */}
        <Card variant="elevated" style={styles.focusCard}>
          <View style={styles.focusInfo}>
            <Text style={[styles.focusLabel, typography.captionBold, { color: colors.textSecondary }]}>
              TODAY'S FOCUS
            </Text>
            <Text style={[styles.focusScore, typography.hero, { color: colors.textPrimary }]}>
              {focusPercentage}%
            </Text>
            <Text style={[styles.focusSub, typography.caption, { color: colors.primary }]}>
              Consistent daily momentum
            </Text>
          </View>

          <ProgressRing
            size={86}
            strokeWidth={10}
            progress={focusPercentage}
            color={colors.primary}
            trackColor={colors.accentMint}
          >
            <View style={styles.ringInner}>
              <Ionicons name="trophy" size={24} color={colors.primary} />
            </View>
          </ProgressRing>
        </Card>

        {/* Today's Priorities */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, typography.h2, { color: colors.textPrimary }]}>
            Today's Priorities
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Tasks')}
            accessibilityRole="button"
          >
            <Text style={[styles.viewAllText, typography.captionBold, { color: colors.primary }]}>
              View all →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.prioritiesList}>
          {priorities.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="checkbox-outline" size={32} color={colors.textMuted} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 8 }]}>
                No priority tasks for today yet.
              </Text>
            </Card>
          ) : (
            priorities.map((item) => (
              <Card key={item.id} style={styles.taskCard}>
                <View style={styles.taskRow}>
                  <Checkbox
                    checked={item.is_completed === 1}
                    onToggle={() => handleToggleTask(item.id)}
                  />
                  <View style={styles.taskDetails}>
                    <Text
                      style={[
                        styles.taskTitle,
                        typography.bodyMedium,
                        {
                          color: item.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                          textDecorationLine: item.is_completed === 1 ? 'line-through' : 'none',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {item.start_time && (
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        {item.start_time} {item.end_time ? `- ${item.end_time}` : ''}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor:
                          item.category === 'Study'
                            ? colors.accentMint
                            : item.category === 'Work'
                            ? colors.purpleSoft
                            : colors.orangeSoft,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        {
                          color:
                            item.category === 'Study'
                              ? colors.primary
                              : item.category === 'Work'
                              ? colors.purple
                              : colors.orange,
                        },
                      ]}
                    >
                      {item.category}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, typography.h2, { color: colors.textPrimary, marginTop: 24 }]}>
          Quick Actions
        </Text>

        <View style={styles.quickActionsRow}>
          {/* Action 1: Focus Timer */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FocusTimerScreen')}
            style={[styles.actionBtn, { backgroundColor: colors.accentMint, borderRadius: radius.xl }]}
            accessibilityRole="button"
            accessibilityLabel="Focus Timer"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="timer-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, typography.captionBold, { color: colors.deepGreen }]}>
              Focus Timer
            </Text>
          </TouchableOpacity>

          {/* Action 2: Add Task */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Tasks', { openAdd: true })}
            style={[styles.actionBtn, { backgroundColor: colors.orangeSoft, borderRadius: radius.xl }]}
            accessibilityRole="button"
            accessibilityLabel="Add Task"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.orange }]}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, typography.captionBold, { color: '#92400E' }]}>
              Add Task
            </Text>
          </TouchableOpacity>

          {/* Action 3: New Journal */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('JournalScreen')}
            style={[styles.actionBtn, { backgroundColor: colors.purpleSoft, borderRadius: radius.xl }]}
            accessibilityRole="button"
            accessibilityLabel="New Journal"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.purple }]}>
              <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, typography.captionBold, { color: colors.purple }]}>
              New Journal
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollPadding: {
    paddingBottom: 110,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontWeight: '800',
  },
  greetingSub: {
    marginTop: 2,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  focusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 20,
  },
  focusInfo: {
    flex: 1,
  },
  focusLabel: {
    letterSpacing: 0.5,
  },
  focusScore: {
    fontWeight: '800',
    marginVertical: 4,
  },
  focusSub: {
    fontWeight: '600',
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 13,
  },
  prioritiesList: {
    gap: 10,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  taskCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetails: {
    flex: 1,
    marginHorizontal: 8,
  },
  taskTitle: {
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    textAlign: 'center',
  },
});

