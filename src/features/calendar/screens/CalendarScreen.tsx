import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useTheme } from '../../../hooks/useTheme';
import { HabitsRepository, Habit } from '../../habits/habits.repository';
import { TasksRepository } from '../../tasks/tasks.repository';
import { Task } from '../../tasks/tasks.types';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const CalendarScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completionsMap, setCompletionsMap] = useState<Record<string, string[]>>({});
  const [allMonthTasks, setAllMonthTasks] = useState<Task[]>([]);

  const loadData = useCallback(() => {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

    // 1. Load active habits and their status for selected day
    const allHabits = HabitsRepository.getAll();
    setHabits(allHabits);

    // 2. Load tasks for selected day
    const dayTasks = TasksRepository.getTasksByDate(selectedDateStr);
    setTasks(dayTasks);

    // 3. Load completions and tasks for whole month to display indicator dots
    const start = format(startOfWeek(startOfMonth(currentMonth)), 'yyyy-MM-dd');
    const end = format(endOfWeek(endOfMonth(currentMonth)), 'yyyy-MM-dd');

    const monthTasks = TasksRepository.getTasks({ startDate: start, endDate: end });
    setAllMonthTasks(monthTasks);

    // Map habit completions by date
    const compMap: Record<string, string[]> = {};
    allHabits.forEach((h) => {
      const dates = HabitsRepository.getCompletionDates(h.id);
      dates.forEach((d) => {
        if (!compMap[d]) compMap[d] = [];
        compMap[d].push(h.id);
      });
    });
    setCompletionsMap(compMap);
  }, [currentMonth, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleToggleHabit = (habitId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    HabitsRepository.toggleCompletion(habitId, dateStr);
    loadData();
  };

  const handleToggleTask = (taskId: string) => {
    TasksRepository.toggleComplete(taskId);
    loadData();
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const completedHabitCount = habits.filter((h) => completionsMap[selectedDateStr]?.includes(h.id)).length;
  const completedTaskCount = tasks.filter((t) => t.is_completed === 1).length;

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h1, { color: colors.textPrimary }]}>Calendar</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Your habits and tasks over time
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Calendar Card */}
          <Card style={[styles.calendarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Month Navigation */}
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowBtn}>
                <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                {format(currentMonth, 'MMMM yyyy')}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.arrowBtn}>
                <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Weekdays Row */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((w, idx) => (
                <Text key={idx} style={[styles.weekdayText, typography.captionBold, { color: colors.textMuted }]}>
                  {w}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {days.map((day, idx) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                const hasHabitsDone = (completionsMap[dateKey]?.length || 0) > 0;
                const dayTasks = allMonthTasks.filter((t) => t.date === dateKey);
                const hasTaskDue = dayTasks.some((t) => t.is_completed === 0);
                const hasTaskDone = dayTasks.some((t) => t.is_completed === 1);

                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.7}
                    onPress={() => setSelectedDate(day)}
                    style={[
                      styles.dayCell,
                      isSelected && {
                        backgroundColor: colors.card,
                        borderColor: colors.textPrimary,
                        borderWidth: 1.5,
                        borderRadius: radius.md,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        {
                          color: !isCurrentMonth
                            ? colors.textMuted
                            : isSelected
                            ? colors.textPrimary
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      {format(day, 'd')}
                    </Text>

                    {/* Dots indicator row */}
                    <View style={styles.dotsRow}>
                      {hasHabitsDone && <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />}
                      {hasTaskDue && <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />}
                      {hasTaskDone && <View style={[styles.dot, { backgroundColor: '#A855F7' }]} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legend Bar */}
            <View style={[styles.legendRow, { borderTopColor: colors.divider }]}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 11 }]}>
                  Habits done
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 11 }]}>
                  Task due
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
                <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 11 }]}>
                  Task done
                </Text>
              </View>
            </View>
          </Card>

          {/* Selected Date Detail Section */}
          <View style={styles.detailSection}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 8 }]}>
              {format(selectedDate, 'EEE, MMM d').toUpperCase()}
            </Text>

            {/* Habits for day */}
            <Card style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 12 }]}>
              <Text style={[typography.captionBold, { color: colors.textPrimary, marginBottom: 8 }]}>
                Habits ({completedHabitCount}/{habits.length})
              </Text>
              {habits.length === 0 ? (
                <Text style={[typography.caption, { color: colors.textMuted }]}>No habits.</Text>
              ) : (
                habits.map((habit) => {
                  const isDone = (completionsMap[selectedDateStr] || []).includes(habit.id);
                  return (
                    <View key={habit.id} style={styles.itemRow}>
                      <Checkbox checked={isDone} onToggle={() => handleToggleHabit(habit.id)} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={[
                            typography.bodyMedium,
                            {
                              color: isDone ? colors.textMuted : colors.textPrimary,
                              textDecorationLine: isDone ? 'line-through' : 'none',
                            },
                          ]}
                        >
                          {habit.name}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {habit.category} · {habit.preferred_time || 'Anytime'}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </Card>

            {/* Tasks for day */}
            <Card style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[typography.captionBold, { color: colors.textPrimary, marginBottom: 8 }]}>
                Tasks ({completedTaskCount}/{tasks.length})
              </Text>
              {tasks.length === 0 ? (
                <Text style={[typography.caption, { color: colors.textMuted }]}>No tasks.</Text>
              ) : (
                tasks.map((task) => {
                  const isDone = task.is_completed === 1;
                  return (
                    <View key={task.id} style={styles.itemRow}>
                      <Checkbox checked={isDone} onToggle={() => handleToggleTask(task.id)} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={[
                            typography.bodyMedium,
                            {
                              color: isDone ? colors.textMuted : colors.textPrimary,
                              textDecorationLine: isDone ? 'line-through' : 'none',
                            },
                          ]}
                        >
                          {task.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {task.category}
                          {task.start_time ? ` · ${task.start_time}` : ''}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </Card>

            <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: 16 }]}>
              Tap a day to see its habits and tasks.
            </Text>
          </View>
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
  },
  scrollContent: {
    paddingBottom: 40,
  },
  calendarCard: {
    padding: 14,
    borderRadius: 14,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  arrowBtn: {
    padding: 6,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: '13.5%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
    height: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  detailSection: {
    marginTop: 20,
  },
  sectionCard: {
    padding: 14,
    borderRadius: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
