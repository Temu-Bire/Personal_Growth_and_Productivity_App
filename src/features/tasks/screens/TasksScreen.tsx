import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Checkbox } from '../../../components/ui/Checkbox';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { TasksRepository } from '../tasks.repository';
import { Task } from '../tasks.types';

export const TasksScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography, radius } = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'schedule'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for Add Task
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Study');
  const [newStartTime, setNewStartTime] = useState('09:00 AM');
  const [newEndTime, setNewEndTime] = useState('10:30 AM');
  const [isPriority, setIsPriority] = useState(false);

  const loadTasks = useCallback(() => {
    const list = TasksRepository.getTasksByDate(selectedDate);
    setTasks(list);
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
      if (route.params?.openAdd) {
        setIsAddModalOpen(true);
      }
    }, [loadTasks, route.params])
  );

  const handlePrevDay = () => {
    const prev = format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    setSelectedDate(next);
  };

  const handleToggleTask = (taskId: string) => {
    TasksRepository.toggleComplete(taskId);
    loadTasks();
  };

  const handleCreateTask = () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Task title cannot be empty.');
      return;
    }

    TasksRepository.create({
      title: newTitle.trim(),
      date: selectedDate,
      start_time: newStartTime,
      end_time: newEndTime,
      category: newCategory,
      priority: isPriority ? 'high' : 'medium',
      is_priority: isPriority ? 1 : 0,
      reminder_time: null,
      repeat: 'none',
    });

    setNewTitle('');
    setIsAddModalOpen(false);
    loadTasks();
  };

  const formattedDate = format(parseISO(selectedDate), 'EEE, MMM d, yyyy');

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Top Navigation Bar with Back Button */}
        <View style={styles.topNav}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, typography.h2, { color: colors.textPrimary }]}>
            Tasks & Schedule
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Date Selector Header */}
        <View style={styles.dateHeader}>
          <TouchableOpacity onPress={handlePrevDay} style={styles.arrowBtn} accessibilityLabel="Previous Day">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.dateCenter}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.dateText, typography.h2, { color: colors.textPrimary }]}>
              {formattedDate}
            </Text>
          </View>

          <TouchableOpacity onPress={handleNextDay} style={styles.arrowBtn} accessibilityLabel="Next Day">
            <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Segmented Tabs: Tasks vs Schedule */}
        <SegmentedTabs
          tabs={[
            { key: 'tasks', label: 'Tasks' },
            { key: 'schedule', label: 'Schedule' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Content */}
        {activeTab === 'tasks' ? (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollListPadding}
            showsVerticalScrollIndicator={false}
          >
            {tasks.length === 0 ? (
              <EmptyState
                icon="checkbox-outline"
                title="No tasks scheduled"
                description="Add tasks to stay organized and build momentum today."
                actionTitle="+ Add First Task"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              tasks.map((task) => (
                <Card key={task.id} style={styles.taskCard}>
                  <View style={styles.taskRow}>
                    <Checkbox
                      checked={task.is_completed === 1}
                      onToggle={() => handleToggleTask(task.id)}
                    />
                    <View style={styles.taskDetails}>
                      <Text
                        style={[
                          styles.taskTitle,
                          typography.bodyMedium,
                          {
                            color: task.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                            textDecorationLine: task.is_completed === 1 ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {task.title}
                      </Text>
                      {task.start_time && (
                        <Text style={[typography.caption, { color: colors.textMuted }]}>
                          {task.start_time} {task.end_time ? `- ${task.end_time}` : ''}
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.catBadge,
                        {
                          backgroundColor:
                            task.category === 'Study'
                              ? colors.accentMint
                              : task.category === 'Work'
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
                              task.category === 'Study'
                                ? colors.primary
                                : task.category === 'Work'
                                ? colors.purple
                                : colors.orange,
                          },
                        ]}
                      >
                        {task.category}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
            <View style={{ height: 80 }} />
          </ScrollView>
        ) : (
          /* Schedule Timeline View */
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.scrollListPadding}
            showsVerticalScrollIndicator={false}
          >
            {tasks.map((task, idx) => (
              <View key={task.id} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    {task.start_time || 'All Day'}
                  </Text>
                  {idx < tasks.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                  )}
                </View>

                <Card style={[styles.timelineCard, { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
                  <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
                    {task.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                    {task.category} · {task.start_time} - {task.end_time}
                  </Text>
                </Card>
              </View>
            ))}
            <View style={{ height: 80 }} />
          </ScrollView>
        )}

        {/* Bottom Add Task Button */}
        <View style={[styles.bottomBar, { bottom: Math.max(insets.bottom, 16) }]}>
          <Button
            title="+ Add Task"
            onPress={() => setIsAddModalOpen(true)}
            variant="primary"
            size="lg"
            style={styles.shadowBtn}
          />
        </View>

        {/* Add Task Sheet Modal */}
        <BottomSheetModal
          visible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Task"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Task Title
            </Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="e.g. Study Mathematics"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Start Time
                </Text>
                <TextInput
                  value={newStartTime}
                  onChangeText={setNewStartTime}
                  placeholder="09:00 AM"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  End Time
                </Text>
                <TextInput
                  value={newEndTime}
                  onChangeText={setNewEndTime}
                  placeholder="10:30 AM"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Category
            </Text>
            <View style={styles.catPicker}>
              {['Study', 'Work', 'Habits', 'General'].map((cat) => {
                const isSelected = newCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewCategory(cat)}
                    style={[
                      styles.catChoice,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.inputBg,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setIsPriority(!isPriority)}
              style={styles.priorityToggle}
            >
              <Checkbox checked={isPriority} onToggle={() => setIsPriority(!isPriority)} />
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, marginLeft: 8 }]}>
                Mark as Today's Priority
              </Text>
            </TouchableOpacity>

            <Button
              title="Save Task"
              onPress={handleCreateTask}
              variant="primary"
              size="lg"
              style={{ marginTop: 20 }}
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
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontWeight: '700',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  arrowBtn: {
    padding: 8,
  },
  dateCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  scrollListPadding: {
    paddingBottom: 110,
  },
  taskCard: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetails: {
    flex: 1,
    marginHorizontal: 10,
  },
  taskTitle: {
    fontWeight: '600',
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    width: 80,
    alignItems: 'center',
    paddingTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
  },
  timelineCard: {
    flex: 1,
    padding: 14,
  },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  shadowBtn: {
    shadowColor: '#1E8E4E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  modalForm: {
    paddingTop: 8,
  },
  formLabel: {
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
  },
  catPicker: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  catChoice: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  priorityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
});

