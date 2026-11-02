import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../hooks/useTheme';

export const WeeklyReviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  return (
    <Screen scroll backgroundColor={colors.background} contentContainerStyle={styles.scrollPadding} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topNav}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary }]}>
              Weekly Review
            </Text>
            <Text style={[typography.subtext, { color: colors.textSecondary }]}>
              Oct 28 – Nov 1, 2026
            </Text>
          </View>
        </View>

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
  scrollPadding: {
    paddingBottom: 60,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
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

