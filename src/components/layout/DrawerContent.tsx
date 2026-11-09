import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTheme } from '../../hooks/useTheme';
import { DrawerParamList } from '../../app/navigation/types';

interface DrawerItemConfig {
  id: string;
  routeName: keyof DrawerParamList;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const DAYVANE_DRAWER_ITEMS: DrawerItemConfig[] = [
  { id: 'dashboard', routeName: 'DashboardScreen', label: 'Dashboard', icon: 'grid-outline' },
  { id: 'habits', routeName: 'HabitsScreen', label: 'Habits', icon: 'repeat-outline' },
  { id: 'tasks', routeName: 'TasksScreen', label: 'Tasks', icon: 'checkbox-outline' },
  { id: 'goals', routeName: 'GoalsScreen', label: 'Goals', icon: 'flag-outline' },
  { id: 'projects', routeName: 'ProjectsScreen', label: 'Projects', icon: 'folder-outline' },
  { id: 'journal', routeName: 'JournalScreen', label: 'Journal', icon: 'book-outline' },
  { id: 'calendar', routeName: 'CalendarScreen', label: 'Calendar', icon: 'calendar-outline' },
  { id: 'analytics', routeName: 'AnalyticsScreen', label: 'Analytics', icon: 'bar-chart-outline' },
  { id: 'reports', routeName: 'ReportsScreen', label: 'Reports', icon: 'document-text-outline' },
  { id: 'coach', routeName: 'CoachScreen', label: 'AI Coach', icon: 'sparkles-outline' },
  { id: 'settings', routeName: 'SettingsScreen', label: 'Settings', icon: 'settings-outline' },
];

export const DrawerContent: React.FC<DrawerContentComponentProps> = ({ navigation, state }) => {
  const profileName = useSettingsStore((s) => s.profileName);
  const profileAvatar = useSettingsStore((s) => s.profileAvatar);
  const profileFocus = useSettingsStore((s) => s.profileFocus);
  const setIsLocked = useSettingsStore((s) => s.setIsLocked);
  const appLockEnabled = useSettingsStore((s) => s.appLockEnabled);
  const appLockPin = useSettingsStore((s) => s.appLockPin);
  const setAppLock = useSettingsStore((s) => s.setAppLock);

  const { colors, typography, radius } = useTheme();

  const activeRouteName = state.routes[state.index]?.name;

  const INACTIVE_ITEM_COLOR = '#A1A1AA';
  const ACTIVE_ITEM_COLOR = '#FFFFFF';

  const handleLockNow = () => {
    if (!appLockEnabled || !appLockPin) {
      Alert.alert(
        'App Lock PIN Required',
        'You have not set up a 4-digit PIN yet. Would you like to configure your PIN now, or activate quick lock with default PIN (0000)?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Configure PIN',
            onPress: () => {
              navigation.closeDrawer();
              navigation.navigate('AppLockSettingsScreen' as any);
            },
          },
          {
            text: 'Quick Lock (0000)',
            onPress: async () => {
              await setAppLock({ enabled: true, pin: '0000' });
              setIsLocked(true);
              navigation.closeDrawer();
              navigation.navigate('LockScreen' as any);
            },
          },
        ]
      );
      return;
    }

    setIsLocked(true);
    navigation.closeDrawer();
    navigation.navigate('LockScreen' as any);
  };

  const handleOpenProfile = () => {
    navigation.navigate('SettingsScreen');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.drawerBg }]}>
      {/* Top Header Section above divider with profile info */}
      <View style={styles.topProfileHeader}>
        <SafeAreaView edges={['top']} style={styles.topSafeArea}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenProfile}
            style={styles.profileTouchable}
            accessibilityRole="button"
            accessibilityLabel="Edit Profile"
          >
            <View style={styles.profileRow}>
              <View style={styles.avatarContainer}>
                {profileAvatar ? (
                  <Image source={{ uri: profileAvatar }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: '#3B82F6' }]}>
                    <Text style={styles.avatarInitials}>
                      {profileName ? profileName.charAt(0).toUpperCase() : 'T'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.profileInfoCol}>
                <View style={styles.nameWithEditRow}>
                  <Text style={[styles.profileName, typography.h2, { color: '#FAFAFA' }]} numberOfLines={1}>
                    {profileName || 'Temesgen'}
                  </Text>
                  <View style={styles.pencilCircle}>
                    <Ionicons name="pencil-outline" size={13} color="#A1A1AA" />
                  </View>
                </View>
                <Text style={[styles.profileBadge, typography.caption, { color: '#A1A1AA' }]}>
                  {profileFocus ? `${profileFocus} · Offline` : 'Local profile · Offline'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.divider} />
      </View>

      {/* Main Drawer Body */}
      <View style={styles.body}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {DAYVANE_DRAWER_ITEMS.map((item) => {
            const isActive = activeRouteName === item.routeName;
            const itemColor = isActive ? ACTIVE_ITEM_COLOR : INACTIVE_ITEM_COLOR;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(item.routeName)}
                style={[
                  styles.navItem,
                  {
                    borderRadius: radius.md,
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={itemColor}
                  style={styles.navIcon}
                />
                <Text
                  style={[
                    styles.navLabel,
                    typography.bodyMedium,
                    {
                      color: itemColor,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer Lock Action */}
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLockNow}
            style={[styles.lockBtn, { borderRadius: radius.round }]}
            accessibilityRole="button"
            accessibilityLabel="Lock App Now"
          >
            <View style={styles.lockIconBadge}>
              <Ionicons name="lock-closed" size={15} color="#F59E0B" />
            </View>
            <Text style={[typography.bodyMedium, styles.lockBtnText]}>
              Lock App Now
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topProfileHeader: {
    backgroundColor: '#121215',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  topSafeArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  profileTouchable: {
    paddingVertical: 6,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameWithEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pencilCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontWeight: '700',
    fontSize: 17,
    flexShrink: 1,
  },
  profileBadge: {
    marginTop: 3,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  scroll: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginVertical: 2,
  },
  navIcon: {
    marginRight: 12,
  },
  navLabel: {
    fontSize: 14,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lockIconBadge: {
    marginRight: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtnText: {
    color: '#FAFAFA',
    fontWeight: '600',
    fontSize: 14,
  },
});
