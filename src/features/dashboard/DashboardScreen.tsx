import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Screen } from '../../components/layout/Screen';
import { Card } from '../../components/ui/Card';
import { Checkbox } from '../../components/ui/Checkbox';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTheme } from '../../hooks/useTheme';
import { CATEGORY_COLORS } from '../../theme/colors';
import { TasksRepository } from '../tasks/tasks.repository';
import { HabitsRepository, Habit } from '../habits/habits.repository';
import { GoalsRepository, Goal } from '../goals/goals.repository';
import { Task } from '../tasks/tasks.types';

const CATEGORIES = ['All', 'Health', 'Career', 'Finance', 'Learning', 'Faith'];
const SHOW_OPTIONS = ['All', 'Habits', 'Tasks'];

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const profileName = useSettingsStore((s) => s.profileName) || 'Temesgen Birhenu';
  const { colors, typography, radius } = useTheme();

  const today = useMemo(() => new Date(), []);
  const todayStr = format(today, 'yyyy-MM-dd');
  const greetingTimeStr = format(today, 'EEE, MMM d - h:mm a');

  // Greeting based on hour
  const hour = today.getHours();
  const greetingPeriod = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Filters accordion state
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedShow, setSelectedShow] = useState('All');

  // Data
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goalsDueThisMonth, setGoalsDueThisMonth] = useState<Goal[]>([]);
  const [topStreaks, setTopStreaks] = useState<{ name: string; streak: number }[]>([]);

  const loadData = useCallback(() => {
    // 1. Habits
    const habitList = HabitsRepository.getAllWithProgress(todayStr);
    setHabits(habitList);

    // Top streaks (filtered where streak > 0)
    const streaks = habitList
      .map((h) => ({ name: h.name, streak: h.current_streak || 0 }))
      .filter((s) => s.streak > 0)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 3);
    setTopStreaks(streaks);

    // 2. Tasks
    const taskList = TasksRepository.getTasksByDate(todayStr);
    setTasks(taskList);

    // 3. Goals due this month
    const allGoals = GoalsRepository.getAllWithProgress({ status: 'active' });
    const currentMonthPrefix = format(today, 'yyyy-MM');
    const dueThisMonth = allGoals.filter(
      (g) => g.target_date && g.target_date.startsWith(currentMonthPrefix)
    );
    setGoalsDueThisMonth(dueThisMonth);
  }, [todayStr, today]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Toggle handlers
  const handleToggleHabit = (habitId: string) => {
    HabitsRepository.toggleCompletion(habitId, todayStr);
    loadData();
  };

  const handleToggleTask = (taskId: string) => {
    TasksRepository.toggleComplete(taskId);
    loadData();
  };

  // Completion calculation
  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => (h.todayCount || 0) >= (h.target_count || 1)).length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_completed === 1).length;

  const totalItems = totalHabits + totalTasks;
  const completedItems = completedHabits + completedTasks;
  const overallPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  // Filtered Today items
  const filteredHabits = habits.filter((h) => {
    if (selectedShow === 'Tasks') return false;
    if (selectedCategory === 'All') return true;
    return h.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const filteredTasks = tasks.filter((t) => {
    if (selectedShow === 'Habits') return false;
    if (selectedCategory === 'All') return true;
    return t.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const hasTodayItems = filteredHabits.length > 0 || filteredTasks.length > 0;

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[typography.h1, { color: colors.textPrimary }]}>Dashboard</Text>
            <Text style={[typography.bodyBold, { color: colors.textPrimary, marginTop: 4 }]}>
              {greetingPeriod}, {profileName}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {greetingTimeStr}
            </Text>
          </View>

          {/* Filters Accordion Toggle */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFiltersExpanded(!filtersExpanded)}
            style={[styles.filtersToggle, { borderColor: colors.border }]}
          >
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
              Filters {filtersExpanded ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Expanded Filters Panel */}
        {filtersExpanded && (
          <Card style={[styles.filtersCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 6 }]}>
              Category
            </Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: active ? colors.card : 'transparent',
                        borderColor: active ? colors.textPrimary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        { color: active ? colors.textPrimary : colors.textSecondary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[typography.captionBold, { color: colors.textSecondary, marginTop: 10, marginBottom: 6 }]}>
              Show
            </Text>
            <View style={styles.chipsRow}>
              {SHOW_OPTIONS.map((opt) => {
                const active = selectedShow === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setSelectedShow(opt)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: active ? colors.card : 'transparent',
                        borderColor: active ? colors.textPrimary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        { color: active ? colors.textPrimary : colors.textSecondary },
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Overall Score Card */}
          <Card style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, letterSpacing: 0.5 }]}>
              Overall score
            </Text>
            <View style={styles.scoreRow}>
              <View style={[styles.scoreCircle, { borderColor: colors.textPrimary }]}>
                <Text style={[styles.scorePercentText, { color: colors.textPrimary }]}>
                  {overallPercent}%
                </Text>
              </View>
              <View style={styles.scoreDetails}>
                <Text style={[typography.h3, { color: colors.textPrimary }]}>
                  {completedItems} of {totalItems} done
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                  {totalItems === 0
                    ? 'Add habits and tasks to get started.'
                    : overallPercent >= 80
                    ? 'Outstanding! Keep the momentum.'
                    : overallPercent >= 50
                    ? 'Nice pace - keep going.'
                    : 'A few minutes of focus can turn the day around.'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Top Streaks Card */}
          <Card style={[styles.streaksCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 8 }]}>
              Top streaks
            </Text>
            {topStreaks.length === 0 ? (
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                No streaks yet - complete a habit today.
              </Text>
            ) : (
              topStreaks.map((s, idx) => (
                <View key={idx} style={styles.streakRow}>
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                    {s.name}
                  </Text>
                  <Text style={[typography.bodyBold, { color: '#EAB308' }]}>
                    {s.streak} {s.streak === 1 ? 'day' : 'days'}
                  </Text>
                </View>
              ))
            )}
          </Card>

          {/* TODAY Section */}
          <View style={styles.sectionHeader}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, letterSpacing: 0.8 }]}>
              TODAY
            </Text>
          </View>

          <Card style={[styles.todayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {!hasTodayItems ? (
              <View style={styles.emptyStateContainer}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  Nothing scheduled for today
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                  Create habits and tasks, and they will show here.
                </Text>
              </View>
            ) : (
              <>
                {/* Habits */}
                {filteredHabits.map((h) => {
                  const isDone = (h.todayCount || 0) >= (h.target_count || 1);
                  const catColor = CATEGORY_COLORS[h.category || 'General'] || colors.primary;
                  return (
                    <View key={`habit-${h.id}`} style={styles.todayItemRow}>
                      <View style={[styles.categoryIndicator, { backgroundColor: catColor }]} />
                      <View style={styles.todayItemInfo}>
                        <Text
                          style={[
                            typography.bodyMedium,
                            {
                              color: isDone ? colors.textMuted : colors.textPrimary,
                              textDecorationLine: isDone ? 'line-through' : 'none',
                            },
                          ]}
                        >
                          {h.name}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {h.preferred_time || h.frequency}
                        </Text>
                      </View>
                      <Checkbox checked={isDone} onToggle={() => handleToggleHabit(h.id)} />
                    </View>
                  );
                })}

                {/* Tasks */}
                {filteredTasks.map((t) => {
                  const isDone = t.is_completed === 1;
                  const catColor = CATEGORY_COLORS[t.category] || colors.primary;
                  return (
                    <View key={`task-${t.id}`} style={styles.todayItemRow}>
                      <View style={[styles.categoryIndicator, { backgroundColor: catColor }]} />
                      <View style={styles.todayItemInfo}>
                        <Text
                          style={[
                            typography.bodyMedium,
                            {
                              color: isDone ? colors.textMuted : colors.textPrimary,
                              textDecorationLine: isDone ? 'line-through' : 'none',
                            },
                          ]}
                        >
                          {t.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {t.start_time || 'Due today'}
                        </Text>
                      </View>
                      <Checkbox checked={isDone} onToggle={() => handleToggleTask(t.id)} />
                    </View>
                  );
                })}
              </>
            )}
          </Card>

          {/* Goals Due This Month */}
          <View style={styles.sectionHeader}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, letterSpacing: 0.8 }]}>
              Goals due this month
            </Text>
          </View>

          <Card style={[styles.goalsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {goalsDueThisMonth.length === 0 ? (
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Nothing due. Set a target date on a goal.
              </Text>
            ) : (
              goalsDueThisMonth.map((g) => (
                <View key={g.id} style={styles.goalItemRow}>
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                    {g.title}
                  </Text>
                  <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
                    {g.target_date ? format(parseISO(g.target_date), 'MMM d') : ''}
                  </Text>
                </View>
              ))
            )}
          </Card>
        </ScrollView>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  filtersToggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  filtersCard: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  scoreCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  scoreCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePercentText: {
    fontSize: 18,
    fontWeight: '800',
  },
  scoreDetails: {
    marginLeft: 16,
    flex: 1,
  },
  streaksCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 14,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 4,
  },
  todayCard: {
    padding: 14,
    marginBottom: 16,
    borderRadius: 14,
  },
  emptyStateContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  todayItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  categoryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  todayItemInfo: {
    flex: 1,
  },
  goalsCard: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 14,
  },
  goalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
});
