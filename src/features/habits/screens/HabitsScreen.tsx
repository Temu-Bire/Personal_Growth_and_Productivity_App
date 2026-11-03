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
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BarChart } from '../../../components/charts/BarChart';
import { useTheme } from '../../../hooks/useTheme';
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { CustomizationRepository } from '../../customization/customization.repository';
import { ViewModeSwitcher } from '../../customization/components/ViewModeSwitcher';
import { CustomFieldsSection } from '../../customization/components/CustomFieldsSection';
import { CustomFieldsBadgeRow } from '../../customization/components/CustomFieldsBadgeRow';
import { sortItemsByLayout } from '../../customization/layout.utils';
import { HabitsRepository, Habit } from '../habits.repository';

export const HabitsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const pageLayout = useCustomizationStore((state) => state.pageLayouts['habits']);
  const todayStr = new Date().toISOString().split('T')[0];

  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedHabitDetails, setSelectedHabitDetails] = useState<(Habit & { totalCompletedDays?: number; completionHistory?: any[] }) | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<string[]>(['times', 'mins', 'pages', 'km', 'cups', 'hrs']);

  // Form State
  const [name, setName] = useState('');
  const [targetCount, setTargetCount] = useState('1');
  const [unit, setUnit] = useState('times');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [color, setColor] = useState('#1E8E4E');
  const [addCustomValues, setAddCustomValues] = useState<Record<string, any>>({});
  const [editCustomValues, setEditCustomValues] = useState<Record<string, any>>({});

  const loadHabits = useCallback(() => {
    const list = HabitsRepository.getAllWithProgress(todayStr);
    setHabits(list);

    // If detail is open, refresh detail too
    if (selectedHabitDetails) {
      const refreshed = HabitsRepository.getHabitDetails(selectedHabitDetails.id, todayStr);
      setSelectedHabitDetails(refreshed);
    }

    // Load custom measurement units
    const customUnits = CustomizationRepository.getUnits('habits');
    const baseUnits = ['times', 'mins', 'pages', 'km', 'cups', 'hrs'];
    customUnits.forEach((u) => {
      const unitKey = u.abbreviation || u.name.toLowerCase();
      if (!baseUnits.includes(unitKey)) baseUnits.push(unitKey);
    });
    setAvailableUnits(baseUnits);
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
    setAddCustomValues({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setName(habit.name);
    setTargetCount(String(habit.target_count || 1));
    setUnit(habit.unit || 'times');
    setFrequency(habit.frequency || 'daily');
    setColor(habit.color || '#1E8E4E');
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
      targetCount: parseInt(targetCount, 10) || 1,
      unit: unit || 'times',
      frequency,
      icon: 'flash-outline',
      color,
    });

    if (created && Object.keys(addCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('habits', created.id, addCustomValues);
    }

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

    if (Object.keys(editCustomValues).length > 0) {
      CustomizationRepository.saveFieldValues('habits', selectedHabitDetails.id, editCustomValues);
    }

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

  const sortedHabits = useMemo(() => {
    return sortItemsByLayout(habits, pageLayout);
  }, [habits, pageLayout]);

  const viewMode = pageLayout?.viewMode || 'card';
  const visibleFields = pageLayout?.visibleFields || [
    'show_dates',
    'show_categories',
    'show_progress',
    'show_notes',
    'show_status',
  ];

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
            <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary, marginLeft: 12 }]} numberOfLines={1}>
              Habits
            </Text>
          </View>

          <View style={styles.headerRight}>
            <ViewModeSwitcher pageKey="habits" />
            <TouchableOpacity
              onPress={handleOpenAdd}
              style={[styles.addIconBtn, { backgroundColor: colors.accentMint, marginLeft: 8 }]}
              accessibilityRole="button"
              accessibilityLabel="Add Habit"
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
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
          contentContainerStyle={[
            styles.scrollListPadding,
            viewMode === 'grid' && styles.gridContainer,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {sortedHabits.length === 0 ? (
            <EmptyState
              icon="flash-outline"
              title="No habits yet"
              description="Build daily discipline and positive routines."
              actionTitle="+ Add Habit"
              onAction={handleOpenAdd}
            />
          ) : (
            sortedHabits.map((habit) => {
              const isDone = (habit.todayCount || 0) >= habit.target_count;

              // 1. Compact View Mode
              if (viewMode === 'compact') {
                return (
                  <Card key={habit.id} style={styles.compactCard}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleOpenDetail(habit)}
                      style={styles.compactRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                          {habit.name}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {habit.todayCount || 0}/{habit.target_count} {habit.unit}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleToggleHabit(habit.id)}
                        style={[
                          styles.miniCheckBtn,
                          {
                            backgroundColor: isDone ? colors.primary : colors.accentMint,
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        <Ionicons
                          name={isDone ? 'checkmark' : 'add'}
                          size={14}
                          color={isDone ? '#FFFFFF' : colors.primary}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 2. List View Mode
              if (viewMode === 'list') {
                return (
                  <Card key={habit.id} style={styles.listCard}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleOpenDetail(habit)}
                      style={styles.listRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                          {habit.name}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {habit.todayCount || 0} of {habit.target_count} {habit.unit} · {habit.streak || 0}d streak
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleToggleHabit(habit.id)}
                        style={[
                          styles.checkBtn,
                          {
                            backgroundColor: isDone ? colors.primary : 'transparent',
                            borderColor: isDone ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Ionicons
                          name={isDone ? 'checkmark' : 'add'}
                          size={18}
                          color={isDone ? '#FFFFFF' : colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 3. Grid View Mode
              if (viewMode === 'grid') {
                return (
                  <Card key={habit.id} style={styles.gridCard}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => handleOpenDetail(habit)}>
                      <View style={[styles.iconBox, { backgroundColor: (habit.color || colors.primary) + '22', marginBottom: 8 }]}>
                        <Ionicons
                          name={(habit.icon as any) || 'flash-outline'}
                          size={20}
                          color={habit.color || colors.primary}
                        />
                      </View>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]} numberOfLines={1}>
                        {habit.name}
                      </Text>
                      <ProgressBar
                        progress={habit.progressPercent || 0}
                        height={4}
                        color={habit.color || colors.primary}
                        style={{ marginVertical: 6 }}
                      />
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 11 }]}>
                          {habit.todayCount || 0}/{habit.target_count} {habit.unit}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleToggleHabit(habit.id)}
                          style={[
                            styles.miniCheckBtn,
                            { backgroundColor: isDone ? colors.primary : colors.accentMint },
                          ]}
                        >
                          <Ionicons name={isDone ? 'checkmark' : 'add'} size={12} color={isDone ? '#FFFFFF' : colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </Card>
                );
              }

              // 4. Card View Mode (Default)
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
                          {visibleFields.includes('show_progress') && (
                            <Text style={[typography.captionBold, { color: isDone ? colors.primary : colors.textMuted }]}>
                              {habit.progressPercent}%
                            </Text>
                          )}
                        </View>

                        {visibleFields.includes('show_progress') && (
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
                        )}
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

                    {/* Custom Fields Badges */}
                    <CustomFieldsBadgeRow entityType="habits" entityId={habit.id} />
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

            {/* Quick Unit Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {availableUnits.map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnit(u)}
                  style={[
                    styles.unitChip,
                    unit === u && { backgroundColor: colors.accentMint, borderColor: colors.primary },
                    { borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: unit === u ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
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

            {/* Custom Fields Section */}
            <CustomFieldsSection
              entityType="habits"
              values={addCustomValues}
              onChange={(k, v) => setAddCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

            <Button
              title="Create Habit"
              onPress={handleSaveAdd}
              style={{ marginTop: 20 }}
            />
          </View>
        </BottomSheetModal>

        {/* Habit Details Modal */}
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

              {/* Custom Fields on Detail View */}
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
              Habit Name
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

            {/* Custom Fields Section */}
            <CustomFieldsSection
              entityType="habits"
              values={editCustomValues}
              onChange={(k, v) => setEditCustomValues((prev) => ({ ...prev, [k]: v }))}
            />

            <Button
              title="Save Changes"
              onPress={handleSaveEdit}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
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
    justifyContent: 'space-between',
  },
  miniCheckBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
    marginBottom: 12,
    padding: 12,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitDetails: {
    flex: 1,
    marginHorizontal: 12,
  },
  titleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  habitName: {
    fontSize: 16,
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
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  freqBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  detailContent: {
    paddingBottom: 24,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  detailStatBox: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  detailActionsRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
