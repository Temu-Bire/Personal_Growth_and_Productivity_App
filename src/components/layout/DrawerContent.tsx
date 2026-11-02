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
  { name: 'TasksScreen', label: 'Tasks & Schedule', icon: 'calendar-outline' },
  { name: 'IdeasScreen', label: 'Ideas', icon: 'bulb-outline' },
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
  const { profileName, profileAvatar, profileFocus, setIsLocked } = useSettingsStore();
  const { colors, typography, radius } = useTheme();

  const activeRouteName = state.routes[state.index]?.name;

  // Single unified color for all sidebar items
  const INACTIVE_ITEM_COLOR = '#E2E8F0';
  const ACTIVE_ITEM_COLOR = '#FFFFFF';

  const handleLockNow = () => {
    setIsLocked(true);
    navigation.closeDrawer();
  };

  const handleOpenProfile = () => {
    navigation.navigate('SettingsScreen');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.drawerBg }]}>
      {/* Top Header Section above divider with profile color */}
      <View style={[styles.topProfileHeader, { backgroundColor: '#082E19' }]}>
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
                  <View style={[styles.avatarPlaceholder, { backgroundColor: '#1E8E4E' }]}>
                    <Text style={styles.avatarInitials}>
                      {profileName ? profileName.charAt(0).toUpperCase() : 'G'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.profileInfoCol}>
                <View style={styles.nameWithEditRow}>
                  <Text style={[styles.profileName, typography.h2, { color: '#FFFFFF' }]} numberOfLines={1}>
                    {profileName || 'Temesgen'}
                  </Text>
                  <View style={styles.pencilCircle}>
                    <Ionicons name="pencil-outline" size={13} color="#A7F3D0" />
                  </View>
                </View>
                <Text style={[styles.profileBadge, typography.caption, { color: '#A7F3D0' }]}>
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
        {/* Nav List - All items share one unified color */}
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {MENU_ITEMS.map((item) => {
            const isActive = activeRouteName === item.name;
            const itemColor = isActive ? ACTIVE_ITEM_COLOR : INACTIVE_ITEM_COLOR;

            return (
              <TouchableOpacity
                key={item.name}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(item.name)}
                style={[
                  styles.navItem,
                  {
                    borderRadius: radius.md,
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
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

        {/* Footer Lock Action with distinct suitable button styling */}
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLockNow}
            style={[styles.lockBtn, { borderRadius: radius.round }]}
            accessibilityRole="button"
            accessibilityLabel="Lock App Now"
          >
            <View style={styles.lockIconBadge}>
              <Ionicons name="lock-closed" size={16} color="#F59E0B" />
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(167, 243, 208, 0.15)',
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
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#34A863',
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#34A863',
  },
  avatarInitials: {
    fontSize: 22,
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
    backgroundColor: 'rgba(167, 243, 208, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontWeight: '700',
    fontSize: 18,
    flexShrink: 1,
  },
  profileBadge: {
    marginTop: 4,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(167, 243, 208, 0.15)',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  scroll: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 2,
  },
  navIcon: {
    marginRight: 14,
  },
  navLabel: {
    fontSize: 15,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#062816',
    borderWidth: 1.5,
    borderColor: 'rgba(167, 243, 208, 0.35)',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  lockIconBadge: {
    marginRight: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
