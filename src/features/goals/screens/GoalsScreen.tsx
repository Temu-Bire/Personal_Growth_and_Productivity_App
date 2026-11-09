import React, { useState, useCallback, useMemo } from 'react';
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
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { CustomizationRepository } from '../../customization/customization.repository';
import { ViewModeSwitcher } from '../../customization/components/ViewModeSwitcher';
import { CustomFieldsSection } from '../../customization/components/CustomFieldsSection';
import { CustomFieldsBadgeRow } from '../../customization/components/CustomFieldsBadgeRow';
import { sortItemsByLayout } from '../../customization/layout.utils';
import {
  FormInput,
  FormTextArea,
  FormPriorityPicker,
  FormSelect,
  Priority,
} from '../../../components/forms';
import {
  GoalsRepository,
  Goal,
  Milestone,
  GoalTermType,
  GoalStatus,
} from '../goals.repository';
import {
  GOAL_CATEGORIES,
  GOAL_CATEGORY_CONFIG,
} from '../goals.constants';

const TERM_OPTIONS = [
  { label: 'Short-Term Goal (< 6 months)', value: 'short_term', icon: 'flash-outline' as const },
  { label: 'Long-Term Goal (1+ year)', value: 'long_term', icon: 'ribbon-outline' as const },
];

export const GoalsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const pageLayout = useCustomizationStore((state) => state.pageLayouts['goals']);

  const [termFilter, setTermFilter] = useState<'all' | 'short_term' | 'long_term'>('all');
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [milestonesMap, setMilestonesMap] = useState<Record<string, Milestone[]>>({});
  const [dynamicCategories, setDynamicCategories] = useState<{ name: string; color: string; icon: string }[]>([]);

  // Add Milestone inline input state
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [addingMilestoneGoalId, setAddingMilestoneGoalId] = useState<string | null>(null);

  // Add Goal Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-31');
  const [category, setCategory] = useState<string>('Health');
  const [termType, setTermType] = useState<GoalTermType>('short_term');
  const [priority, setPriority] = useState<Priority>('medium');
  const [initialMilestones, setInitialMilestones] = useState('');
  const [addCustomValues, setAddCustomValues] = useState<Record<string, any>>({});

  // Edit Goal Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editCategory, setEditCategory] = useState<string>('Health');
  const [editTermType, setEditTermType] = useState<GoalTermType>('short_term');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editStatus, setEditStatus] = useState<GoalStatus>('active');
  const [editCustomValues, setEditCustomValues] = useState<Record<string, any>>({});

  const loadGoals = useCallback(() => {
    const list = GoalsRepository.getAllWithProgress({
      status: statusFilter === 'all' ? undefined : statusFilter,
      termType: termFilter === 'all' ? undefined : termFilter,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
    });
    setGoals(list);

    const map: Record<string, Milestone[]> = {};
    list.forEach((g) => {
      map[g.id] = GoalsRepository.getMilestones(g.id);
    });
    setMilestonesMap(map);

    // Dynamic Categories
    const customCats = CustomizationRepository.getCategories('goals');
    const mergedCats: { name: string; color: string; icon: string }[] = GOAL_CATEGORIES.map((cat) => ({
      name: cat,
      color: GOAL_CATEGORY_CONFIG[cat]?.color || '#10B981',
      icon: GOAL_CATEGORY_CONFIG[cat]?.icon || 'bookmark-outline',
    }));

    customCats.forEach((c) => {
      if (!mergedCats.some((m) => m.name.toLowerCase() === c.name.toLowerCase())) {
        mergedCats.push({
          name: c.name,
          color: c.color,
          icon: c.icon || 'bookmark-outline',
        });
      }
    });
    setDynamicCategories(mergedCats);
  }, [statusFilter, termFilter, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  const sortedGoals = useMemo(() => {
    return sortItemsByLayout(goals, pageLayout);
  }, [goals, pageLayout]);

  const viewMode = pageLayout?.viewMode || 'card';

  const handleToggleMilestone = (milestoneId: string) => {
    GoalsRepository.toggleMilestone(milestoneId);
    loadGoals();
  };

  const handleAddMilestoneInline = (goalId: string) => {
    if (!newMilestoneText.trim()) return;
    GoalsRepository.addMilestone(goalId, newMilestoneText.trim());
    setNewMilestoneText('');
    setAddingMilestoneGoalId(null);
    loadGoals();
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    GoalsRepository.deleteMilestone(milestoneId);
    loadGoals();
  };

  const handleCreateGoal = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a goal title.');
      return;
    }

    const milestonesList = initialMilestones
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);

    const created = GoalsRepository.createGoal({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      category,
      termType,
      priority,
      milestones: milestonesList,
    });

    if (created && Object.keys(addCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('goals', created.id, addCustomValues);
    }

    setTitle('');
    setDescription('');
    setInitialMilestones('');
    setCategory('Health');
    setTermType('short_term');
    setPriority('medium');
    setAddCustomValues({});
    setIsAddOpen(false);
    loadGoals();
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditDescription(goal.description || '');
    setEditDueDate(goal.target_date || goal.due_date);
    setEditCategory(goal.category || 'Health');
    setEditTermType(goal.term_type || 'short_term');
    setEditPriority(goal.priority || 'medium');
    setEditStatus(goal.status || 'active');
    const existingVals = CustomizationRepository.getFieldValues('goals', goal.id);
    setEditCustomValues(existingVals);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingGoal || !editTitle.trim()) {
      Alert.alert('Required', 'Please enter a goal title.');
      return;
    }

    GoalsRepository.updateGoal(editingGoal.id, {
      title: editTitle,
      description: editDescription,
      dueDate: editDueDate,
      category: editCategory,
      termType: editTermType,
      priority: editPriority,
      status: editStatus,
    });

    if (Object.keys(editCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('goals', editingGoal.id, editCustomValues);
    }

    setIsEditOpen(false);
    setEditingGoal(null);
    setEditCustomValues({});
    loadGoals();
  };

  const handleStatusChange = (goal: Goal, newStatus: GoalStatus) => {
    GoalsRepository.setGoalStatus(goal.id, newStatus);
    loadGoals();
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}" and its milestones? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            GoalsRepository.deleteGoal(goal.id);
            loadGoals();
          },
        },
      ]
    );
  };

  const toggleExpand = (goalId: string) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  const categorySelectOptions = dynamicCategories.map((c) => ({
    label: c.name,
    value: c.name,
    icon: c.icon as any,
    color: c.color,
  }));

  return (
    <Screen backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.openDrawer())}
              style={[styles.menuBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name={navigation.canGoBack() ? 'arrow-back' : 'menu-outline'} size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary }]} numberOfLines={1}>
                Goals
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Long-term objectives, broken into tasks
              </Text>
            </View>
          </View>
        </View>

        {/* Status Filter Chips: Active, Done, Paused */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {[
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Done' },
              { key: 'paused', label: 'Paused' },
            ].map((tab) => {
              const isSelected = statusFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setStatusFilter(tab.key as any)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? colors.card : 'transparent',
                      borderColor: isSelected ? colors.textPrimary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: isSelected ? colors.textPrimary : colors.textSecondary },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Category Horizontal Filter Bar */}
        <View style={{ marginBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6 }}>
            {['All', ...dynamicCategories.map((c) => c.name)].map((catName) => {
              const isSelected = selectedCategory === catName;
              return (
                <TouchableOpacity
                  key={catName}
                  onPress={() => setSelectedCategory(catName)}
                  style={[
                    styles.catChip,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? `${colors.primary}18` : colors.surface,
                      borderRadius: radius.sm,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: isSelected ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {catName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Goals Feed */}
        <ScrollView style={styles.list} contentContainerStyle={styles.scrollListPadding} showsVerticalScrollIndicator={false}>
          {sortedGoals.length === 0 ? (
            <EmptyState
              icon="flag-outline"
              title="No goals found"
              description="Define short-term and long-term milestones to direct your personal growth."
              actionTitle="+ Create First Goal"
              onAction={() => setIsAddOpen(true)}
            />
          ) : (
            sortedGoals.map((goal) => {
              const isExpanded = expandedGoalId === goal.id;
              const milestones = milestonesMap[goal.id] || [];
              const progress = goal.progressPercent ?? 0;
              const isCompleted = goal.status === 'completed';
              const isPaused = goal.status === 'paused';

              return (
                <Card key={goal.id} style={styles.goalCard}>
                  {/* Goal Header */}
                  <View style={styles.goalTopRow}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <View style={[styles.badge, { backgroundColor: colors.accentMint }]}>
                          <Text style={[typography.captionBold, { color: colors.primary, fontSize: 10 }]}>
                            {goal.category}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                goal.priority === 'high'
                                  ? '#FEE2E2'
                                  : goal.priority === 'medium'
                                  ? '#FEF3C7'
                                  : '#D1FAE5',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              typography.captionBold,
                              {
                                color:
                                  goal.priority === 'high'
                                    ? '#EF4444'
                                    : goal.priority === 'medium'
                                    ? '#D97706'
                                    : '#10B981',
                                fontSize: 10,
                              },
                            ]}
                          >
                            {goal.priority.toUpperCase()}
                          </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: colors.inputBg }]}>
                          <Text style={[typography.captionBold, { color: colors.textMuted, fontSize: 10 }]}>
                            {goal.term_type === 'short_term' ? 'SHORT TERM' : 'LONG TERM'}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={[
                          typography.h3,
                          {
                            color: colors.textPrimary,
                            textDecorationLine: isCompleted ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {goal.title}
                      </Text>

                      {goal.description ? (
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
                          {goal.description}
                        </Text>
                      ) : null}
                    </View>

                    {/* Progress Percentage Badge */}
                    <View style={styles.progressBadgeCol}>
                      <Text style={[typography.h2, { color: isCompleted ? colors.primary : colors.textPrimary, fontWeight: '800' }]}>
                        {progress}%
                      </Text>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        {goal.completedMilestonesCount || 0}/{goal.milestonesCount || 0} checks
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <ProgressBar
                    progress={progress}
                    color={isCompleted ? colors.primary : colors.primaryLight}
                    style={{ marginTop: 12, marginBottom: 8 }}
                  />

                  {/* Custom fields row */}
                  <CustomFieldsBadgeRow entityType="goals" entityId={goal.id} />

                  {/* Bottom Action Footer */}
                  <View style={styles.goalBottomBar}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        Target: {goal.target_date || goal.due_date}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {/* Pause / Resume */}
                      <TouchableOpacity
                        onPress={() => handleStatusChange(goal, isPaused ? 'active' : 'paused')}
                        style={styles.actionIconBtn}
                        accessibilityLabel="Pause or resume"
                      >
                        <Ionicons
                          name={isPaused ? 'play-outline' : 'pause-outline'}
                          size={18}
                          color={isPaused ? colors.primary : colors.textMuted}
                        />
                      </TouchableOpacity>

                      {/* Edit */}
                      <TouchableOpacity
                        onPress={() => handleOpenEdit(goal)}
                        style={styles.actionIconBtn}
                        accessibilityLabel="Edit goal"
                      >
                        <Ionicons name="pencil-outline" size={18} color={colors.textMuted} />
                      </TouchableOpacity>

                      {/* Expand Milestones Toggle */}
                      <TouchableOpacity
                        onPress={() => toggleExpand(goal.id)}
                        style={[
                          styles.expandBtn,
                          {
                            backgroundColor: isExpanded ? colors.accentMint : colors.inputBg,
                            borderRadius: radius.sm,
                          },
                        ]}
                      >
                        <Text style={[typography.captionBold, { color: isExpanded ? colors.primary : colors.textSecondary }]}>
                          Milestones ({milestones.length})
                        </Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color={isExpanded ? colors.primary : colors.textSecondary}
                          style={{ marginLeft: 4 }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Expanded Milestones Checklist */}
                  {isExpanded && (
                    <View style={[styles.milestonesDrawer, { borderTopColor: colors.border }]}>
                      {milestones.length === 0 ? (
                        <Text style={[typography.caption, { color: colors.textMuted, marginVertical: 6 }]}>
                          No milestones added yet. Add checkpoints to track progress automatically.
                        </Text>
                      ) : (
                        milestones.map((m) => {
                          const mDone = m.is_completed === 1;
                          return (
                            <View key={m.id} style={styles.milestoneItem}>
                              <Checkbox
                                checked={mDone}
                                onToggle={() => handleToggleMilestone(m.id)}
                              />
                              <Text
                                style={[
                                  styles.milestoneText,
                                  typography.body,
                                  {
                                    color: mDone ? colors.textMuted : colors.textPrimary,
                                    textDecorationLine: mDone ? 'line-through' : 'none',
                                  },
                                ]}
                              >
                                {m.title}
                              </Text>
                              <TouchableOpacity
                                onPress={() => handleDeleteMilestone(m.id)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
                              </TouchableOpacity>
                            </View>
                          );
                        })
                      )}

                      {/* Inline Add Milestone */}
                      {addingMilestoneGoalId === goal.id ? (
                        <View style={{ marginTop: 8 }}>
                          <FormInput
                            label="New Milestone Checkpoint"
                            value={newMilestoneText}
                            onChangeText={setNewMilestoneText}
                            placeholder="e.g. Complete chapter 4 exercises"
                            rightIcon="checkmark-circle"
                            onRightIconPress={() => handleAddMilestoneInline(goal.id)}
                            onSubmitEditing={() => handleAddMilestoneInline(goal.id)}
                            returnKeyType="done"
                          />
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => {
                            setAddingMilestoneGoalId(goal.id);
                            setNewMilestoneText('');
                          }}
                          style={styles.addMilestoneInlineBtn}
                        >
                          <Ionicons name="add-circle-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                          <Text style={[typography.captionBold, { color: colors.primary }]}>
                            + Add Milestone Checkpoint
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </ScrollView>

        {/* Floating + Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsAddOpen(true)}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Add Goal"
        >
          <Ionicons name="add" size={28} color="#000000" />
        </TouchableOpacity>

        {/* Add Goal Modal with Standardized Forms */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Create New Goal"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <FormInput
              label="Goal Title"
              required
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Run a half-marathon or launch product"
              icon="flag-outline"
            />

            <FormTextArea
              label="Description & Success Criteria"
              value={description}
              onChangeText={setDescription}
              placeholder="Why this goal matters and what completion looks like..."
              numberOfLines={3}
            />

            <FormSelect
              label="Goal Horizon"
              value={termType}
              options={TERM_OPTIONS}
              onSelect={(val) => setTermType(val as GoalTermType)}
            />

            <FormSelect
              label="Category"
              value={category}
              options={categorySelectOptions}
              onSelect={setCategory}
            />

            <FormPriorityPicker
              value={priority}
              onChange={setPriority}
            />

            <FormInput
              label="Target Due Date (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              icon="calendar-outline"
            />

            <FormTextArea
              label="Initial Milestones (one per line)"
              value={initialMilestones}
              onChangeText={setInitialMilestones}
              placeholder="Register for race&#10;Run 10km weekly&#10;Complete 20km long run"
              numberOfLines={4}
              helperText="Milestones automatically compute your goal progress percentage."
            />

            <CustomFieldsSection
              entityType="goals"
              values={addCustomValues}
              onChange={(k, v) => setAddCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

            <Button
              title="Save Goal"
              onPress={handleCreateGoal}
              style={{ marginTop: 8 }}
            />
          </ScrollView>
        </BottomSheetModal>

        {/* Edit Goal Modal with Standardized Forms */}
        <BottomSheetModal
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Goal"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <FormInput
              label="Goal Title"
              required
              value={editTitle}
              onChangeText={setEditTitle}
              icon="flag-outline"
            />

            <FormTextArea
              label="Description"
              value={editDescription}
              onChangeText={setEditDescription}
              numberOfLines={3}
            />

            <FormSelect
              label="Goal Horizon"
              value={editTermType}
              options={TERM_OPTIONS}
              onSelect={(val) => setEditTermType(val as GoalTermType)}
            />

            <FormSelect
              label="Category"
              value={editCategory}
              options={categorySelectOptions}
              onSelect={setEditCategory}
            />

            <FormPriorityPicker
              value={editPriority}
              onChange={setEditPriority}
            />

            <FormInput
              label="Target Due Date (YYYY-MM-DD)"
              value={editDueDate}
              onChangeText={setEditDueDate}
              icon="calendar-outline"
            />

            <CustomFieldsSection
              entityType="goals"
              values={editCustomValues}
              onChange={(k, v) => setEditCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

            <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
              <Button
                title="Delete"
                variant="ghost"
                onPress={() => editingGoal && handleDeleteGoal(editingGoal)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Changes"
                variant="primary"
                onPress={handleSaveEdit}
                style={{ flex: 2 }}
              />
            </View>
          </ScrollView>
        </BottomSheetModal>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    width: 42,
    height: 42,
    borderRadius: 21,
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
  filterRow: {
    marginBottom: 10,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  filterDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  list: {
    flex: 1,
  },
  scrollListPadding: {
    paddingBottom: 40,
  },
  goalCard: {
    marginBottom: 14,
    padding: 16,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressBadgeCol: {
    alignItems: 'flex-end',
  },
  goalBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  actionIconBtn: {
    padding: 6,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  milestonesDrawer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  milestoneText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  addMilestoneInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  modalForm: {
    paddingBottom: 30,
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
});
