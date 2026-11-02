import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs';
import { LineChart } from '../../../components/charts/LineChart';
import { DonutChart } from '../../../components/charts/DonutChart';
import { useTheme } from '../../../hooks/useTheme';
import { useAnalytics } from '../hooks/useAnalytics';

export const AnalyticsScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'habits' | 'learning'>('overview');

  const { productivityScore, productivityTrend, donutSegments } = useAnalytics();

  return (
    <Screen scroll backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary }]}>
          Analytics
        </Text>

        {/* Segmented Tabs: Overview / Habits / Learning */}
        <SegmentedTabs
          tabs={[
            { key: 'overview', label: 'Overview' },
            { key: 'habits', label: 'Habits' },
            { key: 'learning', label: 'Learning' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Productivity Card with Trend Line */}
        <Card variant="elevated" style={styles.productivityCard}>
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
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    +18%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <LineChart
            data={productivityTrend}
            height={110}
            color={colors.primary}
          />
        </Card>

        {/* Time Usage Donut Chart Card */}
        <Card style={styles.usageCard}>
          <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700' }]}>
            Time Usage
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2, marginBottom: 10 }]}>
            Focus sessions breakdown
          </Text>

          <DonutChart
            segments={donutSegments}
            size={180}
            strokeWidth={24}
            centerValue="4.8h"
            centerLabel="Logged today"
          />

          {/* Legend */}
          <View style={styles.legendContainer}>
            {donutSegments.map((seg, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
                <Text style={[typography.bodyMedium, { color: colors.textSecondary, flex: 1 }]}>
                  {seg.label}
                </Text>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  {seg.value}m
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontWeight: '800',
    marginVertical: 8,
  },
  productivityCard: {
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  usageCard: {
    padding: 18,
    marginBottom: 24,
  },
  legendContainer: {
    marginTop: 14,
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
});
