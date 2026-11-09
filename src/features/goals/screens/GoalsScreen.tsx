import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { CATEGORY_COLORS } from '../../../theme/colors';
import {
  GoalsRepository,
  Goal,
  Milestone,
  GoalTermType,
  GoalPriority,
} from '../goals.repository';
import {
  FormInput,
  FormTextArea,
  FormSelect,
  FormPriorityPicker,
} from '../../../components/forms';

type GoalFilter = 'all' | 'active' | 'completed';

const CATEGORY_OPTIONS = [
  { label: 'Career', value: 'Career' },
  { label: 'Health', value: 'Health' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Learning', value: 'Learning' },
  { label: 'Faith', value: 'Faith' },
  { label: 'Personal', value: 'Personal' },
];

const TERM_OPTIONS = [
  { label: 'Short-Term (< 6 months)', value: 'short_term' },
  { label: 'Long-Term (1+ year)', value: 'long_term' },
];

export const GoalsScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState<GoalFilter>('all');
  const [termFilter, setTermFilter] = useState<'all' | GoalTermType>('all');
  const [milestonesMap, setMilestonesMap] = useState<Record<string, Milestone[]>>({});
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // New Milestone inline state
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [addingMilestoneGoalId, setAddingMilestoneGoalId] = useState<string | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Career');
  const [termType, setTermType] = useState<GoalTermType>('short_term');
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const loadGoals = useCallback(() => {
    const list = GoalsRepository.getAllWithProgress();
    setGoals(list);

    // Load milestones for each goal
    const mMap: Record<string, Milestone[]> = {};
    for (const g of list) {
      mMap[g.id] = GoalsRepository.getMilestones(g.id);
    }
    setMilestonesMap(mMap);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  const handleOpenAdd = () => {
    setTitle('');
    setCategory('Career');
    setTermType('short_term');
    setPriority('medium');
    const defaultDate = format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    setDueDate(defaultDate);
    setDescription('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setTitle(goal.title);
    setCategory(goal.category || 'Career');
    setTermType(goal.term_type || 'short_term');
    setPriority(goal.priority || 'medium');
    setDueDate(goal.due_date ? goal.due_date.split('T')[0] : '');
    setDescription(goal.description || '');
    setIsEditOpen(true);
  };

  const handleSaveAdd = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter goal title.');
      return;
    }

    GoalsRepository.createGoal({
      title: title.trim(),
      category,
      termType,
      priority,
      dueDate: dueDate.trim() || format(new Date(), 'yyyy-MM-dd'),
      description: description.trim(),
    });

    setIsAddOpen(false);
    loadGoals();
  };

  const handleSaveEdit = () => {
    if (!selectedGoal || !title.trim()) return;

    GoalsRepository.updateGoal(selectedGoal.id, {
      title: title.trim(),
      category,
      termType,
      priority,
      dueDate: dueDate.trim() || selectedGoal.due_date,
      description: description.trim(),
    });

    setIsEditOpen(false);
    loadGoals();
  };

  const handleDeleteGoal = () => {
    if (!selectedGoal) return;
    Alert.alert('Delete Goal', `Delete "${selectedGoal.title}" and its milestones?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          GoalsRepository.deleteGoal(selectedGoal.id);
          setIsEditOpen(false);
          loadGoals();
        },
      },
    ]);
  };

  const handleToggleMilestone = (milestoneId: string) => {
    GoalsRepository.toggleMilestone(milestoneId);
    loadGoals();
  };

  const handleAddMilestone = (goalId: string) => {
    if (!newMilestoneText.trim()) return;
    GoalsRepository.addMilestone(goalId, newMilestoneText.trim());
    setNewMilestoneText('');
    setAddingMilestoneGoalId(null);
    loadGoals();
  };

  // Filter calculations
  const activeCount = goals.filter((g) => g.status !== 'completed').length;
  const completedCount = goals.filter((g) => g.status === 'completed').length;

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      if (filter === 'active' && g.status === 'completed') return false;
      if (filter === 'completed' && g.status !== 'completed') return false;
      if (termFilter !== 'all' && g.term_type !== termFilter) return false;
      return true;
    });
  }, [goals, filter, termFilter]);

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h1, { color: colors.textPrimary }]}>Goals</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Your compass for the future
          </Text>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilter('all')}
            style={[
              styles.filterChip,
              filter === 'all'
                ? { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }
                : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: filter === 'all' ? '#09090B' : colors.textSecondary },
              ]}
            >
              All ({goals.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilter('active')}
            style={[
              styles.filterChip,
              filter === 'active'
                ? { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }
                : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: filter === 'active' ? '#09090B' : colors.textSecondary },
              ]}
            >
              Active ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilter('completed')}
            style={[
              styles.filterChip,
              filter === 'completed'
                ? { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }
                : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: filter === 'completed' ? '#09090B' : colors.textSecondary },
              ]}
            >
              Completed ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Term Filter Pills */}
        <View style={styles.termRow}>
          {(['all', 'short_term', 'long_term'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTermFilter(t)}
              style={[
                styles.termPill,
                termFilter === t
                  ? { backgroundColor: 'rgba(255, 255, 255, 0.12)' }
                  : { backgroundColor: 'transparent' },
              ]}
            >
              <Text
                style={[
                  styles.termPillText,
                  { color: termFilter === t ? '#FFFFFF' : colors.textMuted },
                ]}
              >
                {t === 'all' ? 'All Terms' : t === 'short_term' ? 'Short-Term' : 'Long-Term'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goals List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollList}
        >
          {filteredGoals.length === 0 ? (
            <EmptyState
              icon="flag-outline"
              title="No goals found"
              description={
                filter === 'all'
                  ? 'Tap "+" to set your first long-term or short-term goal.'
                  : `No ${filter} goals found.`
              }
              actionTitle="Add Goal"
              onAction={handleOpenAdd}
            />
          ) : (
            filteredGoals.map((goal) => {
              const catColor = CATEGORY_COLORS[goal.category] || '#3B82F6';
              const progress = goal.progressPercent ?? goal.progress_percent ?? 0;
              const isExpanded = expandedGoalId === goal.id;
              const milestones = milestonesMap[goal.id] || [];

              let targetDisplay = 'No date';
              if (goal.due_date) {
                try {
                  targetDisplay = format(parseISO(goal.due_date), 'MMM d, yyyy');
                } catch {
                  targetDisplay = goal.due_date;
                }
              }

              return (
                <Card
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.badgeRow}>
                          <View style={[styles.catBadge, { backgroundColor: `${catColor}20` }]}>
                            <Text style={[styles.catBadgeText, { color: catColor }]}>
                              {goal.category.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={[styles.termTag, { color: colors.textSecondary }]}>
                            {goal.term_type === 'short_term' ? 'Short-term' : 'Long-term'}
                          </Text>
                        </View>
                        <Text style={[styles.goalTitle, typography.h3, { color: colors.textPrimary }]}>
                          {goal.title}
                        </Text>
                        <Text style={[styles.dueText, { color: colors.textSecondary }]}>
                          Target: {targetDisplay}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleOpenEdit(goal)}
                        style={styles.editBtn}
                      >
                        <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <ProgressBar progress={progress} color={catColor} height={6} />
                      <View style={styles.progressLabelRow}>
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                          {progress}% completed
                        </Text>
                        <Text style={[styles.progressText, { color: colors.textMuted }]}>
                          {milestones.filter((m) => m.is_completed === 1).length}/{milestones.length} milestones
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Milestones accordion */}
                  {isExpanded && (
                    <View style={styles.milestonesSection}>
                      <View style={styles.milestoneDivider} />
                      <Text style={[styles.milestonesHeader, { color: colors.textMuted }]}>
                        MILESTONES
                      </Text>

                      {milestones.map((m) => (
                        <TouchableOpacity
                          key={m.id}
                          activeOpacity={0.7}
                          onPress={() => handleToggleMilestone(m.id)}
                          style={styles.milestoneItem}
                        >
                          <View
                            style={[
                              styles.milestoneCheckbox,
                              m.is_completed === 1
                                ? { backgroundColor: '#22C55E', borderColor: '#22C55E' }
                                : { borderColor: colors.border },
                            ]}
                          >
                            {m.is_completed === 1 && (
                              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.milestoneTitle,
                              {
                                color: m.is_completed === 1 ? colors.textMuted : colors.textPrimary,
                                textDecorationLine: m.is_completed === 1 ? 'line-through' : 'none',
                              },
                            ]}
                          >
                            {m.title}
                          </Text>
                        </TouchableOpacity>
                      ))}

                      {/* Add Milestone Inline */}
                      {addingMilestoneGoalId === goal.id ? (
                        <View style={styles.inlineAddRow}>
                          <FormInput
                            label="New Milestone"
                            value={newMilestoneText}
                            onChangeText={setNewMilestoneText}
                            placeholder="e.g. Complete chapter 1"
                            containerStyle={{ flex: 1, marginBottom: 0 }}
                          />
                          <Button
                            title="Add"
                            size="sm"
                            variant="primary"
                            onPress={() => handleAddMilestone(goal.id)}
                            style={{ marginLeft: 8, marginTop: 20 }}
                          />
                          <TouchableOpacity
                            onPress={() => setAddingMilestoneGoalId(null)}
                            style={{ marginLeft: 6, marginTop: 20 }}
                          >
                            <Ionicons name="close-circle" size={24} color={colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            setAddingMilestoneGoalId(goal.id);
                            setNewMilestoneText('');
                          }}
                          style={styles.addMilestoneBtn}
                        >
                          <Ionicons name="add" size={16} color={colors.primary} />
                          <Text style={[styles.addMilestoneText, { color: colors.primary }]}>
                            Add milestone
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

        {/* Floating Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleOpenAdd}
          style={styles.fab}
          accessibilityRole="button"
          accessibilityLabel="Add Goal"
        >
          <Ionicons name="add" size={28} color="#09090B" />
        </TouchableOpacity>

        {/* Add Goal Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="New Goal"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <FormInput
              label="Goal Title"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Become Senior Software Engineer"
              required
            />
            <FormSelect
              label="Category"
              value={category}
              options={CATEGORY_OPTIONS}
              onSelect={setCategory}
            />
            <FormSelect
              label="Term"
              value={termType}
              options={TERM_OPTIONS}
              onSelect={(val) => setTermType(val as GoalTermType)}
            />
            <FormPriorityPicker
              label="Priority"
              value={priority}
              onChange={setPriority}
            />
            <FormInput
              label="Target Date (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="mm/dd/yyyy"
            />
            <FormTextArea
              label="Description / Notes"
              value={description}
              onChangeText={setDescription}
              placeholder="Optional notes about this goal"
            />
            <Button
              title="Create Goal"
              onPress={handleSaveAdd}
              variant="primary"
              size="lg"
              style={{ marginTop: 8 }}
            />
          </ScrollView>
        </BottomSheetModal>

        {/* Edit Goal Modal */}
        <BottomSheetModal
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Goal"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <FormInput
              label="Goal Title"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Become Senior Software Engineer"
              required
            />
            <FormSelect
              label="Category"
              value={category}
              options={CATEGORY_OPTIONS}
              onSelect={setCategory}
            />
            <FormSelect
              label="Term"
              value={termType}
              options={TERM_OPTIONS}
              onSelect={(val) => setTermType(val as GoalTermType)}
            />
            <FormPriorityPicker
              label="Priority"
              value={priority}
              onChange={setPriority}
            />
            <FormInput
              label="Target Date (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="mm/dd/yyyy"
            />
            <FormTextArea
              label="Description / Notes"
              value={description}
              onChangeText={setDescription}
              placeholder="Optional notes about this goal"
            />
            <Button
              title="Save Changes"
              onPress={handleSaveEdit}
              variant="primary"
              size="lg"
              style={{ marginTop: 8 }}
            />
            <Button
              title="Delete Goal"
              onPress={handleDeleteGoal}
              variant="danger"
              size="md"
              style={{ marginTop: 10 }}
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
    paddingTop: 12,
    paddingBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  termRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  termPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  termPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollList: {
    paddingBottom: 90,
  },
  goalCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  catBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  termTag: {
    fontSize: 11,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  dueText: {
    fontSize: 12,
    marginBottom: 10,
  },
  editBtn: {
    padding: 6,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  progressText: {
    fontSize: 12,
  },
  milestonesSection: {
    marginTop: 12,
  },
  milestoneDivider: {
    height: 1,
    backgroundColor: '#27272A',
    marginBottom: 10,
  },
  milestonesHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  milestoneCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  milestoneTitle: {
    fontSize: 13,
    flex: 1,
  },
  inlineAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addMilestoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    marginTop: 4,
  },
  addMilestoneText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
