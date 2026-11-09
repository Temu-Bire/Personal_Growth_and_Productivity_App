import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Checkbox } from '../../../components/ui/Checkbox';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { TasksRepository } from '../../tasks/tasks.repository';
import { Task } from '../../tasks/tasks.types';
import { GoalsRepository, Goal } from '../../goals/goals.repository';
import {
  FormInput,
  FormTextArea,
  FormSelect,
  FormPriorityPicker,
} from '../../../components/forms';

const TIME_BLOCKS = [
  '06:00 AM',
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
  '09:00 PM',
  '10:00 PM',
];

export const PlannerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorities, setPriorities] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, percent: 100 });

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:00 AM');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [goalId, setGoalId] = useState('none');
  const [estimatedMinutes, setEstimatedMinutes] = useState('30');

  const loadData = useCallback(() => {
    const list = TasksRepository.getTimelineTasks(selectedDate);
    setTasks(list);

    const prios = TasksRepository.getTodayPriorities(selectedDate);
    setPriorities(prios);

    const stat = TasksRepository.getCompletionStats(selectedDate);
    setStats(stat);

    const activeGoals = GoalsRepository.getAllWithProgress({ status: 'active' });
    setGoals(activeGoals);
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleToggleTask = (taskId: string) => {
    TasksRepository.toggleComplete(taskId);
    loadData();
  };

  const handlePrevDay = () => {
    setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  };

  const handleQuickAddForHour = (hour: string) => {
    setTitle('');
    setNotes('');
    setStartTime(hour);
    setEndTime('');
    setCategory('General');
    setPriority('medium');
    setGoalId('none');
    setEstimatedMinutes('45');
    setIsAddOpen(true);
  };

  const handleSaveTask = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }

    TasksRepository.create({
      title: title.trim(),
      notes: notes.trim() || null,
      date: selectedDate,
      start_time: startTime.trim() || null,
      end_time: endTime.trim() || null,
      category,
      priority,
      goal_id: goalId === 'none' ? null : goalId,
      estimated_minutes: parseInt(estimatedMinutes, 10) || 30,
      is_priority: priority === 'high' ? 1 : 0,
    });

    setIsAddOpen(false);
    loadData();
  };

  const handleReschedule = (daysOffset: number) => {
    if (!selectedTask) return;
    const targetDate = format(addDays(parseISO(selectedTask.date), daysOffset), 'yyyy-MM-dd');
    TasksRepository.reschedule(selectedTask.id, targetDate);
    setIsRescheduleOpen(false);
    setSelectedTask(null);
    loadData();
  };

  const formattedDate = format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy');

  const goalOptions = [
    { label: 'None (Stand-alone Task)', value: 'none' },
    ...goals.map((g) => ({ label: g.title, value: g.id })),
  ];

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => ((navigation as any).openDrawer ? (navigation as any).openDrawer() : navigation.goBack())}
              style={[styles.menuBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Open Menu"
            >
              <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, typography.h2, { color: colors.textPrimary, marginLeft: 12 }]} numberOfLines={1}>
              Daily Planner
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleQuickAddForHour('09:00 AM')}
            style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="Add Task"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Date Selector Header */}
        <View style={[styles.dateHeader, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
          <TouchableOpacity onPress={handlePrevDay} style={styles.arrowBtn} accessibilityLabel="Previous Day">
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.dateCenter}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
              {formattedDate}
            </Text>
          </View>

          <TouchableOpacity onPress={handleNextDay} style={styles.arrowBtn} accessibilityLabel="Next Day">
            <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Completion Progress Bar */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View>
              <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
                DAILY SCHEDULE PROGRESS
              </Text>
              <Text style={[typography.h3, { color: colors.primary, marginTop: 2 }]}>
                {stats.completed} of {stats.total} completed ({stats.percent}%)
              </Text>
            </View>
            <View style={[styles.percentBadge, { backgroundColor: colors.accentMint }]}>
              <Text style={[typography.captionBold, { color: colors.primary }]}>
                {stats.percent}%
              </Text>
            </View>
          </View>
          <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                { backgroundColor: colors.primary, width: `${stats.percent}%` },
              ]}
            />
          </View>
        </Card>

        {/* Scrollable Timeline Schedule */}
        <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
          {/* Daily Priorities Banner */}
          {priorities.length > 0 && (
            <View style={styles.prioritiesSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="star" size={16} color={colors.warning} style={{ marginRight: 6 }} />
                <Text style={[typography.captionBold, { color: colors.textPrimary }]}>
                  TOP PRIORITIES TODAY
                </Text>
              </View>
              {priorities.map((task) => (
                <Card key={task.id} style={styles.priorityCard}>
                  <View style={styles.priorityCardRow}>
                    <Checkbox
                      checked={task.is_completed === 1}
                      onToggle={() => handleToggleTask(task.id)}
                    />
                    <Text
                      style={[
                        typography.bodyBold,
                        {
                          flex: 1,
                          marginLeft: 10,
                          color: task.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                          textDecorationLine: task.is_completed === 1 ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View style={[styles.prioTag, { backgroundColor: colors.dangerSoft }]}>
                      <Text style={[typography.captionBold, { color: colors.danger, fontSize: 10 }]}>
                        HIGH PRIORITY
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Time Slot Blocks */}
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 8, marginTop: 12 }]}>
            SCHEDULE TIMELINE
          </Text>

          {TIME_BLOCKS.map((hour) => {
            const matchingTasks = tasks.filter((t) => t.start_time?.toUpperCase().includes(hour.slice(0, 5)));
            return (
              <View key={hour} style={styles.hourSlot}>
                <View style={styles.hourCol}>
                  <Text style={[typography.captionBold, { color: colors.textSecondary, fontSize: 11 }]}>
                    {hour}
                  </Text>
                </View>

                <View style={styles.slotContent}>
                  {matchingTasks.length === 0 ? (
                    <TouchableOpacity
                      activeOpacity={0.6}
                      onPress={() => handleQuickAddForHour(hour)}
                      style={[styles.emptySlot, { borderColor: colors.border }]}
                    >
                      <Ionicons name="add" size={14} color={colors.textMuted} />
                      <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
                        Add event
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    matchingTasks.map((task) => (
                      <Card
                        key={task.id}
                        style={[
                          styles.slotCard,
                          {
                            borderLeftColor:
                              task.priority === 'high' ? colors.danger : colors.primary,
                            borderLeftWidth: 4,
                          },
                        ]}
                      >
                        <View style={styles.slotCardRow}>
                          <Checkbox
                            checked={task.is_completed === 1}
                            onToggle={() => handleToggleTask(task.id)}
                          />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text
                              style={[
                                typography.bodyBold,
                                {
                                  color: task.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                                  textDecorationLine: task.is_completed === 1 ? 'line-through' : 'none',
                                },
                              ]}
                            >
                              {task.title}
                            </Text>
                            <Text style={[typography.caption, { color: colors.textSecondary }]}>
                              {task.estimated_minutes}m · {task.category}
                              {task.goal_title ? ` · 🎯 ${task.goal_title}` : ''}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedTask(task);
                              setIsRescheduleOpen(true);
                            }}
                            style={{ padding: 4 }}
                          >
                            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      </Card>
                    ))
                  )}
                </View>
              </View>
            );
          })}
          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Add Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Schedule Time Block"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <FormInput
              label="Task / Activity"
              required
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Deep Work Session"
              icon="checkbox-outline"
            />

            <FormTextArea
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Session agenda or notes..."
              numberOfLines={2}
            />

            <View style={styles.splitRow}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <FormInput
                  label="Start Time"
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00 AM"
                  icon="time-outline"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <FormInput
                  label="End Time"
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="10:00 AM"
                  icon="time-outline"
                />
              </View>
            </View>

            <View style={styles.splitRow}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <FormInput
                  label="Duration (minutes)"
                  value={estimatedMinutes}
                  onChangeText={setEstimatedMinutes}
                  placeholder="45"
                  icon="hourglass-outline"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <FormSelect
                  label="Associated Goal"
                  value={goalId}
                  options={goalOptions}
                  onSelect={setGoalId}
                />
              </View>
            </View>

            <FormPriorityPicker value={priority} onChange={setPriority} />

            <Button
              title="Add to Schedule"
              onPress={handleSaveTask}
              variant="primary"
              size="lg"
              style={{ marginTop: 20 }}
            />
          </ScrollView>
        </BottomSheetModal>

        {/* Reschedule Modal */}
        <BottomSheetModal
          visible={isRescheduleOpen}
          onClose={() => setIsRescheduleOpen(false)}
          title="Reschedule Time Block"
        >
          <View style={{ paddingBottom: 20 }}>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: 16 }]}>
              Move "{selectedTask?.title}" to another day:
            </Text>
            <Button
              title="Move to Tomorrow (+1 Day)"
              onPress={() => handleReschedule(1)}
              variant="secondary"
              size="md"
              style={{ marginBottom: 10 }}
            />
            <Button
              title="Move +2 Days"
              onPress={() => handleReschedule(2)}
              variant="secondary"
              size="md"
              style={{ marginBottom: 10 }}
            />
            <Button
              title="Move to Next Week (+7 Days)"
              onPress={() => handleReschedule(7)}
              variant="secondary"
              size="md"
              style={{ marginBottom: 10 }}
            />
          </View>
        </BottomSheetModal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  headerTitle: {
    fontWeight: '800',
    flexShrink: 1,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  arrowBtn: {
    padding: 6,
  },
  dateCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsCard: {
    padding: 12,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  timelineScroll: {
    flex: 1,
  },
  prioritiesSection: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  priorityCard: {
    padding: 10,
    marginBottom: 6,
  },
  priorityCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prioTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  hourSlot: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  hourCol: {
    width: 65,
    paddingTop: 8,
  },
  slotContent: {
    flex: 1,
  },
  emptySlot: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCard: {
    padding: 10,
    marginBottom: 6,
  },
  slotCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalForm: {
    paddingBottom: 24,
  },
  splitRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
