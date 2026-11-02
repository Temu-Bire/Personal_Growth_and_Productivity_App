import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTheme } from '../../hooks/useTheme';

interface MenuItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const MENU_ITEMS: MenuItem[] = [
  { name: 'DashboardScreen', label: 'Dashboard', icon: 'grid-outline' },
  { name: 'GoalsScreen', label: 'My Goals', icon: 'flag-outline' },
  { name: 'HabitsScreen', label: 'Habits', icon: 'flash-outline' },
  { name: 'StudyScreen', label: 'Study Planner', icon: 'school-outline' },
  { name: 'ProjectsScreen', label: 'Projects', icon: 'folder-open-outline' },
  { name: 'JournalScreen', label: 'Journal', icon: 'book-outline' },
  { name: 'TradingScreen', label: 'Trading Journal', icon: 'trending-up-outline' },
  { name: 'AnalyticsScreen', label: 'Analytics', icon: 'pie-chart-outline' },
  { name: 'SettingsScreen', label: 'Settings', icon: 'settings-outline' },
  { name: 'HelpScreen', label: 'Help & Support', icon: 'help-circle-outline' },
];

export const DrawerContent: React.FC<DrawerContentComponentProps> = ({ navigation, state }) => {
  const { profileName, profileAvatar, appLockEnabled, setIsLocked } = useSettingsStore();
  const { colors, typography, radius } = useTheme();

  const activeRouteName = state.routes[state.index]?.name;

  const handleLockNow = () => {
    setIsLocked(true);
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.drawerBg }]} edges={['top', 'bottom']}>
      {/* Profile Header */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {profileAvatar ? (
            <Image source={{ uri: profileAvatar }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#1E8E4E' }]}>
              <Text style={styles.avatarInitials}>
                {profileName ? profileName.charAt(0).toUpperCase() : 'G'}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.profileName, typography.h2, { color: '#FFFFFF' }]}>
          {profileName || 'Temesgen'}
        </Text>
        <Text style={[styles.profileBadge, typography.caption, { color: '#A7F3D0' }]}>
          Local profile · Offline
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Nav List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((item) => {
          const isActive = activeRouteName === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.name)}
              style={[
                styles.navItem,
                {
                  borderRadius: radius.md,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? '#FFFFFF' : '#A7F3D0'}
                style={styles.navIcon}
              />
              <Text
                style={[
                  styles.navLabel,
                  typography.bodyMedium,
                  {
                    color: isActive ? '#FFFFFF' : '#E5E7EB',
                    fontWeight: isActive ? '600' : '400',
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
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLockNow}
          style={[styles.lockBtn, { borderRadius: radius.lg }]}
          accessibilityRole="button"
          accessibilityLabel="Lock App Now"
        >
          <Ionicons name="lock-closed" size={18} color="#A7F3D0" style={{ marginRight: 8 }} />
          <Text style={[typography.bodyMedium, { color: '#FFFFFF', fontWeight: '600' }]}>
            Lock App Now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#34A863',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#34A863',
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileName: {
    fontWeight: '700',
  },
  profileBadge: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
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
    marginRight: 14,
  },
  navLabel: {
    fontSize: 15,
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
  },
});
