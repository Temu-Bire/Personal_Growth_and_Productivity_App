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
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { CustomizationRepository } from '../../customization/customization.repository';
import { ViewModeSwitcher } from '../../customization/components/ViewModeSwitcher';
import { CustomFieldsSection } from '../../customization/components/CustomFieldsSection';
import { CustomFieldsBadgeRow } from '../../customization/components/CustomFieldsBadgeRow';
import { sortItemsByLayout } from '../../customization/layout.utils';
import { GoalsRepository, Goal, GoalMilestone } from '../goals.repository';
import {
  GOAL_CATEGORIES,
  GOAL_CATEGORY_CONFIG,
  getGoalCategoryConfig,
} from '../goals.constants';

export const GoalsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const pageLayout = useCustomizationStore((state) => state.pageLayouts['goals']);

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [milestonesMap, setMilestonesMap] = useState<Record<string, GoalMilestone[]>>({});
  const [dynamicCategories, setDynamicCategories] = useState<{ name: string; color: string; icon: string }[]>([]);

  // Add Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-31');
  const [category, setCategory] = useState<string>('Career');
  const [initialMilestones, setInitialMilestones] = useState('');
  const [addCustomValues, setAddCustomValues] = useState<Record<string, any>>({});

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editCategory, setEditCategory] = useState<string>('Career');
  const [editCustomValues, setEditCustomValues] = useState<Record<string, any>>({});

  const loadGoals = useCallback(() => {
    const list = GoalsRepository.getAllWithProgress(activeTab === 'completed' ? 1 : 0);
    setGoals(list);

    const map: Record<string, GoalMilestone[]> = {};
    list.forEach((g) => {
      map[g.id] = GoalsRepository.getMilestones(g.id);
    });
    setMilestonesMap(map);

    // Load custom categories for Goals
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
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  // Filtered & sorted goals
  const filteredGoals = useMemo(() => {
    let list = goals;
    if (selectedCategory !== 'All') {
      list = goals.filter(
        (g) => (g.category || 'Others').toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    return sortItemsByLayout(list, pageLayout);
  }, [goals, selectedCategory, pageLayout]);

  const viewMode = pageLayout?.viewMode || 'card';
  const visibleFields = pageLayout?.visibleFields || [
    'show_dates',
    'show_categories',
    'show_progress',
    'show_notes',
    'show_status',
  ];

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

    const created = GoalsRepository.createGoal({
      title: title.trim(),
      dueDate,
      category,
      milestones: milestonesList,
    });

    if (created && Object.keys(addCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('goals', created.id, addCustomValues);
    }

    setTitle('');
    setInitialMilestones('');
    setCategory('Career');
    setAddCustomValues({});
    setIsAddOpen(false);
    loadGoals();
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditDueDate(goal.due_date);
    setEditCategory(goal.category || 'Career');
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
      dueDate: editDueDate,
      category: editCategory,
    });

    if (Object.keys(editCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('goals', editingGoal.id, editCustomValues);
    }

    setIsEditOpen(false);
    setEditingGoal(null);
    setEditCustomValues({});
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

  const filterCategoryOptions = ['All', ...dynamicCategories.map((c) => c.name)];

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

          <View style={styles.headerRight}>
            {/* View Mode Switcher */}
            <ViewModeSwitcher pageKey="goals" />

            {/* Add Goal Button */}
            <TouchableOpacity
              onPress={() => setIsAddOpen(true)}
              style={[styles.addBtn, { backgroundColor: colors.accentMint, marginLeft: 8 }]}
              accessibilityRole="button"
              accessibilityLabel="Add Goal"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
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

        {/* Dynamic Category Filter Horizontal Scroll */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filterCategoryOptions.map((cat) => {
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

        {/* Goals List - Rendered by View Mode */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={[
            styles.scrollListPadding,
            viewMode === 'grid' && styles.gridContainer,
          ]}
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

              // 1. Compact View Mode
              if (viewMode === 'compact') {
                return (
                  <Card key={goal.id} style={styles.compactGoalCard}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleExpand(goal.id)}
                      style={styles.compactRow}
                    >
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                          {goal.title}
                        </Text>
                        {visibleFields.includes('show_dates') && (
                          <Text style={[typography.caption, { color: colors.textSecondary }]}>
                            Due: {goal.due_date}
                          </Text>
                        )}
                      </View>
                      {visibleFields.includes('show_categories') && (
                        <View style={[styles.compactBadge, { backgroundColor: catCfg.bg }]}>
                          <Text style={[typography.captionBold, { color: catCfg.color, fontSize: 10 }]}>
                            {goal.category}
                          </Text>
                        </View>
                      )}
                      {visibleFields.includes('show_progress') && (
                        <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 8 }]}>
                          {goal.progressPercent}%
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 2. List View Mode
              if (viewMode === 'list') {
                return (
                  <Card key={goal.id} style={styles.listGoalCard}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleExpand(goal.id)}
                      style={styles.listRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                          {goal.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          {visibleFields.includes('show_dates') && (
                            <Text style={[typography.caption, { color: colors.textSecondary, marginRight: 8 }]}>
                              Due: {goal.due_date}
                            </Text>
                          )}
                          {visibleFields.includes('show_categories') && (
                            <Text style={[typography.caption, { color: catCfg.color }]}>
                              • {goal.category}
                            </Text>
                          )}
                        </View>
                      </View>
                      {visibleFields.includes('show_progress') && (
                        <Text style={[typography.h3, { color: colors.primary, fontWeight: '800' }]}>
                          {goal.progressPercent}%
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 3. Grid View Mode
              if (viewMode === 'grid') {
                return (
                  <Card key={goal.id} style={styles.gridGoalCard}>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => toggleExpand(goal.id)}>
                      {visibleFields.includes('show_categories') && (
                        <View style={[styles.catBadge, { backgroundColor: catCfg.bg, alignSelf: 'flex-start', marginBottom: 6 }]}>
                          <Text style={[typography.captionBold, { color: catCfg.color, fontSize: 10 }]}>
                            {catCfg.name}
                          </Text>
                        </View>
                      )}
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={2}>
                        {goal.title}
                      </Text>
                      {visibleFields.includes('show_progress') && (
                        <ProgressBar
                          progress={goal.progressPercent || 0}
                          height={4}
                          color={colors.primary}
                          style={{ marginVertical: 8 }}
                        />
                      )}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[typography.captionBold, { color: colors.primary }]}>
                          {goal.progressPercent}%
                        </Text>
                        {visibleFields.includes('show_dates') && (
                          <Text style={[typography.caption, { color: colors.textMuted, fontSize: 10 }]}>
                            {goal.due_date}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 4. Standard Card View (Default)
              return (
                <Card key={goal.id} style={styles.goalCard}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(goal.id)}
                  >
                    <View style={styles.goalHeader}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        {/* Category Badge */}
                        {visibleFields.includes('show_categories') && (
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
                        )}

                        <Text style={[styles.goalTitle, typography.h2, { color: colors.textPrimary }]}>
                          {goal.title}
                        </Text>
                        {visibleFields.includes('show_dates') && (
                          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                            Due: {goal.due_date}
                          </Text>
                        )}
                      </View>
                      {visibleFields.includes('show_progress') && (
                        <Text style={[typography.h2, { color: colors.primary, fontWeight: '800' }]}>
                          {goal.progressPercent}%
                        </Text>
                      )}
                    </View>

                    {visibleFields.includes('show_progress') && (
                      <ProgressBar
                        progress={goal.progressPercent || 0}
                        height={6}
                        color={colors.primary}
                        style={{ marginTop: 12, marginBottom: 8 }}
                      />
                    )}

                    {/* Custom Fields Badges */}
                    <CustomFieldsBadgeRow entityType="goals" entityId={goal.id} />

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
              {dynamicCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.name}
                    activeOpacity={0.7}
                    onPress={() => setCategory(cat.name)}
                    style={[
                      styles.catChoiceBtn,
                      {
                        backgroundColor: isSelected ? cat.color : colors.inputBg,
                        borderColor: isSelected ? cat.color : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={isSelected ? '#FFFFFF' : cat.color}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Fields Section */}
            <CustomFieldsSection
              entityType="goals"
              values={addCustomValues}
              onChange={(k, v) => setAddCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 10 }]}>
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
              {dynamicCategories.map((cat) => {
                const isSelected = editCategory === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.name}
                    activeOpacity={0.7}
                    onPress={() => setEditCategory(cat.name)}
                    style={[
                      styles.catChoiceBtn,
                      {
                        backgroundColor: isSelected ? cat.color : colors.inputBg,
                        borderColor: isSelected ? cat.color : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={isSelected ? '#FFFFFF' : cat.color}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Fields Section */}
            <CustomFieldsSection
              entityType="goals"
              values={editCustomValues}
              onChange={(k, v) => setEditCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

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
  headerRight: {
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
    width: 38,
    height: 38,
    borderRadius: 19,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    marginBottom: 12,
    padding: 16,
  },
  compactGoalCard: {
    marginBottom: 8,
    padding: 10,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  listGoalCard: {
    marginBottom: 8,
    padding: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridGoalCard: {
    width: '48%',
    marginBottom: 12,
    padding: 12,
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
    marginTop: 8,
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
    marginBottom: 14,
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
