import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { GoalsRepository, Goal, GoalMilestone } from '../goals.repository';

export const GoalsScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [milestonesMap, setMilestonesMap] = useState<Record<string, GoalMilestone[]>>({});

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-31');
  const [category, setCategory] = useState('General');
  const [initialMilestones, setInitialMilestones] = useState('');

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
    setIsAddOpen(false);
    loadGoals();
  };

  const toggleExpand = (goalId: string) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  return (
    <Screen backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary }]}>
            My Goals
          </Text>
          <TouchableOpacity
            onPress={() => setIsAddOpen(true)}
            style={[styles.addBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="Add Goal"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tabs: Active vs Completed */}
        <SegmentedTabs
          tabs={[
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Goals List */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {goals.length === 0 ? (
            <EmptyState
              icon="flag-outline"
              title={activeTab === 'active' ? 'No active goals' : 'No completed goals yet'}
              description="Define long-term aspirations and break them down into milestones."
              actionTitle={activeTab === 'active' ? '+ Add Goal' : undefined}
              onAction={activeTab === 'active' ? () => setIsAddOpen(true) : undefined}
            />
          ) : (
            goals.map((goal) => {
              const isExpanded = expandedGoalId === goal.id;
              const milestones = milestonesMap[goal.id] || [];

              return (
                <Card key={goal.id} style={styles.goalCard}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(goal.id)}
                  >
                    <View style={styles.goalHeader}>
                      <View style={{ flex: 1, marginRight: 10 }}>
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
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textMuted}
                      />
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
                              size={18}
                            />
                            <Text
                              style={[
                                styles.milestoneTitle,
                                typography.body,
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
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Add Goal Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Create New Goal"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Goal Title
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
              placeholder="2027-08-30"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Key Milestones (one per line)
            </Text>
            <TextInput
              value={initialMilestones}
              onChangeText={setInitialMilestones}
              placeholder={'Complete foundational math\nRead papers & tutorials\nBuild 2 end-to-end models'}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={[
                styles.modalInput,
                styles.multilineInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <Button
              title="Save Goal"
              onPress={handleCreateGoal}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerTitle: {
    fontWeight: '800',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  goalCard: {
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalTitle: {
    fontWeight: '700',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestonesList: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  milestoneTitle: {
    marginLeft: 8,
    flex: 1,
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
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
