import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Checkbox } from '../../../components/ui/Checkbox';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { TasksRepository } from '../tasks.repository';
import { Task, TaskPriority } from '../tasks.types';
import { GoalsRepository, Goal } from '../../goals/goals.repository';
import { ProjectsRepository, Project } from '../../projects/projects.repository';
import {
  FormInput,
  FormTextArea,
  FormSelect,
} from '../../../components/forms';

type TaskFilter = 'all' | 'today' | 'upcoming' | 'done';

const FILTER_CHIPS: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'done', label: 'Done' },
];

const CATEGORY_OPTIONS = [
  { label: 'None', value: 'None' },
  { label: 'Health', value: 'Health' },
  { label: 'Career', value: 'Career' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Learning', value: 'Learning' },
  { label: 'Faith', value: 'Faith' },
  { label: 'Personal', value: 'Personal' },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export const TasksScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors, typography, radius, isDark } = useTheme();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('None');
  const [goalId, setGoalId] = useState('none');
  const [projectId, setProjectId] = useState('none');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(todayStr);
  const [durationMinutes, setDurationMinutes] = useState('30');

  const loadData = useCallback(() => {
    let list = TasksRepository.getTasks();

    if (filter === 'today') {
      list = list.filter((t) => t.date === todayStr);
    } else if (filter === 'upcoming') {
      list = list.filter((t) => t.date > todayStr && t.is_completed === 0);
    } else if (filter === 'done') {
      list = list.filter((t) => t.is_completed === 1);
    }

    setTasks(list);
    setGoals(GoalsRepository.getAllWithProgress({ status: 'active' }));
    setProjects(ProjectsRepository.getAll('active'));
  }, [filter, todayStr]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      if (route.params?.openAdd) {
        setIsAddOpen(true);
      }
    }, [loadData, route.params])
  );

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('None');
    setGoalId('none');
    setProjectId('none');
    setPriority('medium');
    setDueDate(todayStr);
    setDurationMinutes('30');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleCreateTask = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }

    TasksRepository.create({
      title: title.trim(),
      notes: description.trim() || null,
      date: dueDate.trim() || todayStr,
      category: category === 'None' ? 'General' : category,
      priority,
      goal_id: goalId === 'none' ? null : goalId,
      project_id: projectId === 'none' ? null : projectId,
      estimated_minutes: parseInt(durationMinutes, 10) || 30,
      is_priority: priority === 'high' ? 1 : 0,
    });

    setIsAddOpen(false);
    resetForm();
    loadData();
  };

  const handleToggleTask = (taskId: string) => {
    TasksRepository.toggleComplete(taskId);
    loadData();
  };

  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.notes || '');
    setCategory(task.category || 'None');
    setGoalId(task.goal_id || 'none');
    setProjectId(task.project_id || 'none');
    setPriority(task.priority);
    setDueDate(task.date);
    setDurationMinutes(String(task.estimated_minutes || 30));
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedTask || !title.trim()) return;

    TasksRepository.update(selectedTask.id, {
      title: title.trim(),
      notes: description.trim() || null,
      date: dueDate.trim() || todayStr,
      category: category === 'None' ? 'General' : category,
      priority,
      goal_id: goalId === 'none' ? null : goalId,
      project_id: projectId === 'none' ? null : projectId,
      estimated_minutes: parseInt(durationMinutes, 10) || 30,
      is_priority: priority === 'high' ? 1 : 0,
    });

    setIsEditOpen(false);
    setSelectedTask(null);
    resetForm();
    loadData();
  };

  const handleDelete = (task: Task) => {
    Alert.alert('Delete Task', `Are you sure you want to delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          TasksRepository.delete(task.id);
          loadData();
        },
      },
    ]);
  };

  const goalOptions = [
    { label: 'None', value: 'none' },
    ...goals.map((g) => ({ label: g.title, value: g.id })),
  ];

  const projectOptions = [
    { label: 'None', value: 'none' },
    ...projects.map((p) => ({ label: p.name, value: p.id })),
  ];

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h1, { color: colors.textPrimary }]}>Tasks</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            One-time todos
          </Text>
        </View>

        {/* Filter Chips: All, Today, Upcoming, Done */}
        <View style={styles.filterRow}>
          {FILTER_CHIPS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
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
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tasks List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {tasks.length === 0 ? (
            <EmptyState
              icon="checkbox-outline"
              title="No tasks here"
              description="Keep momentum by capturing your todos."
              actionTitle="+ Add Task"
              onAction={handleOpenAdd}
            />
          ) : (
            tasks.map((task) => {
              const isDone = task.is_completed === 1;
              const isToday = task.date === todayStr;

              // Matching Dayvane design: "Career - Due today" or "Project: Restaurant - Nov 12"
              let subtext = '';
              if (task.project_name) {
                subtext = `Project: ${task.project_name} - ${task.date}`;
              } else if (isDone) {
                subtext = `${task.category} - Done`;
              } else if (isToday) {
                subtext = `${task.category} - Due today`;
              } else {
                subtext = `${task.category} - ${task.date}`;
              }

              return (
                <Card
                  key={task.id}
                  style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.taskRow}>
                    <Checkbox checked={isDone} onToggle={() => handleToggleTask(task.id)} />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOpenEdit(task)}
                      style={styles.taskDetails}
                    >
                      <Text
                        style={[
                          typography.bodyBold,
                          {
                            color: isDone ? colors.textMuted : colors.textPrimary,
                            textDecorationLine: isDone ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {task.title}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                        {subtext}
                        {task.goal_title ? ` · 🎯 ${task.goal_title}` : ''}
                      </Text>
                    </TouchableOpacity>

                    {/* Priority Badge */}
                    <View
                      style={[
                        styles.priorityBadge,
                        task.priority === 'high'
                          ? { borderColor: '#EF4444' }
                          : task.priority === 'medium'
                          ? { borderColor: '#EAB308' }
                          : { borderColor: '#3B82F6' },
                      ]}
                    >
                      <Text
                        style={[
                          typography.captionBold,
                          {
                            color:
                              task.priority === 'high'
                                ? '#EF4444'
                                : task.priority === 'medium'
                                ? '#EAB308'
                                : '#3B82F6',
                            fontSize: 10,
                          },
                        ]}
                      >
                        {task.priority === 'high'
                          ? 'HIGH'
                          : task.priority === 'medium'
                          ? 'MED'
                          : 'LOW'}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>

        {/* Floating + Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleOpenAdd}
          style={[styles.fab, { backgroundColor: isDark ? '#FFFFFF' : '#09090B' }]}
          accessibilityRole="button"
          accessibilityLabel="Add Task"
        >
          <Ionicons name="add" size={28} color={isDark ? '#09090B' : '#FFFFFF'} />
        </TouchableOpacity>

        {/* New Task Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="New task"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <FormInput
              label="Title"
              required
              value={title}
              onChangeText={(text) => {
                if (text.length <= 75) setTitle(text);
              }}
              placeholder="e.g. Finish resume"
              characterCount={{ current: title.length, max: 75 }}
            />

            <FormTextArea
              label="Description"
              value={description}
              onChangeText={(text) => {
                if (text.length <= 200) setDescription(text);
              }}
              placeholder="Optional notes about this task"
              characterCount={{ current: description.length, max: 200 }}
              numberOfLines={3}
            />

            <FormSelect
              label="Category"
              value={category}
              options={CATEGORY_OPTIONS}
              onSelect={setCategory}
            />

            <FormSelect
              label="Linked goal"
              value={goalId}
              options={goalOptions}
              onSelect={setGoalId}
            />

            <FormSelect
              label="Project"
              value={projectId}
              options={projectOptions}
              onSelect={setProjectId}
            />

            <FormSelect
              label="Priority"
              value={priority}
              options={PRIORITY_OPTIONS}
              onSelect={(val) => setPriority(val as TaskPriority)}
            />

            <FormInput
              label="Due date"
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="mm/dd/yyyy"
              icon="calendar-outline"
            />

            <FormInput
              label="Duration (minutes)"
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              placeholder="e.g. 30"
              keyboardType="numeric"
            />

            <Button
              title="Add task"
              onPress={handleCreateTask}
              variant="primary"
              size="lg"
              style={{ marginTop: 14 }}
            />
            <Button
              title="Cancel"
              onPress={() => setIsAddOpen(false)}
              variant="ghost"
              size="md"
              style={{ marginTop: 8 }}
            />
          </ScrollView>
        </BottomSheetModal>

        {/* Edit Task Modal */}
        <BottomSheetModal
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit task"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <FormInput
              label="Title"
              required
              value={title}
              onChangeText={(text) => {
                if (text.length <= 75) setTitle(text);
              }}
              placeholder="e.g. Finish resume"
              characterCount={{ current: title.length, max: 75 }}
            />

            <FormTextArea
              label="Description"
              value={description}
              onChangeText={(text) => {
                if (text.length <= 200) setDescription(text);
              }}
              placeholder="Optional notes about this task"
              characterCount={{ current: description.length, max: 200 }}
              numberOfLines={3}
            />

            <FormSelect
              label="Category"
              value={category}
              options={CATEGORY_OPTIONS}
              onSelect={setCategory}
            />

            <FormSelect
              label="Linked goal"
              value={goalId}
              options={goalOptions}
              onSelect={setGoalId}
            />

            <FormSelect
              label="Project"
              value={projectId}
              options={projectOptions}
              onSelect={setProjectId}
            />

            <FormSelect
              label="Priority"
              value={priority}
              options={PRIORITY_OPTIONS}
              onSelect={(val) => setPriority(val as TaskPriority)}
            />

            <FormInput
              label="Due date"
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="mm/dd/yyyy"
            />

            <FormInput
              label="Duration (minutes)"
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              placeholder="e.g. 30"
              keyboardType="numeric"
            />

            <Button
              title="Save changes"
              onPress={handleSaveEdit}
              variant="primary"
              size="lg"
              style={{ marginTop: 14 }}
            />
            <Button
              title="Delete task"
              onPress={() => {
                if (selectedTask) handleDelete(selectedTask);
                setIsEditOpen(false);
              }}
              variant="danger"
              size="md"
              style={{ marginTop: 8 }}
            />
          </ScrollView>
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
    paddingVertical: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  taskCard: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetails: {
    flex: 1,
    marginLeft: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalForm: {
    paddingBottom: 24,
  },
});
