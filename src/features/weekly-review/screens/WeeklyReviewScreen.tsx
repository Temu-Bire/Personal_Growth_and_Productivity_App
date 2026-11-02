import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../hooks/useTheme';

export const WeeklyReviewScreen: React.FC = () => {
  const { colors, typography, radius } = useTheme();

  return (
    <Screen scroll backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary }]}>
          Weekly Review
        </Text>
        <Text style={[typography.subtext, { color: colors.textSecondary, marginBottom: 16 }]}>
          Oct 28 – Nov 1, 2026
        </Text>

        {/* Celebration Banner */}
        <Card style={[styles.celebrationCard, { backgroundColor: colors.accentMint, borderColor: '#A7F3D0' }]}>
          <Text style={{ fontSize: 24, marginRight: 8 }}>🎉</Text>
          <Text style={[typography.h2, { color: colors.deepGreen, fontWeight: '800' }]}>
            Great week!
          </Text>
        </Card>

        {/* Weekly Stat Blocks */}
        <View style={styles.statsRow}>
          <Card style={styles.statBox}>
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
              TASKS COMPLETED
            </Text>
            <View style={styles.numRow}>
              <Text style={[typography.hero, { color: colors.textPrimary, fontWeight: '800' }]}>
                18
              </Text>
              <Text style={[typography.captionBold, { color: colors.primary, marginLeft: 6 }]}>
                +14 done
              </Text>
            </View>
          </Card>

          <Card style={styles.statBox}>
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
              HABIT STREAK
            </Text>
            <View style={styles.numRow}>
              <Text style={[typography.hero, { color: colors.textPrimary, fontWeight: '800' }]}>
                6/7
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 6 }]}>
                days
              </Text>
            </View>
          </Card>
        </View>

        {/* Top Achievement */}
        <Card style={styles.infoCard}>
          <Text style={[typography.captionBold, { color: colors.primary, marginBottom: 4 }]}>
            ⭐ Top Achievement
          </Text>
          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
            Completed 2 projects tasks & sustained daily study routine
          </Text>
        </Card>

        {/* Weekly Reflection */}
        <Card style={styles.infoCard}>
          <Text style={[typography.captionBold, { color: colors.purple, marginBottom: 4 }]}>
            📝 Weekly Reflection
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]}>
            "Maintained high focus without social media distractions. Trading execution was disciplined, and mathematics problem sets are ahead of schedule."
          </Text>
        </Card>

        {/* View Details Purple Button */}
        <Button
          title="View Details →"
          onPress={() => Alert.alert('Weekly Report', 'All 7-day focus, habits, and tasks metrics are synchronized locally.')}
          variant="secondary"
          size="lg"
          style={{ marginTop: 20 }}
        />
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
  },
  celebrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    padding: 16,
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  infoCard: {
    padding: 16,
    marginBottom: 12,
  },
});
