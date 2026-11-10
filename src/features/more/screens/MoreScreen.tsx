import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { useTheme } from '../../../hooks/useTheme';
import { useSettingsStore } from '../../../store/useSettingsStore';

interface MenuItem {
  title: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { title: 'Goals', route: 'GoalsScreen', icon: 'flag-outline' },
  { title: 'Projects', route: 'ProjectsScreen', icon: 'folder-outline' },
  { title: 'Journal', route: 'JournalScreen', icon: 'book-outline' },
  { title: 'Analytics', route: 'AnalyticsScreen', icon: 'stats-chart-outline' },
  { title: 'Reports', route: 'ReportsScreen', icon: 'document-text-outline' },
  { title: 'AI Coach', route: 'CoachScreen', icon: 'sparkles-outline' },
  { title: 'Settings', route: 'SettingsScreen', icon: 'settings-outline' },
];

export const MoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, typography, radius } = useTheme();
  const profileName = useSettingsStore((state) => state.profileName) || 'Temesgen Birhenu';

  const initials = profileName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'TB';

  return (
    <Screen backgroundColor={colors.background} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h1, { color: colors.textPrimary }]}>More</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Everything else in Dayvane
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Card */}
          <Card style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.profileRow}>
              <View style={[styles.avatarCircle, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  {profileName}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  Saved on this device only
                </Text>
              </View>
            </View>
          </Card>

          {/* Menu Items List */}
          <View style={styles.menuContainer}>
            {MENU_ITEMS.map((item, idx) => {
              const isLast = idx === MENU_ITEMS.length - 1;
              return (
                <TouchableOpacity
                  key={item.route}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate(item.route)}
                  style={[
                    styles.menuRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderTopLeftRadius: idx === 0 ? radius.lg : 0,
                      borderTopRightRadius: idx === 0 ? radius.lg : 0,
                      borderBottomLeftRadius: isLast ? radius.lg : 0,
                      borderBottomRightRadius: isLast ? radius.lg : 0,
                      borderBottomWidth: isLast ? 1 : 0.5,
                      borderTopWidth: idx === 0 ? 1 : 0.5,
                      borderLeftWidth: 1,
                      borderRightWidth: 1,
                    },
                  ]}
                >
                  <View style={styles.menuLeft}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={colors.textSecondary}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '500' }]}>
                      {item.title}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
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
    paddingVertical: 14,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileCard: {
    padding: 14,
    marginBottom: 20,
    borderRadius: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

