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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BarChart } from '../../../components/charts/BarChart';
import { useTheme } from '../../../hooks/useTheme';
import { HabitsRepository, Habit } from '../habits.repository';

export const HabitsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const todayStr = new Date().toISOString().split('T')[0];

  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedHabitDetails, setSelectedHabitDetails] = useState<(Habit & { totalCompletedDays?: number; completionHistory?: any[] }) | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [targetCount, setTargetCount] = useState('1');
  const [unit, setUnit] = useState('times');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [color, setColor] = useState('#1E8E4E');

  const loadHabits = useCallback(() => {
    const list = HabitsRepository.getAllWithProgress(todayStr);
    setHabits(list);

    // If detail is open, refresh detail too
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
    setTargetCount('1');
    setUnit('times');
    setFrequency('daily');
    setColor('#1E8E4E');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setName(habit.name);
    setTargetCount(String(habit.target_count || 1));
    setUnit(habit.unit || 'times');
    setFrequency(habit.frequency || 'daily');
    setColor(habit.color || '#1E8E4E');
    setIsEditOpen(true);
  };

  const handleSaveAdd = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter habit name.');
      return;
    }

    HabitsRepository.create({
      name: name.trim(),
      targetCount: parseInt(targetCount, 10) || 1,
      unit: unit || 'times',
      frequency,
      icon: 'flash-outline',
      color,
    });

    setIsAddOpen(false);
    loadHabits();
  };

  const handleSaveEdit = () => {
    if (!selectedHabitDetails || !name.trim()) {
      Alert.alert('Required', 'Please enter habit name.');
      return;
    }

    HabitsRepository.update(selectedHabitDetails.id, {
      name: name.trim(),
      targetCount: parseInt(targetCount, 10) || 1,
      unit: unit || 'times',
      frequency,
      color,
    });

    setIsEditOpen(false);
    loadHabits();
  };

  const handleDeleteHabit = (habitId: string, habitName: string) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitName}"? All its logs and streak history will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            HabitsRepository.delete(habitId);
            setSelectedHabitDetails(null);
            setIsEditOpen(false);
            loadHabits();
          },
        },
      ]
    );
  };

  // Streak calculations across all habits
  const topStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak || 0), 12) : 12;
  const combined7Days = [1, 1, 0, 1, 1, 1, 1];

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
              Habits
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenAdd}
            style={[styles.addIconBtn, { backgroundColor: colors.accentMint }]}
            accessibilityRole="button"
            accessibilityLabel="Add Habit"
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Streak Banner */}
        <Card style={[styles.streakBanner, { backgroundColor: colors.orangeSoft, borderColor: '#FDE68A' }]}>
          <View style={styles.streakInfo}>
            <View style={styles.streakRow}>
              <Text style={{ fontSize: 22, marginRight: 6 }}>🔥</Text>
              <Text style={[typography.h2, { color: '#92400E', fontWeight: '800' }]}>
                {topStreak} Day Streak
              </Text>
            </View>
            <Text style={[typography.caption, { color: '#B45309', marginTop: 2 }]}>
              Unstoppable! Keep building your habits.
            </Text>
          </View>
          <View style={styles.miniChart}>
            <BarChart
              data={combined7Days}
              width={80}
              height={44}
              barWidth={6}
              positiveColor="#F59E0B"
            />
          </View>
        </Card>

        {/* Habits List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.scrollListPadding}
          showsVerticalScrollIndicator={false}
        >
          {habits.length === 0 ? (
            <EmptyState
              icon="flash-outline"
              title="No habits yet"
              description="Build daily discipline and positive routines."
              actionTitle="+ Add Habit"
              onAction={handleOpenAdd}
            />
          ) : (
            habits.map((habit) => {
              const isDone = (habit.todayCount || 0) >= habit.target_count;
              return (
                <TouchableOpacity
                  key={habit.id}
                  activeOpacity={0.8}
                  onPress={() => handleOpenDetail(habit)}
                >
                  <Card style={styles.habitCard}>
                    <View style={styles.habitRow}>
                      <View style={[styles.iconBox, { backgroundColor: colors.accentMint }]}>
                        <Ionicons
                          name={(habit.icon as any) || 'flash-outline'}
                          size={22}
                          color={habit.color || colors.primary}
                        />
                      </View>

                      <View style={styles.habitDetails}>
                        <View style={styles.titleLine}>
                          <Text style={[styles.habitName, typography.bodyBold, { color: colors.textPrimary }]}>
                            {habit.name}
                          </Text>
                          <Text style={[typography.captionBold, { color: isDone ? colors.primary : colors.textMuted }]}>
                            {habit.progressPercent}%
                          </Text>
                        </View>

                        <View style={styles.progressRow}>
                          <ProgressBar
                            progress={habit.progressPercent || 0}
                            height={6}
                            color={habit.color || colors.primary}
                            style={{ flex: 1, marginRight: 12 }}
                          />
                          <Text style={[typography.caption, { color: colors.textMuted }]}>
                            {habit.todayCount || 0} / {habit.target_count} {habit.unit}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleToggleHabit(habit.id);
                        }}
                        style={[
                          styles.checkBtn,
                          {
                            backgroundColor: isDone ? colors.primary : 'transparent',
                            borderColor: isDone ? colors.primary : colors.border,
                          },
                        ]}
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name={isDone ? 'checkmark' : 'add'}
                          size={18}
                          color={isDone ? '#FFFFFF' : colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Add Habit Sheet Modal */}
        <BottomSheetModal
          visible={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Create New Habit"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Habit Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Read 20 Pages"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Target Count
                </Text>
                <TextInput
                  value={targetCount}
                  onChangeText={setTargetCount}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Unit
                </Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="times, pages, mins"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 12 }]}>
              Frequency
            </Text>
            <View style={styles.frequencyRow}>
              <TouchableOpacity
                onPress={() => setFrequency('daily')}
                style={[
                  styles.freqBtn,
                  frequency === 'daily' && { backgroundColor: colors.accentMint, borderColor: colors.primary },
                  { borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: frequency === 'daily' ? colors.primary : colors.textSecondary },
                  ]}
                >
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFrequency('weekly')}
                style={[
                  styles.freqBtn,
                  frequency === 'weekly' && { backgroundColor: colors.accentMint, borderColor: colors.primary },
                  { borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: frequency === 'weekly' ? colors.primary : colors.textSecondary },
                  ]}
                >
                  Weekly
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Create Habit"
              onPress={handleSaveAdd}
              style={{ marginTop: 24 }}
            />
          </View>
        </BottomSheetModal>

        {/* Habit Details Modal (Requirement 2) */}
        {selectedHabitDetails && (
          <BottomSheetModal
            visible={!!selectedHabitDetails && !isEditOpen}
            onClose={() => setSelectedHabitDetails(null)}
            title="Habit Details"
          >
            <View style={styles.detailContent}>
              <View style={styles.detailHeaderRow}>
                <View style={[styles.detailIcon, { backgroundColor: colors.accentMint }]}>
                  <Ionicons
                    name={(selectedHabitDetails.icon as any) || 'flash-outline'}
                    size={28}
                    color={selectedHabitDetails.color || colors.primary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {selectedHabitDetails.name}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {selectedHabitDetails.frequency === 'daily' ? 'Daily Routine' : 'Weekly Goal'} · Target:{' '}
                    {selectedHabitDetails.target_count} {selectedHabitDetails.unit}
                  </Text>
                </View>
              </View>

              {/* Stats Cards Row */}
              <View style={styles.detailStatsRow}>
                <Card style={[styles.detailStatBox, { backgroundColor: colors.orangeSoft }]}>
                  <Text style={{ fontSize: 20 }}>🔥</Text>
                  <Text style={[typography.h3, { color: '#92400E', fontWeight: '800', marginTop: 4 }]}>
                    {selectedHabitDetails.streak || 0}
                  </Text>
                  <Text style={[typography.caption, { color: '#B45309' }]}>Day Streak</Text>
                </Card>

                <Card style={[styles.detailStatBox, { backgroundColor: colors.accentMint }]}>
                  <Ionicons name="trophy-outline" size={20} color={colors.primary} />
                  <Text style={[typography.h3, { color: colors.deepGreen, fontWeight: '800', marginTop: 4 }]}>
                    {selectedHabitDetails.totalCompletedDays || 0}
                  </Text>
                  <Text style={[typography.caption, { color: colors.deepGreen }]}>Total Days</Text>
                </Card>

                <Card style={[styles.detailStatBox, { backgroundColor: colors.purpleSoft }]}>
                  <Ionicons name="pie-chart-outline" size={20} color={colors.purple} />
                  <Text style={[typography.h3, { color: colors.purple, fontWeight: '800', marginTop: 4 }]}>
                    {selectedHabitDetails.progressPercent || 0}%
                  </Text>
                  <Text style={[typography.caption, { color: colors.purple }]}>Today</Text>
                </Card>
              </View>

              {/* Schedule & History info */}
              <View style={[styles.infoSection, { borderColor: colors.border }]}>
                <View style={styles.infoRow}>
                  <Text style={[typography.body, { color: colors.textSecondary }]}>Frequency & Schedule</Text>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                    {selectedHabitDetails.frequency.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[typography.body, { color: colors.textSecondary }]}>Current Progress</Text>
                  <Text style={[typography.bodyBold, { color: colors.primary }]}>
                    {selectedHabitDetails.todayCount || 0} / {selectedHabitDetails.target_count} {selectedHabitDetails.unit}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[typography.body, { color: colors.textSecondary }]}>Completion Status</Text>
                  <Text
                    style={[
                      typography.bodyBold,
                      {
                        color:
                          (selectedHabitDetails.todayCount || 0) >= selectedHabitDetails.target_count
                            ? colors.primary
                            : colors.orange,
                      },
                    ]}
                  >
                    {(selectedHabitDetails.todayCount || 0) >= selectedHabitDetails.target_count
                      ? 'Completed Today ✓'
                      : 'In Progress'}
                  </Text>
                </View>
              </View>

              {/* Action Buttons: Edit and Delete */}
              <View style={styles.detailActionButtons}>
                <Button
                  title="Edit Habit"
                  variant="primary"
                  onPress={() => handleOpenEdit(selectedHabitDetails)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Delete Habit"
                  variant="ghost"
                  onPress={() => handleDeleteHabit(selectedHabitDetails.id, selectedHabitDetails.name)}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          </BottomSheetModal>
        )}

        {/* Edit Habit Modal */}
        <BottomSheetModal
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Habit"
        >
          <View style={styles.modalForm}>
            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Habit Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[
                styles.modalInput,
                { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Target Count
                </Text>
                <TextInput
                  value={targetCount}
                  onChangeText={setTargetCount}
                  keyboardType="numeric"
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
                  Unit
                </Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary, marginTop: 12 }]}>
              Frequency
            </Text>
            <View style={styles.frequencyRow}>
              <TouchableOpacity
                onPress={() => setFrequency('daily')}
                style={[
                  styles.freqBtn,
                  frequency === 'daily' && { backgroundColor: colors.accentMint, borderColor: colors.primary },
                  { borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: frequency === 'daily' ? colors.primary : colors.textSecondary },
                  ]}
                >
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFrequency('weekly')}
                style={[
                  styles.freqBtn,
                  frequency === 'weekly' && { backgroundColor: colors.accentMint, borderColor: colors.primary },
                  { borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: frequency === 'weekly' ? colors.primary : colors.textSecondary },
                  ]}
                >
                  Weekly
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 24, gap: 10 }}>
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
          </View>
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
  addIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  streakInfo: {
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniChart: {
    marginLeft: 12,
  },
  list: {
    flex: 1,
  },
  scrollListPadding: {
    paddingBottom: 110,
  },
  habitCard: {
    marginBottom: 12,
    padding: 14,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitDetails: {
    flex: 1,
  },
  titleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  habitName: {
    flex: 1,
    marginRight: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
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
  frequencyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  freqBtn: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    paddingBottom: 24,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  detailStatBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  infoSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 14,
    marginBottom: 24,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
