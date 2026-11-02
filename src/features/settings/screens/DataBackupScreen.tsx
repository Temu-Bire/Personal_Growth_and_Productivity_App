import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { BackupService } from '../backup.service';
import { useTheme } from '../../../hooks/useTheme';

export const DataBackupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [autoReminder, setAutoReminder] = useState(true);

  const handleExport = async () => {
    try {
      setLoadingExport(true);
      await BackupService.exportBackup();
      Alert.alert('Backup Exported', 'Your GrowPro backup (.growpro) file has been generated.');
    } catch (e: any) {
      Alert.alert('Export Error', e?.message || 'Could not export backup.');
    } finally {
      setLoadingExport(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoadingImport(true);
      const restored = await BackupService.importBackup();
      if (restored) {
        Alert.alert('Restore Complete', 'All your habits, tasks, focus logs, and trades have been restored!');
      }
    } catch (e: any) {
      Alert.alert('Import Failed', e?.message || 'Invalid backup file.');
    } finally {
      setLoadingImport(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data?',
      'This will erase all tasks, habits, trades, and journal entries stored on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await BackupService.clearAllData();
              Alert.alert('Data Cleared', 'Your database has been reset.');
            } catch (err: unknown) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen scroll backgroundColor={colors.background} contentContainerStyle={styles.scrollPadding} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topNav}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, typography.h2, { color: colors.textPrimary, marginLeft: 12 }]}>
            Data & Backup
          </Text>
        </View>

        {/* Banner */}
        <Card style={[styles.bannerCard, { backgroundColor: colors.accentMint }]}>
          <Ionicons name="cloud-offline" size={28} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[typography.h3, { color: colors.deepGreen }]}>
              Everything is stored locally
            </Text>
            <Text style={[typography.caption, { color: colors.deepGreen, marginTop: 2 }]}>
              Last backup: Oct 30, 2026
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <Card style={styles.actionCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExport}
            style={styles.actionRow}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.accentMint }]}>
              <Ionicons name="share-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.actionTexts}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Export backup
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                .growpro file to save or share
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleImport}
            style={styles.actionRow}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.purpleSoft }]}>
              <Ionicons name="download-outline" size={22} color={colors.purple} />
            </View>
            <View style={styles.actionTexts}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Import backup
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Restore from a .growpro file
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClearData}
            style={styles.actionRow}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.dangerSoft }]}>
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </View>
            <View style={styles.actionTexts}>
              <Text style={[typography.bodyBold, { color: colors.danger }]}>
                Clear all data
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Permanently wipe database
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Auto Reminder Switch */}
        <Card style={styles.switchCard}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
                Auto-reminder to back up
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Gentle weekly prompt to export offline data
              </Text>
            </View>
            <Switch
              value={autoReminder}
              onValueChange={setAutoReminder}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={autoReminder ? colors.primary : '#FFFFFF'}
            />
          </View>
        </Card>
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
  topTitle: {
    fontWeight: '700',
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  actionCard: {
    padding: 12,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTexts: {
    flex: 1,
    marginLeft: 14,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  switchCard: {
    padding: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

