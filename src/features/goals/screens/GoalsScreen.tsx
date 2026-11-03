import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Chip } from '../../../components/ui/Chip';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { GoalsRepository, Goal, GoalMilestone } from '../goals.repository';
import {
  GOAL_CATEGORIES,
  GoalCategory,
  GOAL_CATEGORY_CONFIG,
  getGoalCategoryConfig,
} from '../goals.constants';

const FILTER_CATEGORIES = ['All', ...GOAL_CATEGORIES] as const;

export const GoalsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [milestonesMap, setMilestonesMap] = useState<Record<string, GoalMilestone[]>>({});

  // Add Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-31');
  const [category, setCategory] = useState<GoalCategory>('Career');
  const [initialMilestones, setInitialMilestones] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editCategory, setEditCategory] = useState<GoalCategory>('Career');

  const loadGoals = useCallback(() => {
    const list = GoalsRepository.getAllWithProgress(activeTab === 'completed' ? 1 : 0);
    setGoals(list);

    const map: Record<string, GoalMilestone[]> = {};
    list.forEach((g) => {
      map[g.id] = GoalsRepository.getMilestones(g.id);
    });
    setMilestonesMap(map);
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  // Filtered goals by category
  const filteredGoals = useMemo(() => {
    if (selectedCategory === 'All') return goals;
    return goals.filter(
      (g) => (g.category || 'Others').toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [goals, selectedCategory]);

  const handleToggleMilestone = (milestoneId: string) => {
    GoalsRepository.toggleMilestone(milestoneId);
    loadGoals();
  };

  const handleCreateGoal = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter goal title.');
      return;
    }

    const milestonesList = initialMilestones
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);

    GoalsRepository.createGoal({
      title: title.trim(),
      dueDate,
      category,
      milestones: milestonesList,
    });

    setTitle('');
    setInitialMilestones('');
    setCategory('Career');
    setIsAddOpen(false);
    loadGoals();
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditDueDate(goal.due_date);
    const catConfig = getGoalCategoryConfig(goal.category);
    setEditCategory(catConfig.name);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingGoal || !editTitle.trim()) {
      Alert.alert('Required', 'Please enter a goal title.');
      return;
    }

    GoalsRepository.updateGoal(editingGoal.id, {
      title: editTitle,
      dueDate: editDueDate,
      category: editCategory,
    });

    setIsEditOpen(false);
    setEditingGoal(null);
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

  return (
    <Screen backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Header */}
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
            <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary, marginLeft: 12 }]}>
              My Goals
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsAddOpen(true)}
            style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="Add Goal"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Active vs Completed Tabs */}
        <SegmentedTabs
          tabs={[
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' },
          ]}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          style={{ marginBottom: 12 }}
        />

        {/* Category Filter Horizontal Scroll */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTER_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Chip
                  key={cat}
                  label={cat}
                  selected={isSelected}
                  onPress={() => setSelectedCategory(cat)}
                  style={styles.filterChip}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* Goals List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.scrollListPadding}
          showsVerticalScrollIndicator={false}
        >
          {filteredGoals.length === 0 ? (
            <EmptyState
              icon="flag-outline"
              title={
                selectedCategory !== 'All'
                  ? `No ${selectedCategory} goals`
                  : activeTab === 'active'
                  ? 'No active goals'
                  : 'No completed goals'
              }
              description={
                selectedCategory !== 'All'
                  ? `There are no ${selectedCategory.toLowerCase()} goals in ${activeTab}. Tap '+' to create one.`
                  : activeTab === 'active'
                  ? 'Set meaningful milestones and reach your ambitions.'
                  : 'Completed goals will appear here once marked done.'
              }
              actionTitle={activeTab === 'active' ? '+ Add New Goal' : undefined}
              onAction={activeTab === 'active' ? () => setIsAddOpen(true) : undefined}
            />
          ) : (
            filteredGoals.map((goal) => {
              const isExpanded = expandedGoalId === goal.id;
              const milestones = milestonesMap[goal.id] || [];
              const catCfg = getGoalCategoryConfig(goal.category);

              return (
                <Card key={goal.id} style={styles.goalCard}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(goal.id)}
                  >
                    <View style={styles.goalHeader}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        {/* Category Badge */}
                        <View style={styles.badgeRow}>
                          <View style={[styles.catBadge, { backgroundColor: catCfg.bg }]}>
                            <Ionicons
                              name={catCfg.icon}
                              size={12}
                              color={catCfg.color}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={[typography.captionBold, { color: catCfg.color, fontSize: 11 }]}>
                              {catCfg.name}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.goalTitle, typography.h2, { color: colors.textPrimary }]}>
                          {goal.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                          Due: {goal.due_date}
                        </Text>
                      </View>
                      <Text style={[typography.h2, { color: colors.primary, fontWeight: '800' }]}>
                        {goal.progressPercent}%
                      </Text>
                    </View>

                    <ProgressBar
                      progress={goal.progressPercent || 0}
                      height={6}
                      color={colors.primary}
                      style={{ marginTop: 12, marginBottom: 8 }}
                    />

                    <View style={styles.goalFooter}>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        {goal.completedMilestonesCount} of {goal.milestonesCount} milestones completed
                      </Text>
                      <View style={styles.headerActions}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(goal);
                          }}
                          style={styles.actionIconBtn}
                          accessibilityLabel="Edit Goal"
                        >
                          <Ionicons name="pencil-outline" size={17} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteGoal(goal);
                          }}
                          style={styles.actionIconBtn}
                          accessibilityLabel="Delete Goal"
                        >
                          <Ionicons name="trash-outline" size={17} color={colors.danger} />
                        </TouchableOpacity>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={colors.textMuted}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Milestones list */}
                  {isExpanded && (
                    <View style={[styles.milestonesList, { borderTopColor: colors.border }]}>
                      {milestones.length === 0 ? (
                        <Text style={[typography.caption, { color: colors.textMuted, marginVertical: 4 }]}>
                          No milestones added yet.
                        </Text>
                      ) : (
                        milestones.map((m) => (
                          <View key={m.id} style={styles.milestoneItem}>
                            <Checkbox
                              checked={m.is_completed === 1}
                              onToggle={() => handleToggleMilestone(m.id)}
                            />
                            <Text
                              style={[
                                styles.milestoneTitle,
                                typography.bodyMedium,
                                {
                                  color: m.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                                  textDecorationLine: m.is_completed === 1 ? 'line-through' : 'none',
                                },
                              ]}
                            >
                              {m.title}
                            </Text>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </ScrollView>

        {/* Add Goal Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Goal"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Goal Title *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Master Machine Learning"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Target Date (YYYY-MM-DD)
            </Text>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="2026-12-31"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Category
            </Text>
            <View style={styles.catSelectionGrid}>
              {GOAL_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const cfg = GOAL_CATEGORY_CONFIG[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.7}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.catChoiceBtn,
                      {
                        backgroundColor: isSelected ? cfg.color : colors.inputBg,
                        borderColor: isSelected ? cfg.color : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={cfg.icon}
                      size={14}
                      color={isSelected ? '#FFFFFF' : cfg.color}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Milestones (one per line)
            </Text>
            <TextInput
              value={initialMilestones}
              onChangeText={setInitialMilestones}
              multiline
              numberOfLines={4}
              placeholder="Finish online course&#10;Build 2 projects&#10;Publish case study"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                styles.textArea,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Button
              title="Create Goal"
              onPress={handleCreateGoal}
              style={{ marginTop: 16 }}
            />
          </ScrollView>
        </BottomSheetModal>

        {/* Edit Goal Modal */}
        <BottomSheetModal
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Goal"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Goal Title *
            </Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Target Date (YYYY-MM-DD)
            </Text>
            <TextInput
              value={editDueDate}
              onChangeText={setEditDueDate}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Category
            </Text>
            <View style={styles.catSelectionGrid}>
              {GOAL_CATEGORIES.map((cat) => {
                const isSelected = editCategory === cat;
                const cfg = GOAL_CATEGORY_CONFIG[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.7}
                    onPress={() => setEditCategory(cat)}
                    style={[
                      styles.catChoiceBtn,
                      {
                        backgroundColor: isSelected ? cfg.color : colors.inputBg,
                        borderColor: isSelected ? cfg.color : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={cfg.icon}
                      size={14}
                      color={isSelected ? '#FFFFFF' : cfg.color}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsEditOpen(false)}
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterWrapper: {
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  list: {
    flex: 1,
  },
  scrollListPadding: {
    paddingBottom: 110,
  },
  goalCard: {
    marginBottom: 12,
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  goalTitle: {
    fontWeight: '700',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 4,
  },
  milestonesList: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  milestoneTitle: {
    marginLeft: 10,
    flex: 1,
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
  catSelectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    marginTop: 2,
  },
  catChoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});
