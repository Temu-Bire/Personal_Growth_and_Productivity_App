import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { subDays, format } from 'date-fns';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../hooks/useTheme';
import { CATEGORY_COLORS } from '../../../theme/colors';
import { HabitsRepository, Habit } from '../../habits/habits.repository';
import { TasksRepository } from '../../tasks/tasks.repository';
import { JournalRepository } from '../../journal/journal.repository';

type Timeframe = 7 | 30 | 90;

export const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [timeframe, setTimeframe] = useState<Timeframe>(30);
  const [trendDays, setTrendDays] = useState<{ date: string; percent: number }[]>([]);
  const [habitConsistencies, setHabitConsistencies] = useState<{ name: string; percent: number }[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<{ name: string; count: number; color: string }[]>([]);
  const [journalAverages, setJournalAverages] = useState<{ mood: number; energy: number; productivity: number }>({
    mood: 0,
    energy: 0,
    productivity: 0,
  });

  const loadData = useCallback(() => {
    const today = new Date();
    const days: { date: string; percent: number }[] = [];

    // 1. Completion trend for last N days
    const daysCount = timeframe === 7 ? 7 : timeframe === 30 ? 14 : 20;
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      const stats = TasksRepository.getCompletionStats(d);
      days.push({ date: format(subDays(today, i), 'd'), percent: stats.percent });
    }
    setTrendDays(days);

    // 2. Consistency per habit
    const habits = HabitsRepository.getAll();
    const habitStats = habits.map((h) => {
      const dates = HabitsRepository.getCompletionDates(h.id);
      // count in timeframe
      const cutoff = format(subDays(today, timeframe), 'yyyy-MM-dd');
      const validDates = dates.filter((d) => d >= cutoff);
      const percent = Math.min(100, Math.round((validDates.length / Math.max(1, timeframe)) * 100));
      return { name: h.name, percent };
    }).sort((a, b) => b.percent - a.percent);
    setHabitConsistencies(habitStats);

    // 3. Category balance
    const tasks = TasksRepository.getTasks();
    const catMap: Record<string, number> = {};
    const catColors = CATEGORY_COLORS;

    ['Health', 'Career', 'Finance', 'Learning', 'Faith', 'Personal'].forEach((c) => {
      catMap[c] = 0;
    });

    tasks.forEach((t) => {
      if (catMap[t.category] !== undefined) {
        catMap[t.category]++;
      } else {
        catMap['Personal']++;
      }
    });

    const cats = Object.keys(catMap).map((k) => ({
      name: k,
      count: catMap[k],
      color: catColors[k] || '#64748B',
    }));
    setCategoryCounts(cats);

    // 4. Journal averages
    const averages = JournalRepository.getAverages(timeframe);
    setJournalAverages(averages);
  }, [timeframe]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalCatCount = categoryCounts.reduce((acc, c) => acc + c.count, 0);

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[typography.h1, { color: colors.textPrimary }]}>Analytics</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              Am I improving? Where am I falling behind?
            </Text>
          </View>
        </View>

        {/* Timeframe Chips */}
        <View style={styles.timeframeRow}>
          {([7, 30, 90] as Timeframe[]).map((t) => {
            const active = timeframe === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setTimeframe(t)}
                style={[
                  styles.timeframeChip,
                  {
                    backgroundColor: active ? colors.card : 'transparent',
                    borderColor: active ? colors.textPrimary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: active ? colors.textPrimary : colors.textSecondary },
                  ]}
                >
                  {t} days
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 1. Completion Trend Card */}
          <Card style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 12 }]}>
              Completion trend
            </Text>
            <View style={styles.chartContainer}>
              <View style={styles.barsRow}>
                {trendDays.map((td, idx) => (
                  <View key={idx} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${Math.max(8, td.percent)}%`,
                            backgroundColor: '#22C55E',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[typography.caption, { color: colors.textMuted, fontSize: 9, marginTop: 4 }]}>
                      {td.date}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          {/* 2. Consistency per Habit Card */}
          <Card style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 12 }]}>
              Consistency per habit
            </Text>
            {habitConsistencies.length === 0 ? (
              <Text style={[typography.caption, { color: colors.textMuted }]}>No habit data yet.</Text>
            ) : (
              habitConsistencies.slice(0, 5).map((h, idx) => (
                <View key={idx} style={styles.habitRow}>
                  <View style={styles.habitLabelRow}>
                    <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
                      {h.name}
                    </Text>
                    <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
                      {h.percent}%
                    </Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: colors.divider }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${h.percent}%`,
                          backgroundColor:
                            idx === 0 ? '#14B8A6' : idx === 1 ? '#3B82F6' : '#22C55E',
                        },
                      ]}
                    />
                  </View>
                </View>
              ))
            )}
          </Card>

          {/* 3. Category Balance Card */}
          <Card style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 12 }]}>
              Category balance
            </Text>

            {/* Segmented multi-color horizontal bar */}
            <View style={[styles.segmentedBar, { backgroundColor: colors.divider }]}>
              {categoryCounts.map((cat, idx) => {
                const flexVal = totalCatCount === 0 ? 1 : Math.max(0.1, cat.count);
                return (
                  <View
                    key={idx}
                    style={{
                      flex: flexVal,
                      height: '100%',
                      backgroundColor: cat.color,
                    }}
                  />
                );
              })}
            </View>

            {/* Category names below */}
            <View style={styles.categoryLabelsRow}>
              {categoryCounts.map((cat, idx) => (
                <View key={idx} style={styles.catLegendItem}>
                  <View style={[styles.catColorBox, { backgroundColor: cat.color }]} />
                  <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 10 }]}>
                    {cat.name}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* 4. Journal Averages Card */}
          <Card style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 14 }]}>
              Journal averages
            </Text>

            <View style={styles.journalAveragesRow}>
              <View style={styles.journalAverageCol}>
                <Text style={[styles.averageNumber, { color: colors.textPrimary }]}>
                  {journalAverages.mood || '3.8'}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Mood</Text>
              </View>

              <View style={styles.journalAverageCol}>
                <Text style={[styles.averageNumber, { color: colors.textPrimary }]}>
                  {journalAverages.energy || '3.5'}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Energy</Text>
              </View>

              <View style={styles.journalAverageCol}>
                <Text style={[styles.averageNumber, { color: colors.textPrimary }]}>
                  {journalAverages.productivity || '4.1'}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Productivity</Text>
              </View>
            </View>
          </Card>
        </ScrollView>
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
    alignItems: 'center',
    paddingVertical: 14,
  },
  backBtn: {
    padding: 6,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  timeframeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  analyticsCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
  },
  chartContainer: {
    height: 100,
    justifyContent: 'flex-end',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 10,
    height: 60,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 3,
  },
  habitRow: {
    marginBottom: 12,
  },
  habitLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  segmentedBar: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    marginVertical: 10,
  },
  categoryLabelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  catLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catColorBox: {
    width: 8,
    height: 8,
    borderRadius: 2,
    marginRight: 4,
  },
  journalAveragesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  journalAverageCol: {
    alignItems: 'center',
  },
  averageNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
});
