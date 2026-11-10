import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../hooks/useTheme';
import { ReportsService } from '../reports.service';

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const handleExportDaily = async () => {
    try {
      setLoadingDaily(true);
      await ReportsService.exportDailyReport();
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export daily report.');
    } finally {
      setLoadingDaily(false);
    }
  };

  const handleExportWeekly = async () => {
    try {
      setLoadingWeekly(true);
      await ReportsService.exportWeeklyReport();
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export weekly report.');
    } finally {
      setLoadingWeekly(false);
    }
  };

  const handleExportMonthly = async () => {
    try {
      setLoadingMonthly(true);
      await ReportsService.exportMonthlyReport();
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export monthly report.');
    } finally {
      setLoadingMonthly(false);
    }
  };

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
            <Text style={[typography.h1, { color: colors.textPrimary }]}>Reports</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              Export your progress as an Excel workbook
            </Text>
          </View>
        </View>

        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 12 }]}>
          Pick a report to export as .xlsx
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Card 1: Daily progress report */}
          <Card style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
              Daily progress report
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, marginBottom: 14 }]}>
              Today's habits, tasks, overall score, and journal ratings.
            </Text>
            <Button
              title={loadingDaily ? 'Generating...' : 'Download Excel'}
              onPress={handleExportDaily}
              variant="primary"
              size="md"
              disabled={loadingDaily}
            />
          </Card>

          {/* Card 2: Weekly progress report */}
          <Card style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
              Weekly progress report
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, marginBottom: 14 }]}>
              Last 7 days - completion trend, per-habit consistency, category balance.
            </Text>
            <Button
              title={loadingWeekly ? 'Generating...' : 'Download Excel'}
              onPress={handleExportWeekly}
              variant="primary"
              size="md"
              disabled={loadingWeekly}
            />
          </Card>

          {/* Card 3: Monthly progress report */}
          <Card style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
              Monthly progress report
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, marginBottom: 14 }]}>
              Last 30 days - the full picture of momentum across every category.
            </Text>
            <Button
              title={loadingMonthly ? 'Generating...' : 'Download Excel'}
              onPress={handleExportMonthly}
              variant="primary"
              size="md"
              disabled={loadingMonthly}
            />
          </Card>

          <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: 12 }]}>
            Built on the phone; opens Share sheet / Files.
          </Text>
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
  scrollContent: {
    paddingBottom: 100,
  },
  reportCard: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 14,
  },
});

