import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { LineChart } from '../../../components/charts/LineChart';
import { DonutChart } from '../../../components/charts/DonutChart';
import { BarChart } from '../../../components/charts/BarChart';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { StatCard } from '../../../components/ui/StatCard';
import { useTheme } from '../../../hooks/useTheme';
import { useAnalytics } from '../hooks/useAnalytics';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'habits' | 'learning'>('overview');

  const {
    timeframe,
    setTimeframe,
    productivityScore,
    productivityTrend,
    donutSegments,
    categoryUsage,
    totalFocusHoursFormatted,
    taskStats,
    habitStats,
    studySubjects,
    technicalSkills,
    softSkills,
    learningSummary,
  } = useAnalytics();

  const totalMinutes = categoryUsage.reduce((acc, c) => acc + c.minutes, 0);

  return (
    <Screen scroll backgroundColor={colors.background} contentContainerStyle={styles.scrollPadding}>
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
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary }]}>
                Analytics
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Growth metrics & insights
              </Text>
            </View>
          </View>

          {/* Timeframe Filter Chips */}
          <View style={[styles.timeframeToggle, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setTimeframe('week')}
              style={[
                styles.timeframeBtn,
                timeframe === 'week' && { backgroundColor: colors.primary },
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  typography.captionBold,
                  { color: timeframe === 'week' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTimeframe('month')}
              style={[
                styles.timeframeBtn,
                timeframe === 'month' && { backgroundColor: colors.primary },
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  typography.captionBold,
                  { color: timeframe === 'month' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Tabs: Overview / Habits / Learning */}
        <View style={styles.tabContainer}>
          <SegmentedTabs
            tabs={[
              { key: 'overview', label: 'Overview' },
              { key: 'habits', label: 'Habits' },
              { key: 'learning', label: 'Learning' },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as any)}
          />
        </View>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <View>
            {/* Quick Stat Cards Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Productivity"
                value={`${productivityScore}%`}
                trend="+18%"
                trendPositive={true}
                icon="trending-up-outline"
                style={styles.statCardItem}
              />
              <StatCard
                label="Focus Time"
                value={totalFocusHoursFormatted}
                subtext={timeframe === 'week' ? 'Past 7 days' : 'Past 30 days'}
                icon="timer-outline"
                style={styles.statCardItem}
              />
              <StatCard
                label="Tasks Done"
                value={`${taskStats.completed}/${taskStats.total}`}
                trend={`${taskStats.percent}%`}
                trendPositive={taskStats.percent >= 75}
                icon="checkmark-done-circle-outline"
                style={styles.statCardItem}
              />
              <StatCard
                label="Best Streak"
                value={`${habitStats.bestStreak}d`}
                subtext="Consistent habit"
                icon="flame-outline"
                iconColor={colors.orange}
                style={styles.statCardItem}
              />
            </View>

            {/* Productivity Card with Trend Line */}
            <Card variant="elevated" style={styles.cardSection}>
              <View style={styles.scoreRow}>
                <View>
                  <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
                    PRODUCTIVITY SCORE
                  </Text>
                  <View style={styles.scoreWithBadge}>
                    <Text style={[styles.scoreNumber, typography.hero, { color: colors.textPrimary }]}>
                      {productivityScore}%
                    </Text>
                    <View style={[styles.trendBadge, { backgroundColor: colors.accentMint }]}>
                      <Ionicons name="arrow-up" size={14} color={colors.primary} style={{ marginRight: 2 }} />
                      <Text style={[typography.captionBold, { color: colors.primary }]}>
                        +18%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <LineChart
                data={productivityTrend}
                height={120}
                color={colors.primary}
              />
            </Card>

            {/* Time Usage Donut Chart Card */}
            <Card style={styles.cardSection}>
              <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700' }]}>
                Time Usage
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2, marginBottom: 12 }]}>
                Focus sessions and activity breakdown
              </Text>

              <DonutChart
                segments={donutSegments}
                size={180}
                strokeWidth={24}
                centerValue={totalFocusHoursFormatted}
                centerLabel="Total logged"
              />

              {/* Legend */}
              <View style={styles.legendContainer}>
                {donutSegments.map((seg, i) => {
                  const pct = totalMinutes > 0 ? Math.round((seg.value / totalMinutes) * 100) : 0;
                  return (
                    <View key={i} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
                      <Text style={[typography.bodyMedium, { color: colors.textSecondary, flex: 1 }]}>
                        {seg.label}
                      </Text>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary, marginRight: 8 }]}>
                        {seg.value}m
                      </Text>
                      <Text style={[typography.caption, { color: colors.textMuted, width: 36, textAlign: 'right' }]}>
                        {pct}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          </View>
        )}

        {/* Tab 2: HABITS */}
        {activeTab === 'habits' && (
          <View>
            {/* Habits Stat Cards */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Adherence Rate"
                value={`${habitStats.averageAdherence}%`}
                trendPositive={habitStats.averageAdherence >= 70}
                icon="ribbon-outline"
                style={styles.statCardItem}
              />
              <StatCard
                label="Longest Streak"
                value={`${habitStats.bestStreak} Days`}
                icon="flame-outline"
                iconColor={colors.orange}
                style={styles.statCardItem}
              />
            </View>

            {/* 7-Day Consistency Bar Chart */}
            <Card style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700' }]}>
                    Weekly Consistency
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                    Daily habit check-ins over the past week
                  </Text>
                </View>
                <View style={[styles.miniBadge, { backgroundColor: colors.accentMint }]}>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    {habitStats.weeklyActivity.reduce((a, b) => a + b, 0)} Done
                  </Text>
                </View>
              </View>

              <View style={styles.barChartWrapper}>
                <BarChart
                  data={habitStats.weeklyActivity}
                  height={110}
                  positiveColor={colors.primary}
                  barWidth={18}
                  width={screenWidth - 68}
                />
                <View style={styles.dayLabelsRow}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                    <Text key={idx} style={[typography.captionBold, { color: colors.textMuted }]}>
                      {day}
                    </Text>
                  ))}
                </View>
              </View>
            </Card>

            {/* Habits Leaderboard List */}
            <Card style={styles.cardSection}>
              <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700', marginBottom: 12 }]}>
                Habits Performance
              </Text>

              {habitStats.habits.length === 0 ? (
                <Text style={[typography.bodyMedium, { color: colors.textMuted, textAlign: 'center', marginVertical: 16 }]}>
                  No habits tracked yet. Add habits in the Habits tab to see performance!
                </Text>
              ) : (
                habitStats.habits.map((habit) => (
                  <View key={habit.id} style={[styles.habitPerformanceRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.habitRowHeader}>
                      <View style={styles.habitTitleCol}>
                        <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                          {habit.name}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                          Target: {habit.target_count} {habit.unit} · {habit.frequency}
                        </Text>
                      </View>
                      <View style={[styles.streakPill, { backgroundColor: colors.orangeSoft }]}>
                        <Ionicons name="flame" size={14} color={colors.orange} style={{ marginRight: 3 }} />
                        <Text style={[typography.captionBold, { color: colors.orange }]}>
                          {habit.streak || 0}d streak
                        </Text>
                      </View>
                    </View>

                    <View style={styles.habitProgressRow}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <ProgressBar progress={habit.progressPercent || 0} height={8} />
                      </View>
                      <Text style={[typography.captionBold, { color: colors.textPrimary, width: 38, textAlign: 'right' }]}>
                        {habit.progressPercent || 0}%
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Card>
          </View>
        )}

        {/* Tab 3: LEARNING */}
        {activeTab === 'learning' && (
          <View>
            {/* Learning Stat Cards */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Topics Mastered"
                value={`${learningSummary.completedTopics}/${learningSummary.totalTopics}`}
                trend={`${learningSummary.studyCompletionPercent}%`}
                trendPositive={true}
                icon="book-outline"
                style={styles.statCardItem}
              />
              <StatCard
                label="Skills Tracked"
                value={learningSummary.totalSkills}
                subtext={`Avg ${learningSummary.avgSkillMastery}% mastery`}
                icon="ribbon-outline"
                iconColor={colors.purple}
                style={styles.statCardItem}
              />
            </View>

            {/* Study Curriculum Progress */}
            <Card style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700' }]}>
                    Curriculum Progress
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                    Topics checklist and mastery per subject
                  </Text>
                </View>
                <View style={[styles.miniBadge, { backgroundColor: colors.accentMint }]}>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    {learningSummary.totalSubjects} Subjects
                  </Text>
                </View>
              </View>

              {studySubjects.length === 0 ? (
                <Text style={[typography.bodyMedium, { color: colors.textMuted, textAlign: 'center', marginVertical: 16 }]}>
                  No subjects added yet. Add subjects in Study Planner!
                </Text>
              ) : (
                studySubjects.map((subject) => (
                  <View key={subject.id} style={[styles.subjectItem, { borderBottomColor: colors.border }]}>
                    <View style={styles.subjectHeader}>
                      <View style={styles.subjectLeft}>
                        <View style={[styles.subjectColorDot, { backgroundColor: subject.color || colors.primary }]} />
                        <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                          {subject.name}
                        </Text>
                      </View>
                      <Text style={[typography.captionBold, { color: colors.primary }]}>
                        {subject.progressPercent || 0}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={subject.progressPercent || 0}
                      height={7}
                      color={subject.color || colors.primary}
                    />
                    <View style={styles.subjectFooter}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {subject.completedTopicsCount || 0} of {subject.topicsCount || 0} topics completed
                      </Text>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        Goal: {subject.target_hours}h
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Card>

            {/* Technical Skills Card */}
            <Card style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700' }]}>
                  Technical Skills
                </Text>
                <Ionicons name="code-slash" size={20} color={colors.primary} />
              </View>

              {technicalSkills.length === 0 ? (
                <Text style={[typography.bodyMedium, { color: colors.textMuted, textAlign: 'center', marginVertical: 12 }]}>
                  No technical skills logged. Add them in Skills & Learning.
                </Text>
              ) : (
                technicalSkills.map((skill) => (
                  <View key={skill.id} style={[styles.skillRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.skillHeader}>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                        {skill.name}
                      </Text>
                      <Text style={[typography.captionBold, { color: colors.primary }]}>
                        {skill.progress}%
                      </Text>
                    </View>
                    <ProgressBar progress={skill.progress} height={7} color={colors.primary} />
                  </View>
                ))
              )}
            </Card>

            {/* Soft Skills Card */}
            <Card style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700' }]}>
                  Soft Skills
                </Text>
                <Ionicons name="people" size={20} color={colors.purple} />
              </View>

              {softSkills.length === 0 ? (
                <Text style={[typography.bodyMedium, { color: colors.textMuted, textAlign: 'center', marginVertical: 12 }]}>
                  No soft skills logged. Add them in Skills & Learning.
                </Text>
              ) : (
                softSkills.map((skill) => (
                  <View key={skill.id} style={[styles.skillRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.skillHeader}>
                      <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                        {skill.name}
                      </Text>
                      <Text style={[typography.captionBold, { color: colors.purple }]}>
                        {skill.progress}%
                      </Text>
                    </View>
                    <ProgressBar progress={skill.progress} height={7} color={colors.purple} />
                  </View>
                ))
              )}
            </Card>
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollPadding: {
    paddingBottom: 110,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
  },
  timeframeToggle: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
  },
  timeframeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  tabContainer: {
    marginBottom: 16,
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCardItem: {
    width: (screenWidth - 42) / 2,
    padding: 12,
  },
  cardSection: {
    padding: 18,
    marginBottom: 16,
  },
  scoreRow: {
    marginBottom: 10,
  },
  scoreWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  scoreNumber: {
    fontWeight: '800',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  legendContainer: {
    marginTop: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  miniBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  barChartWrapper: {
    alignItems: 'center',
    marginTop: 6,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: screenWidth - 76,
    marginTop: 8,
  },
  habitPerformanceRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  habitRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  habitTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  habitProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  subjectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  skillRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
});
