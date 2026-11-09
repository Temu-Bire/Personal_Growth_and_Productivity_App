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
  FormSelect,
  FormWeekdaysPicker,
} from '../../../components/forms';
import { HabitsRepository, Habit, HabitFrequency } from '../habits.repository';

const FREQUENCY_OPTIONS = [
  { label: 'Daily (Every scheduled day)', value: 'daily', icon: 'today-outline' as const },
  { label: 'Weekly (Target repetitions per week)', value: 'weekly', icon: 'calendar-outline' as const },
  { label: 'Monthly (Target repetitions per month)', value: 'monthly', icon: 'time-outline' as const },
];

export const HabitsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const pageLayout = useCustomizationStore((state) => state.pageLayouts['habits']);
  const todayStr = new Date().toISOString().split('T')[0];

  const [habits, setHabits] = useState<Habit[]>([]);
  const [filterFrequency, setFilterFrequency] = useState<'all' | HabitFrequency>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedHabitDetails, setSelectedHabitDetails] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Add / Edit Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetCount, setTargetCount] = useState('1');
  const [unit, setUnit] = useState('times');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [scheduleDays, setScheduleDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [preferredTime, setPreferredTime] = useState('08:00');
  const [durationMinutes, setDurationMinutes] = useState('15');
  const [color, setColor] = useState('#10B981');
  const [addCustomValues, setAddCustomValues] = useState<Record<string, any>>({});
  const [editCustomValues, setEditCustomValues] = useState<Record<string, any>>({});

  // Historical Completion Edit State in Details Modal
  const [editingHistoryDate, setEditingHistoryDate] = useState<string | null>(null);
  const [historyCount, setHistoryCount] = useState('1');
  const [historyNotes, setHistoryNotes] = useState('');

  const loadHabits = useCallback(() => {
    const list = HabitsRepository.getAllWithProgress(todayStr);
    setHabits(list);

    if (selectedHabitDetails) {
      const refreshed = HabitsRepository.getHabitDetails(selectedHabitDetails.id, todayStr);
      setSelectedHabitDetails(refreshed);
    }
  }, [todayStr, selectedHabitDetails?.id]);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [loadHabits])
  );

  const filteredHabits = useMemo(() => {
    let list = habits;
    if (filterFrequency !== 'all') {
      list = habits.filter((h) => h.frequency === filterFrequency);
    }
    return sortItemsByLayout(list, pageLayout);
  }, [habits, filterFrequency, pageLayout]);

  const viewMode = pageLayout?.viewMode || 'card';

  const handleToggleHabit = (id: string) => {
    HabitsRepository.toggleOrIncrement(id, todayStr);
    loadHabits();
  };

  const handleOpenDetail = (habit: Habit) => {
    const details = HabitsRepository.getHabitDetails(habit.id, todayStr);
    setSelectedHabitDetails(details || habit);
  };

  const handleOpenAdd = () => {
    setName('');
    setDescription('');
    setTargetCount('1');
    setUnit('times');
    setFrequency('daily');
    setScheduleDays([0, 1, 2, 3, 4, 5, 6]);
    setPreferredTime('08:00');
    setDurationMinutes('15');
    setColor('#10B981');
    setAddCustomValues({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setDescription(habit.description || '');
    setTargetCount(String(habit.target_count || 1));
    setUnit(habit.unit || 'times');
    setFrequency(habit.frequency || 'daily');
    setScheduleDays(habit.parsedDays || [0, 1, 2, 3, 4, 5, 6]);
    setPreferredTime(habit.preferred_time || '08:00');
    setDurationMinutes(String(habit.duration_minutes || 15));
    setColor(habit.color || '#10B981');
    const existingVals = CustomizationRepository.getFieldValues('habits', habit.id);
    setEditCustomValues(existingVals);
    setIsEditOpen(true);
  };

  const handleSaveAdd = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter habit name.');
      return;
    }

    const created = HabitsRepository.create({
      name: name.trim(),
      description: description.trim(),
      targetCount: parseInt(targetCount, 10) || 1,
      unit: unit || 'times',
      frequency,
      scheduleDays,
      preferredTime,
      durationMinutes: parseInt(durationMinutes, 10) || 15,
      color,
    });

    if (created && Object.keys(addCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('habits', created.id, addCustomValues);
    }

    setIsAddOpen(false);
    loadHabits();
  };

  const handleSaveEdit = () => {
    if (!editingHabit || !name.trim()) {
      Alert.alert('Required', 'Please enter habit name.');
      return;
    }

    HabitsRepository.update(editingHabit.id, {
      name: name.trim(),
      description: description.trim(),
      targetCount: parseInt(targetCount, 10) || 1,
      unit: unit || 'times',
      frequency,
      scheduleDays,
      preferredTime,
      durationMinutes: parseInt(durationMinutes, 10) || 15,
      color,
    });

    if (Object.keys(editCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('habits', editingHabit.id, editCustomValues);
    }

    setIsEditOpen(false);
    setEditingHabit(null);
    loadHabits();
  };

  const handleArchiveHabit = (id: string) => {
    HabitsRepository.archive(id);
    setSelectedHabitDetails(null);
    loadHabits();
  };

  const handleDeleteHabit = (id: string, habitName: string) => {
    Alert.alert(
      'Delete Habit',
      `Permanently delete "${habitName}" and its completion history? To preserve your past completion analytics, choose Archive instead.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive Habit', onPress: () => handleArchiveHabit(id) },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            HabitsRepository.delete(id);
            setSelectedHabitDetails(null);
            loadHabits();
          },
        },
      ]
    );
  };

  const handleSaveHistoricalCompletion = (habitId: string) => {
    if (!editingHistoryDate) return;
    const count = parseInt(historyCount, 10) || 0;
    HabitsRepository.editHistoricalCompletion(habitId, editingHistoryDate, count, historyNotes);
    setEditingHistoryDate(null);
    setHistoryNotes('');
    loadHabits();
  };

  // Best overall streak across habits
  const overallStreaks = useMemo(() => {
    let topStreak = 0;
    habits.forEach((h) => {
      if ((h.streak || 0) > topStreak) topStreak = h.streak || 0;
    });
    return topStreak;
  }, [habits]);

  return (
    <Screen backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary }]} numberOfLines={1}>
              Habits
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              Recurring activities that build over time
            </Text>
          </View>
        </View>

        {/* Frequency Filter Chips */}
        <View style={styles.filterBar}>
          {[
            { key: 'all', label: 'All' },
            { key: 'daily', label: 'Daily' },
            { key: 'weekly', label: 'Weekly' },
            { key: 'custom', label: 'Custom' },
          ].map((tab) => {
            const isSelected = filterFrequency === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setFilterFrequency(tab.key as any)}
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
        </View>

        {/* Habits Feed */}
        <ScrollView style={styles.list} contentContainerStyle={styles.scrollListPadding} showsVerticalScrollIndicator={false}>
          {filteredHabits.length === 0 ? (
            <EmptyState
              icon="flash-outline"
              title="No habits scheduled"
              description="Build routines with measurable daily, weekly, or monthly targets."
              actionTitle="+ Create First Habit"
              onAction={handleOpenAdd}
            />
          ) : (
            filteredHabits.map((habit) => {
              const isDoneToday = (habit.todayCount || 0) >= (habit.target_count || 1);
              const progress = habit.progressPercent || 0;

              return (
                <TouchableOpacity
                  key={habit.id}
                  activeOpacity={0.8}
                  onPress={() => handleOpenDetail(habit)}
                >
                  <Card style={styles.habitCard}>
                    <View style={styles.habitRow}>
                      {/* Check / Increment Action */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleToggleHabit(habit.id)}
                        style={[
                          styles.toggleBtn,
                          {
                            backgroundColor: isDoneToday ? colors.primary : colors.inputBg,
                            borderColor: isDoneToday ? colors.primary : colors.border,
                          },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Toggle ${habit.name}`}
                      >
                        <Ionicons
                          name={isDoneToday ? 'checkmark' : 'add'}
                          size={18}
                          color={isDoneToday ? '#FFFFFF' : colors.textPrimary}
                        />
                      </TouchableOpacity>

                      {/* Info Column */}
                      <View style={styles.habitInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                            {habit.name}
                          </Text>
                          <View style={[styles.miniBadge, { backgroundColor: colors.accentMint }]}>
                            <Text style={[typography.captionBold, { color: colors.primary, fontSize: 10 }]}>
                              {habit.frequency.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                          Target: {habit.target_count} {habit.unit} · {habit.duration_minutes || 15}m
                          {habit.preferred_time ? ` · ${habit.preferred_time}` : ''}
                        </Text>
                      </View>

                      {/* Streak Badge */}
                      <View style={styles.streakCol}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="flame" size={15} color="#F59E0B" style={{ marginRight: 2 }} />
                          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                            {habit.streak || 0}
                          </Text>
                        </View>
                        <Text style={[typography.caption, { color: colors.textMuted, fontSize: 10 }]}>
                          Max {habit.longestStreak || 0}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <ProgressBar
                      progress={progress}
                      color={isDoneToday ? colors.primary : colors.primaryLight}
                      style={{ marginTop: 10 }}
                    />

                    {/* Custom Fields Badges */}
                    <CustomFieldsBadgeRow entityType="habits" entityId={habit.id} />
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginVertical: 8 }]}>
          Tap = open | Swipe left = edit / delete
        </Text>

        {/* Floating + Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleOpenAdd}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Add Habit"
        >
          <Ionicons name="add" size={28} color="#000000" />
        </TouchableOpacity>

        {/* Add Habit Sheet Modal using Standardized Dayvane Forms */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Create New Habit"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <FormInput
              label="Habit Name"
              required
              value={name}
              onChangeText={setName}
              placeholder="e.g. Read 20 Pages, Cold Shower, Gym"
              icon="flash-outline"
            />

            <FormTextArea
              label="Motivation / Cue"
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. After pouring my morning coffee..."
              numberOfLines={2}
            />

            <FormSelect
              label="Frequency Schedule"
              value={frequency}
              options={FREQUENCY_OPTIONS}
              onSelect={(val) => setFrequency(val as HabitFrequency)}
            />

            <FormWeekdaysPicker
              selectedDays={scheduleDays}
              onChange={setScheduleDays}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Target Repetitions"
                  value={targetCount}
                  onChangeText={setTargetCount}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Unit"
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="times, mins, pages"
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Preferred Time"
                  value={preferredTime}
                  onChangeText={setPreferredTime}
                  placeholder="08:00"
                  icon="time-outline"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Duration (Mins)"
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  keyboardType="numeric"
                  placeholder="15"
                />
              </View>
            </View>

            <CustomFieldsSection
              entityType="habits"
              values={addCustomValues}
              onChange={(k, v) => setAddCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

            <Button
              title="Save Habit"
              onPress={handleSaveAdd}
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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
            <FormInput
              label="Habit Name"
              required
              value={name}
              onChangeText={setName}
              icon="flash-outline"
            />

            <FormTextArea
              label="Motivation / Cue"
              value={description}
              onChangeText={setDescription}
              numberOfLines={2}
            />

            <FormSelect
              label="Frequency Schedule"
              value={frequency}
              options={FREQUENCY_OPTIONS}
              onSelect={(val) => setFrequency(val as HabitFrequency)}
            />

            <FormWeekdaysPicker
              selectedDays={scheduleDays}
              onChange={setScheduleDays}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Target"
                  value={targetCount}
                  onChangeText={setTargetCount}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Unit"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Preferred Time"
                  value={preferredTime}
                  onChangeText={setPreferredTime}
                  icon="time-outline"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput
                  label="Duration (Mins)"
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <CustomFieldsSection
              entityType="habits"
              values={editCustomValues}
              onChange={(k, v) => setEditCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

            <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
              <Button
                title="Archive"
                variant="ghost"
                onPress={() => editingHabit && handleArchiveHabit(editingHabit.id)}
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

        {/* Habit Detail & History View Modal */}
        {selectedHabitDetails && (
          <BottomSheetModal
            visible={!!selectedHabitDetails && !isEditOpen}
            onClose={() => setSelectedHabitDetails(null)}
            title="Habit History & Stats"
          >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
              <View style={styles.detailHeaderBox}>
                <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '800' }]}>
                  {selectedHabitDetails.name}
                </Text>
                {selectedHabitDetails.description && (
                  <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
                    {selectedHabitDetails.description}
                  </Text>
                )}
              </View>

              {/* Stats Tiles */}
              <View style={styles.statsTilesRow}>
                <View style={[styles.statTile, { backgroundColor: colors.inputBg, borderRadius: radius.md }]}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Current Streak</Text>
                  <Text style={[typography.h2, { color: colors.primary, fontWeight: '800', marginTop: 2 }]}>
                    {selectedHabitDetails.streak || 0}d
                  </Text>
                </View>
                <View style={[styles.statTile, { backgroundColor: colors.inputBg, borderRadius: radius.md }]}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Longest Streak</Text>
                  <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '800', marginTop: 2 }]}>
                    {selectedHabitDetails.longestStreak || 0}d
                  </Text>
                </View>
                <View style={[styles.statTile, { backgroundColor: colors.inputBg, borderRadius: radius.md }]}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>Total Days</Text>
                  <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '800', marginTop: 2 }]}>
                    {selectedHabitDetails.totalCompletedDays || 0}
                  </Text>
                </View>
              </View>

              {/* Historical Completion Log Editor */}
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.sectionTitle, typography.captionBold, { color: colors.textSecondary }]}>
                  RECENT COMPLETIONS & EDIT LOGS
                </Text>

                {editingHistoryDate ? (
                  <View style={[styles.editHistoryBox, { backgroundColor: colors.inputBg, borderColor: colors.border, borderRadius: radius.md }]}>
                    <Text style={[typography.captionBold, { color: colors.primary, marginBottom: 8 }]}>
                      Edit Log for {editingHistoryDate}
                    </Text>
                    <FormInput
                      label="Completed Count"
                      value={historyCount}
                      onChangeText={setHistoryCount}
                      keyboardType="numeric"
                    />
                    <FormInput
                      label="Completion Note / Context"
                      value={historyNotes}
                      onChangeText={setHistoryNotes}
                      placeholder="e.g. Great focus session"
                    />
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                      <Button
                        title="Cancel"
                        variant="ghost"
                        onPress={() => setEditingHistoryDate(null)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        title="Update Log"
                        variant="primary"
                        onPress={() => handleSaveHistoricalCompletion(selectedHabitDetails.id)}
                        style={{ flex: 2 }}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.historyList}>
                    {(selectedHabitDetails.completionHistory || []).slice(0, 10).map((log: any) => (
                      <TouchableOpacity
                        key={log.date}
                        onPress={() => {
                          setEditingHistoryDate(log.date);
                          setHistoryCount(String(log.count || 1));
                          setHistoryNotes(log.notes || '');
                        }}
                        style={[styles.historyRow, { borderBottomColor: colors.border }]}
                      >
                        <View>
                          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                            {log.date}
                          </Text>
                          {log.notes && (
                            <Text style={[typography.caption, { color: colors.textSecondary }]}>
                              {log.notes}
                            </Text>
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={[typography.captionBold, { color: colors.primary, marginRight: 6 }]}>
                            {log.count} done
                          </Text>
                          <Ionicons name="pencil-outline" size={14} color={colors.textMuted} />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Custom fields row */}
              <CustomFieldsBadgeRow entityType="habits" entityId={selectedHabitDetails.id} />

              {/* Detail Actions */}
              <View style={styles.detailActionsRow}>
                <Button
                  title="Edit Habit"
                  variant="secondary"
                  onPress={() => handleOpenEdit(selectedHabitDetails)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Delete"
                  variant="ghost"
                  onPress={() => handleDeleteHabit(selectedHabitDetails.id, selectedHabitDetails.name)}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </ScrollView>
          </BottomSheetModal>
        )}
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
  addIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBanner: {
    padding: 12,
    marginBottom: 12,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fireCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
  },
  list: {
    flex: 1,
  },
  scrollListPadding: {
    paddingBottom: 40,
  },
  habitCard: {
    marginBottom: 12,
    padding: 14,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  streakCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  modalForm: {
    paddingBottom: 30,
  },
  detailScroll: {
    paddingBottom: 30,
  },
  detailHeaderBox: {
    marginBottom: 14,
  },
  statsTilesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statTile: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  editHistoryBox: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  historyList: {
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  detailActionsRow: {
    flexDirection: 'row',
    marginTop: 16,
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
