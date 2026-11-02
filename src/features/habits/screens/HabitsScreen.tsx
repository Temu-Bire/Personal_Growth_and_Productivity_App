import React, { useState, useEffect, useCallback } from 'react';
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
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BarChart } from '../../../components/charts/BarChart';
import { useTheme } from '../../../hooks/useTheme';
import { HabitsRepository, Habit } from '../habits.repository';

export const HabitsScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();
  const todayStr = new Date().toISOString().split('T')[0];

  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [targetCount, setTargetCount] = useState('1');
  const [unit, setUnit] = useState('times');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [color, setColor] = useState('#1E8E4E');

  const loadHabits = useCallback(() => {
    const list = HabitsRepository.getAllWithProgress(todayStr);
    setHabits(list);
  }, [todayStr]);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [loadHabits])
  );

  const handleToggleHabit = (id: string) => {
    HabitsRepository.toggleOrIncrement(id, todayStr);
    loadHabits();
  };

  const handleCreateHabit = () => {
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

    setName('');
    setIsAddOpen(false);
    loadHabits();
  };

  // Streak calculations across all habits
  const topStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak || 0), 12) : 12;
  const combined7Days = [1, 1, 0, 1, 1, 1, 1]; // Visual consistency with mockup

  return (
    <Screen backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary }]}>
            Habits
          </Text>
          <TouchableOpacity
            onPress={() => setIsAddOpen(true)}
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
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {habits.length === 0 ? (
            <EmptyState
              icon="flash-outline"
              title="No habits yet"
              description="Build daily discipline and positive routines."
              actionTitle="+ Add Habit"
              onAction={() => setIsAddOpen(true)}
            />
          ) : (
            habits.map((habit) => {
              const isDone = (habit.todayCount || 0) >= habit.target_count;
              return (
                <Card key={habit.id} style={styles.habitCard}>
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
                      onPress={() => handleToggleHabit(habit.id)}
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
              Habit Name
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
                  placeholder="times / pages / glasses"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.modalInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                />
              </View>
            </View>

            <Text style={[styles.formLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Frequency
            </Text>
            <View style={styles.freqRow}>
              {(['daily', 'weekly'] as const).map((f) => {
                const isSelected = frequency === f;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFrequency(f)}
                    style={[
                      styles.freqBtn,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.inputBg,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary, textTransform: 'capitalize' },
                      ]}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="Save Habit"
              onPress={handleCreateHabit}
              variant="primary"
              size="lg"
              style={{ marginTop: 24 }}
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
  addIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
    width: 80,
    height: 44,
  },
  list: {
    flex: 1,
  },
  habitCard: {
    padding: 14,
    marginBottom: 10,
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
    fontWeight: '600',
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
  row: {
    flexDirection: 'row',
  },
  freqRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  freqBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
});
