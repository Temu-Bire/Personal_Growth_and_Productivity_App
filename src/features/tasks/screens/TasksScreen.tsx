import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { CustomizationRepository } from '../../customization/customization.repository';
import { ViewModeSwitcher } from '../../customization/components/ViewModeSwitcher';
import { CustomFieldsSection } from '../../customization/components/CustomFieldsSection';
import { CustomFieldsBadgeRow } from '../../customization/components/CustomFieldsBadgeRow';
import { sortItemsByLayout } from '../../customization/layout.utils';
import { TasksRepository } from '../tasks.repository';
import { Task } from '../tasks.types';

export const TasksScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, typography, radius } = useTheme();
  const pageLayout = useCustomizationStore((state) => state.pageLayouts['tasks']);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'schedule'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>(['Study', 'Work', 'Habits', 'Personal', 'General']);

  // Form states for Add Task
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Study');
  const [newStartTime, setNewStartTime] = useState('09:00 AM');
  const [newEndTime, setNewEndTime] = useState('10:30 AM');
  const [isPriority, setIsPriority] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  const loadTasks = useCallback(() => {
    const list = TasksRepository.getTasksByDate(selectedDate);
    setTasks(list);

    // Merge custom categories
    const customCats = CustomizationRepository.getCategories('tasks');
    const base = ['Study', 'Work', 'Habits', 'Personal', 'General'];
    customCats.forEach((c) => {
      if (!base.includes(c.name)) base.push(c.name);
    });
    setCategories(base);
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

    const created = TasksRepository.create({
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

    if (created && Object.keys(customFieldValues).length > 0) {
      CustomizationRepository.saveFieldValues('tasks', created.id, customFieldValues);
    }

    setNewTitle('');
    setCustomFieldValues({});
    setIsAddModalOpen(false);
    loadTasks();
  };

  const formattedDate = format(parseISO(selectedDate), 'EEE, MMM d, yyyy');

  const sortedTasks = useMemo(() => {
    return sortItemsByLayout(tasks, pageLayout);
  }, [tasks, pageLayout]);

  const viewMode = pageLayout?.viewMode || 'card';
  const visibleFields = pageLayout?.visibleFields || [
    'show_dates',
    'show_categories',
    'show_progress',
    'show_notes',
    'show_status',
  ];

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Top Header with Menu Button & View Switcher */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => (navigation as any).openDrawer ? (navigation as any).openDrawer() : navigation.goBack()}
              style={[styles.menuBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Open Menu"
            >
              <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary, marginLeft: 12 }]} numberOfLines={1}>
              Tasks & Schedule
            </Text>
          </View>

          <View style={styles.headerRight}>
            <ViewModeSwitcher pageKey="tasks" />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAddModalOpen(true)}
              style={[styles.addBtn, { backgroundColor: colors.accentMint, marginLeft: 8 }]}
              accessibilityRole="button"
              accessibilityLabel="Add Task"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
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
            contentContainerStyle={[
              styles.scrollListPadding,
              viewMode === 'grid' && styles.gridContainer,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {sortedTasks.length === 0 ? (
              <EmptyState
                icon="checkbox-outline"
                title="No tasks scheduled"
                description="Add tasks to stay organized and build momentum today."
                actionTitle="+ Add First Task"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              sortedTasks.map((task) => {
                // 1. Compact View Mode
                if (viewMode === 'compact') {
                  return (
                    <Card key={task.id} style={styles.compactCard}>
                      <View style={styles.compactRow}>
                        <Checkbox
                          checked={task.is_completed === 1}
                          onToggle={() => handleToggleTask(task.id)}
                        />
                        <Text
                          style={[
                            typography.bodyBold,
                            {
                              flex: 1,
                              marginLeft: 8,
                              color: task.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                              textDecorationLine: task.is_completed === 1 ? 'line-through' : 'none',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {task.title}
                        </Text>
                        {visibleFields.includes('show_categories') && (
                          <View style={[styles.compactBadge, { backgroundColor: colors.accentMint }]}>
                            <Text style={[typography.captionBold, { color: colors.primary, fontSize: 10 }]}>
                              {task.category}
                            </Text>
                          </View>
                        )}
                      </View>
                    </Card>
                  );
                }

                // 2. List View Mode
                if (viewMode === 'list') {
                  return (
                    <Card key={task.id} style={styles.listCard}>
                      <View style={styles.listRow}>
                        <Checkbox
                          checked={task.is_completed === 1}
                          onToggle={() => handleToggleTask(task.id)}
                        />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text
                            style={[
                              typography.bodyBold,
                              {
                                color: task.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                                textDecorationLine: task.is_completed === 1 ? 'line-through' : 'none',
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {task.title}
                          </Text>
                          <Text style={[typography.caption, { color: colors.textSecondary }]}>
                            {task.start_time || 'Today'} · {task.category}
                          </Text>
                        </View>
                        {visibleFields.includes('show_status') && task.is_priority === 1 && (
                          <View style={[styles.compactBadge, { backgroundColor: colors.dangerSoft }]}>
                            <Text style={[typography.captionBold, { color: colors.danger, fontSize: 10 }]}>
                              PRIORITY
                            </Text>
                          </View>
                        )}
                      </View>
                    </Card>
                  );
                }

                // 3. Grid View Mode
                if (viewMode === 'grid') {
                  return (
                    <Card key={task.id} style={styles.gridCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Checkbox
                          checked={task.is_completed === 1}
                          onToggle={() => handleToggleTask(task.id)}
                        />
                        <Text
                          style={[
                            typography.captionBold,
                            {
                              flex: 1,
                              marginLeft: 6,
                              color: task.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                              textDecorationLine: task.is_completed === 1 ? 'line-through' : 'none',
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {task.title}
                        </Text>
                      </View>
                      <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 11 }]}>
                        {task.start_time || 'All Day'}
                      </Text>
                      {visibleFields.includes('show_categories') && (
                        <View style={[styles.compactBadge, { backgroundColor: colors.accentMint, alignSelf: 'flex-start', marginTop: 4 }]}>
                          <Text style={[typography.captionBold, { color: colors.primary, fontSize: 9 }]}>
                            {task.category}
                          </Text>
                        </View>
                      )}
                    </Card>
                  );
                }

                // 4. Card View Mode (Standard)
                return (
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
                        {visibleFields.includes('show_dates') && task.start_time && (
                          <Text style={[typography.caption, { color: colors.textMuted }]}>
                            {task.start_time} {task.end_time ? `- ${task.end_time}` : ''}
                          </Text>
                        )}
                      </View>

                      {visibleFields.includes('show_categories') && (
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
                      )}
                    </View>

                    {/* Custom fields badges */}
                    <CustomFieldsBadgeRow entityType="tasks" entityId={task.id} />
                  </Card>
                );
              })
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
                  <CustomFieldsBadgeRow entityType="tasks" entityId={task.id} />
                </Card>
              </View>
            ))}
            <View style={{ height: 24 }} />
          </ScrollView>
        )}

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
              {categories.map((cat) => {
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

            {/* Custom Fields Section */}
            <CustomFieldsSection
              entityType="tasks"
              values={customFieldValues}
              onChange={(k, v) => setCustomFieldValues((prev) => ({ ...prev, [k]: v }))}
            />

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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
    flexShrink: 1,
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
    marginTop: 10,
  },
  scrollListPadding: {
    paddingBottom: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  compactCard: {
    marginBottom: 8,
    padding: 10,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  listCard: {
    marginBottom: 8,
    padding: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    marginBottom: 10,
    padding: 10,
  },
  taskCard: {
    marginBottom: 10,
    padding: 14,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetails: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontWeight: '600',
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineLeft: {
    width: 70,
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
  },
  timelineCard: {
    flex: 1,
    marginLeft: 10,
    padding: 14,
  },
  modalForm: {
    paddingBottom: 24,
  },
  formLabel: {
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
  },
  catPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  catChoice: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  priorityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});
