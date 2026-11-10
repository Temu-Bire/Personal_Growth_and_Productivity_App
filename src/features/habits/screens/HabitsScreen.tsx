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
import { format } from 'date-fns';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTheme } from '../../../hooks/useTheme';
import { CATEGORY_COLORS } from '../../../theme/colors';
import { HabitsRepository, Habit, HabitFrequency } from '../habits.repository';
import {
  FormInput,
  FormTextArea,
  FormSelect,
} from '../../../components/forms';

type HabitFilter = 'all' | 'active' | 'completed';

const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const CATEGORY_OPTIONS = [
  { label: 'Health', value: 'Health' },
  { label: 'Career', value: 'Career' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Learning', value: 'Learning' },
  { label: 'Faith', value: 'Faith' },
  { label: 'Personal', value: 'Personal' },
];

export const HabitsScreen: React.FC = () => {
  const { colors, typography, radius, isDark } = useTheme();
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [filter, setFilter] = useState<HabitFilter>('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Health');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetCount, setTargetCount] = useState('1');
  const [preferredTime, setPreferredTime] = useState('08:00');
  const [durationMinutes, setDurationMinutes] = useState('15');
  const [description, setDescription] = useState('');

  const loadHabits = useCallback(() => {
    const list = HabitsRepository.getAllWithProgress(todayStr);
    setHabits(list);
  }, [todayStr]);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [loadHabits])
  );

  const handleToggleHabit = (habitId: string) => {
    HabitsRepository.toggleCompletion(habitId, todayStr);
    loadHabits();
  };

  const handleOpenAdd = () => {
    setName('');
    setCategory('Health');
    setFrequency('daily');
    setTargetCount('1');
    setPreferredTime('08:00');
    setDurationMinutes('15');
    setDescription('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setSelectedHabit(habit);
    setName(habit.name);
    setCategory(habit.category || 'Health');
    setFrequency(habit.frequency || 'daily');
    setTargetCount(String(habit.target_count || 1));
    setPreferredTime(habit.preferred_time || '08:00');
    setDurationMinutes(String(habit.duration_minutes || 15));
    setDescription(habit.description || '');
    setIsEditOpen(true);
  };

  const handleSaveAdd = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter habit name.');
      return;
    }

    HabitsRepository.create({
      name: name.trim(),
      description: description.trim(),
      targetCount: parseInt(targetCount, 10) || 1,
      unit: 'times',
      frequency,
      scheduleDays: [0, 1, 2, 3, 4, 5, 6],
      preferredTime: preferredTime.trim() || '08:00',
      durationMinutes: parseInt(durationMinutes, 10) || 15,
      color: CATEGORY_COLORS[category] || '#22C55E',
    });

    setIsAddOpen(false);
    loadHabits();
  };

  const handleSaveEdit = () => {
    if (!selectedHabit || !name.trim()) return;

    HabitsRepository.update(selectedHabit.id, {
      name: name.trim(),
      description: description.trim(),
      targetCount: parseInt(targetCount, 10) || 1,
      frequency,
      preferredTime: preferredTime.trim() || '08:00',
      durationMinutes: parseInt(durationMinutes, 10) || 15,
      color: CATEGORY_COLORS[category] || '#22C55E',
    });

    setIsEditOpen(false);
    loadHabits();
  };

  const handleDeleteHabit = () => {
    if (!selectedHabit) return;
    Alert.alert('Delete Habit', `Delete "${selectedHabit.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          HabitsRepository.delete(selectedHabit.id);
          setIsEditOpen(false);
          loadHabits();
        },
      },
    ]);
  };

  // Filtered counts and list
  const activeCount = habits.filter((h) => (h.todayCount || 0) < (h.target_count || 1)).length;
  const completedCount = habits.filter((h) => (h.todayCount || 0) >= (h.target_count || 1)).length;

  const filteredHabits = useMemo(() => {
    if (filter === 'active') {
      return habits.filter((h) => (h.todayCount || 0) < (h.target_count || 1));
    }
    if (filter === 'completed') {
      return habits.filter((h) => (h.todayCount || 0) >= (h.target_count || 1));
    }
    return habits;
  }, [habits, filter]);

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h1, { color: colors.textPrimary }]}>Habits</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Small daily actions, compounding results
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
              All ({habits.length})
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

        {/* Habits List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollList}
        >
          {filteredHabits.length === 0 ? (
            <EmptyState
              icon="repeat-outline"
              title="No habits found"
              description={
                filter === 'all'
                  ? 'Tap "+" to start building your daily habits.'
                  : `No ${filter} habits for today.`
              }
              actionTitle="Add Habit"
              onAction={handleOpenAdd}
            />
          ) : (
            filteredHabits.map((habit) => {
              const isDone = (habit.todayCount || 0) >= (habit.target_count || 1);
              const catColor = CATEGORY_COLORS[habit.category || 'General'] || '#22C55E';
              const streak = habit.current_streak || 0;

              return (
                <TouchableOpacity
                  key={habit.id}
                  activeOpacity={0.8}
                  onPress={() => handleOpenEdit(habit)}
                >
                  <Card
                    style={[
                      styles.habitCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.cardLeft}>
                      {/* Category Tag */}
                      <View style={[styles.catBadge, { backgroundColor: `${catColor}20` }]}>
                        <Text style={[styles.catBadgeText, { color: catColor }]}>
                          {(habit.category || 'HABIT').toUpperCase()}
                        </Text>
                      </View>

                      {/* Title */}
                      <Text
                        style={[
                          styles.habitName,
                          typography.bodyBold,
                          {
                            color: isDone ? colors.textMuted : colors.textPrimary,
                            textDecorationLine: isDone ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {habit.name}
                      </Text>

                      {/* Streak info */}
                      <View style={styles.metaRow}>
                        <Ionicons name="flame" size={14} color="#F59E0B" />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                          {streak}-day streak · {habit.frequency === 'daily' ? 'Daily' : habit.frequency}
                        </Text>
                      </View>
                    </View>

                    {/* Completion Checkmark Button */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleToggleHabit(habit.id)}
                      style={[
                        styles.checkCircle,
                        isDone
                          ? { backgroundColor: '#22C55E', borderColor: '#22C55E' }
                          : { borderColor: colors.border, backgroundColor: colors.inputBg },
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isDone }}
                    >
                      {isDone && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </TouchableOpacity>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleOpenAdd}
          style={[styles.fab, { backgroundColor: isDark ? '#FFFFFF' : '#09090B' }]}
          accessibilityRole="button"
          accessibilityLabel="Add Habit"
        >
          <Ionicons name="add" size={28} color={isDark ? '#09090B' : '#FFFFFF'} />
        </TouchableOpacity>

        {/* Add Habit Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="New Habit"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <FormInput
              label="Habit Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Drink 3L water"
              required
            />
            <FormSelect
              label="Category"
              value={category}
              options={CATEGORY_OPTIONS}
              onSelect={setCategory}
            />
            <FormSelect
              label="Frequency"
              value={frequency}
              options={FREQUENCY_OPTIONS}
              onSelect={(val) => setFrequency(val as HabitFrequency)}
            />
            <View style={styles.rowTwo}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <FormInput
                  label="Target Count"
                  value={targetCount}
                  onChangeText={setTargetCount}
                  placeholder="e.g. 1"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <FormInput
                  label="Duration (mins)"
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  placeholder="e.g. 15"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <FormInput
              label="Preferred Time"
              value={preferredTime}
              onChangeText={setPreferredTime}
              placeholder="08:00"
            />
            <FormTextArea
              label="Notes"
              value={description}
              onChangeText={setDescription}
              placeholder="Optional notes about this habit"
            />
            <Button
              title="Create Habit"
              onPress={handleSaveAdd}
              variant="primary"
              size="lg"
              style={{ marginTop: 8 }}
            />
          </ScrollView>
        </BottomSheetModal>

        {/* Edit Habit Modal */}
        <BottomSheetModal
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Habit"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <FormInput
              label="Habit Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Drink 3L water"
              required
            />
            <FormSelect
              label="Category"
              value={category}
              options={CATEGORY_OPTIONS}
              onSelect={setCategory}
            />
            <FormSelect
              label="Frequency"
              value={frequency}
              options={FREQUENCY_OPTIONS}
              onSelect={(val) => setFrequency(val as HabitFrequency)}
            />
            <View style={styles.rowTwo}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <FormInput
                  label="Target Count"
                  value={targetCount}
                  onChangeText={setTargetCount}
                  placeholder="e.g. 1"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <FormInput
                  label="Duration (mins)"
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  placeholder="e.g. 15"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <FormInput
              label="Preferred Time"
              value={preferredTime}
              onChangeText={setPreferredTime}
              placeholder="08:00"
            />
            <FormTextArea
              label="Notes"
              value={description}
              onChangeText={setDescription}
              placeholder="Optional notes about this habit"
            />
            <Button
              title="Save Changes"
              onPress={handleSaveEdit}
              variant="primary"
              size="lg"
              style={{ marginTop: 8 }}
            />
            <Button
              title="Delete Habit"
              onPress={handleDeleteHabit}
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
    marginBottom: 12,
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
  scrollList: {
    paddingBottom: 100,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  habitName: {
    fontSize: 15,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
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
  rowTwo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
