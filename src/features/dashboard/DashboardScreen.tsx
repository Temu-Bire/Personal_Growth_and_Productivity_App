import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Checkbox } from '../../components/ui/Checkbox';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTheme } from '../../hooks/useTheme';
import { TasksRepository } from '../tasks/tasks.repository';
import { HabitsRepository } from '../habits/habits.repository';
import { GoalsRepository, Goal } from '../goals/goals.repository';
import { ProjectsRepository, Project } from '../projects/projects.repository';
import { StudyRepository } from '../study/study.repository';
import { JournalRepository, JournalEntry } from '../journal/journal.repository';
import { Task } from '../tasks/tasks.types';

const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '😊',
  5: '🤩',
};

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { profileName } = useSettingsStore();
  const { colors, typography, radius } = useTheme();

  const todayStr = new Date().toISOString().split('T')[0];

  const [focusPercentage, setFocusPercentage] = useState<number>(78);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [currentProject, setCurrentProject] = useState<(Project & { latestNote?: string }) | null>(null);
  const [currentPlan, setCurrentPlan] = useState<{ subjectName: string; time: string; color: string } | null>(null);
  const [lastJournal, setLastJournal] = useState<JournalEntry | null>(null);

  const loadDashboardData = useCallback(() => {
    // 1. Current Task
    const topTask = TasksRepository.getCurrentTask(todayStr);
    setCurrentTask(topTask);

    // 2. Today's Focus % calculation
    const taskStats = TasksRepository.getCompletionStats(todayStr);
    const habits = HabitsRepository.getAllWithProgress(todayStr);
    let totalItems = taskStats.total + habits.length;
    let completedItems = taskStats.completed;

    habits.forEach((h) => {
      if ((h.todayCount || 0) >= (h.target_count || 1)) {
        completedItems++;
      }
    });
    const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 82;
    setFocusPercentage(percent);

    // 3. Current Goal
    const activeGoal = GoalsRepository.getActiveGoal();
    setCurrentGoal(activeGoal);

    // 4. Current Project & Notes
    const activePrj = ProjectsRepository.getActiveProject();
    setCurrentProject(activePrj);

    // 5. Current Plan (Study or daily plan)
    const plan = StudyRepository.getTodayPlan();
    setCurrentPlan(plan);

    // 6. Last Journal Entry
    const latestJ = JournalRepository.getLatestEntry();
    setLastJournal(latestJ);
  }, [todayStr]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const handleToggleCurrentTask = () => {
    if (!currentTask) return;
    TasksRepository.toggleComplete(currentTask.id);
    loadDashboardData();
  };

  return (
    <Screen scroll backgroundColor={colors.background} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.container}>
        {/* Header: Greeting & Settings / Bell */}
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

            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.greeting, typography.h2, { color: colors.textPrimary }]}>
                Hello, {profileName || 'Temesgen'} 👋
              </Text>
              <Text style={[styles.greetingSub, typography.caption, { color: colors.textSecondary }]}>
                Plan · Focus · Achieve
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

        {/* Today's Focus Momentum Card */}
        <Card variant="elevated" style={styles.focusCard}>
          <View style={styles.focusInfo}>
            <Text style={[styles.focusLabel, typography.captionBold, { color: colors.textSecondary }]}>
              TODAY'S MOMENTUM
            </Text>
            <Text style={[styles.focusScore, typography.hero, { color: colors.textPrimary }]}>
              {focusPercentage}%
            </Text>
            <Text style={[styles.focusSub, typography.caption, { color: colors.primary }]}>
              {focusPercentage >= 80 ? 'Exceptional productivity today!' : 'Keep going, every step counts.'}
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

        {/* Quick Action Shortcuts */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FocusTimerScreen')}
            style={[styles.actionBtn, { backgroundColor: colors.accentMint, borderRadius: radius.xl }]}
            accessibilityRole="button"
            accessibilityLabel="Focus Timer"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="timer-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, typography.captionBold, { color: colors.deepGreen }]}>
              Timer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Tasks', { openAdd: true })}
            style={[styles.actionBtn, { backgroundColor: colors.orangeSoft, borderRadius: radius.xl }]}
            accessibilityRole="button"
            accessibilityLabel="Add Task"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.orange }]}>
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, typography.captionBold, { color: '#92400E' }]}>
              Add Task
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('JournalScreen')}
            style={[styles.actionBtn, { backgroundColor: colors.purpleSoft, borderRadius: radius.xl }]}
            accessibilityRole="button"
            accessibilityLabel="New Journal"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.purple }]}>
              <Ionicons name="create-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, typography.captionBold, { color: colors.purple }]}>
              Journal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('IdeasScreen')}
            style={[styles.actionBtn, { backgroundColor: '#E0F2FE', borderRadius: radius.xl }]}
            accessibilityRole="button"
            accessibilityLabel="Ideas"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#0284C7' }]}>
              <Ionicons name="bulb-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, typography.captionBold, { color: '#0369A1' }]}>
              Ideas
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. Current Task Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, typography.h2, { color: colors.textPrimary }]}>
            Current Task
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
            <Text style={[styles.viewAllText, typography.captionBold, { color: colors.primary }]}>
              View schedule →
            </Text>
          </TouchableOpacity>
        </View>

        {currentTask ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Tasks')}
          >
            <Card style={styles.cardItem}>
              <View style={styles.cardRow}>
                <Checkbox
                  checked={currentTask.is_completed === 1}
                  onToggle={handleToggleCurrentTask}
                />
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <Text
                    style={[
                      typography.bodyBold,
                      {
                        color: currentTask.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                        textDecorationLine: currentTask.is_completed === 1 ? 'line-through' : 'none',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {currentTask.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {currentTask.start_time
                      ? `${currentTask.start_time} ${currentTask.end_time ? `- ${currentTask.end_time}` : ''}`
                      : 'Today'} · {currentTask.category}
                  </Text>
                </View>
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor:
                        currentTask.priority === 'high' ? colors.dangerSoft : colors.accentMint,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      {
                        color:
                          currentTask.priority === 'high' ? colors.danger : colors.primary,
                      },
                    ]}
                  >
                    {currentTask.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Tasks', { openAdd: true })}
          >
            <Card style={styles.emptyItemCard}>
              <Ionicons name="checkmark-done-circle-outline" size={26} color={colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  All caught up for today!
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Tap to plan your next priority task →
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* 2. Current Goal Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, typography.h2, { color: colors.textPrimary }]}>
            Current Goal
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('GoalsScreen')}>
            <Text style={[styles.viewAllText, typography.captionBold, { color: colors.primary }]}>
              All goals →
            </Text>
          </TouchableOpacity>
        </View>

        {currentGoal ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('GoalsScreen')}
          >
            <Card style={styles.cardItem}>
              <View style={styles.cardRowBetween}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                    {currentGoal.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    Due: {currentGoal.due_date} · {currentGoal.category || 'General'}
                  </Text>
                </View>
                <Text style={[typography.h3, { color: colors.primary, fontWeight: '800' }]}>
                  {currentGoal.progressPercent}%
                </Text>
              </View>

              <ProgressBar
                progress={currentGoal.progressPercent || 0}
                height={6}
                color={colors.primary}
                style={{ marginTop: 10, marginBottom: 4 }}
              />
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {currentGoal.completedMilestonesCount || 0} of {currentGoal.milestonesCount || 0} milestones done
              </Text>
            </Card>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('GoalsScreen')}
          >
            <Card style={styles.emptyItemCard}>
              <Ionicons name="flag-outline" size={26} color={colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  No active goals set
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Define clear milestones and track ambition →
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* 3. Current Project & Notes Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, typography.h2, { color: colors.textPrimary }]}>
            Current Project & Notes
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProjectsScreen')}>
            <Text style={[styles.viewAllText, typography.captionBold, { color: colors.primary }]}>
              View projects →
            </Text>
          </TouchableOpacity>
        </View>

        {currentProject ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProjectsScreen')}
          >
            <Card style={styles.cardItem}>
              <View style={styles.cardRowBetween}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                    {currentProject.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    Due: {currentProject.due_date} · {currentProject.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Text>
                </View>
                <Text style={[typography.h3, { color: colors.primary, fontWeight: '800' }]}>
                  {currentProject.progressPercent}%
                </Text>
              </View>

              <ProgressBar
                progress={currentProject.progressPercent || 0}
                height={6}
                color={currentProject.color || colors.primary}
                style={{ marginTop: 10, marginBottom: 8 }}
              />

              <View style={[styles.notesHighlight, { backgroundColor: colors.accentMint }]}>
                <Ionicons name="document-text-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[typography.caption, { color: colors.deepGreen, flex: 1 }]} numberOfLines={1}>
                  Note: {currentProject.latestNote || 'Active deliverables on schedule'}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProjectsScreen')}
          >
            <Card style={styles.emptyItemCard}>
              <Ionicons name="folder-open-outline" size={26} color={colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  No active projects
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Start a project and break it down into deliverables →
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* 4. Current Plan Section (Study / Schedule) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, typography.h2, { color: colors.textPrimary }]}>
            Current Plan
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('StudyScreen')}>
            <Text style={[styles.viewAllText, typography.captionBold, { color: colors.primary }]}>
              Study plan →
            </Text>
          </TouchableOpacity>
        </View>

        {currentPlan ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StudyScreen')}
          >
            <Card style={styles.cardItem}>
              <View style={styles.cardRow}>
                <View
                  style={[
                    styles.planIconBox,
                    { backgroundColor: colors.accentMint },
                  ]}
                >
                  <Ionicons name="school-outline" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                    {currentPlan.subjectName}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {currentPlan.time}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />
              </View>
            </Card>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StudyScreen')}
          >
            <Card style={styles.emptyItemCard}>
              <Ionicons name="calendar-outline" size={26} color={colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  No sessions scheduled today
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  View subjects and study timetable →
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* 5. Last Journal Entry Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, typography.h2, { color: colors.textPrimary }]}>
            Last Journal Entry
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('JournalScreen')}>
            <Text style={[styles.viewAllText, typography.captionBold, { color: colors.primary }]}>
              All entries →
            </Text>
          </TouchableOpacity>
        </View>

        {lastJournal ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('JournalScreen')}
          >
            <Card style={styles.cardItem}>
              <View style={styles.cardRow}>
                <View style={[styles.moodCircle, { backgroundColor: colors.accentMint }]}>
                  <Text style={{ fontSize: 24 }}>{MOOD_EMOJIS[lastJournal.mood] || '😊'}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.cardRowBetween}>
                    <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
                      {lastJournal.date}
                    </Text>
                  </View>
                  <Text
                    style={[typography.body, { color: colors.textPrimary, marginTop: 3 }]}
                    numberOfLines={2}
                  >
                    {lastJournal.content}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 6 }} />
              </View>
            </Card>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('JournalScreen')}
          >
            <Card style={styles.emptyItemCard}>
              <Ionicons name="book-outline" size={26} color={colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  No journal entry recorded
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Take a moment to write your reflections →
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}

        <View style={{ height: 20 }} />
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
    marginBottom: 18,
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
    marginBottom: 16,
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
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionTitle: {
    textAlign: 'center',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 13,
  },
  cardItem: {
    padding: 14,
    marginBottom: 14,
  },
  emptyItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 14,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  notesHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  planIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
