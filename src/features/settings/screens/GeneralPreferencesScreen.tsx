import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../hooks/useTheme';
import { useCustomizationStore } from '../../../store/useCustomizationStore';
import { GeneralPreferences } from '../../customization/customization.types';

const DATE_FORMATS: { format: GeneralPreferences['dateFormat']; label: string; example: string }[] = [
  { format: 'YYYY-MM-DD', label: 'ISO Standard (YYYY-MM-DD)', example: '2026-11-03' },
  { format: 'DD/MM/YYYY', label: 'International (DD/MM/YYYY)', example: '03/11/2026' },
  { format: 'MM/DD/YYYY', label: 'US Standard (MM/DD/YYYY)', example: '11/03/2026' },
];

export const GeneralPreferencesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();

  const { generalPreferences, updateGeneralPreferences } = useCustomizationStore();

  const handleSelectDateFormat = (format: GeneralPreferences['dateFormat']) => {
    updateGeneralPreferences({ dateFormat: format });
  };

  const handleSelectWeekStart = (day: 'monday' | 'sunday') => {
    updateGeneralPreferences({ weekStartDay: day });
  };

  const handleToggleSound = () => {
    updateGeneralPreferences({ soundEnabled: !generalPreferences.soundEnabled });
  };

  const handleToggleHaptics = () => {
    updateGeneralPreferences({ hapticsEnabled: !generalPreferences.hapticsEnabled });
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Preferences',
      'Restore all general formatting and behavioral preferences to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            updateGeneralPreferences({
              dateFormat: 'YYYY-MM-DD',
              weekStartDay: 'monday',
              soundEnabled: true,
              hapticsEnabled: true,
            });
          },
        },
      ]
    );
  };

  return (
    <Screen backgroundColor={colors.background} contentContainerStyle={styles.container} scroll>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, typography.h2, { color: colors.textPrimary }]}>
          General Preferences
        </Text>
        <TouchableOpacity
          onPress={handleReset}
          style={[styles.resetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Reset preferences"
        >
          <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <Card variant="outlined" style={styles.infoCard}>
        <Ionicons name="options-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
            Locale & Interaction Options
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Customize your preferred calendar schedule, date formats, tactile feedback, and sounds.
          </Text>
        </View>
      </Card>

      {/* 1. Date Format */}
      <View style={styles.sectionHeader}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          Date Display Format
        </Text>
      </View>

      <Card variant="elevated" style={styles.cardSection}>
        {DATE_FORMATS.map((df, idx) => {
          const isSelected = generalPreferences.dateFormat === df.format;
          return (
            <TouchableOpacity
              key={df.format}
              activeOpacity={0.7}
              onPress={() => handleSelectDateFormat(df.format)}
              style={[
                styles.optionRow,
                idx < DATE_FORMATS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  {df.label}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Preview: {df.example}
                </Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: isSelected ? colors.primary : colors.border },
                ]}
              >
                {isSelected && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </Card>

      {/* 2. Week Start Day */}
      <View style={styles.sectionHeader}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          Calendar Week Start
        </Text>
      </View>

      <Card variant="elevated" style={styles.cardSection}>
        <View style={styles.segmentedRow}>
          <TouchableOpacity
            onPress={() => handleSelectWeekStart('monday')}
            style={[
              styles.segmentedBtn,
              {
                backgroundColor:
                  generalPreferences.weekStartDay === 'monday' ? colors.primary : colors.surface,
                borderColor:
                  generalPreferences.weekStartDay === 'monday' ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={generalPreferences.weekStartDay === 'monday' ? '#FFFFFF' : colors.textPrimary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                typography.bodyBold,
                {
                  color:
                    generalPreferences.weekStartDay === 'monday' ? '#FFFFFF' : colors.textPrimary,
                },
              ]}
            >
              Monday (Standard)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelectWeekStart('sunday')}
            style={[
              styles.segmentedBtn,
              {
                backgroundColor:
                  generalPreferences.weekStartDay === 'sunday' ? colors.primary : colors.surface,
                borderColor:
                  generalPreferences.weekStartDay === 'sunday' ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name="sunny-outline"
              size={18}
              color={generalPreferences.weekStartDay === 'sunday' ? '#FFFFFF' : colors.textPrimary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                typography.bodyBold,
                {
                  color:
                    generalPreferences.weekStartDay === 'sunday' ? '#FFFFFF' : colors.textPrimary,
                },
              ]}
            >
              Sunday
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* 3. Feedback & Haptics */}
      <View style={styles.sectionHeader}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          Sounds & Haptics
        </Text>
      </View>

      <Card variant="elevated" style={styles.cardSection}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
              Haptic Feedback
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Tactile vibrations when completing tasks & milestones
            </Text>
          </View>
          <Switch
            value={generalPreferences.hapticsEnabled}
            onValueChange={handleToggleHaptics}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
              Sound Effects
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Subtle audio cues on streak increments and focus timer alerts
            </Text>
          </View>
          <Switch
            value={generalPreferences.soundEnabled}
            onValueChange={handleToggleSound}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      <View style={{ height: 40 }} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 16,
    borderRadius: 14,
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 6,
  },
  cardSection: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
});

