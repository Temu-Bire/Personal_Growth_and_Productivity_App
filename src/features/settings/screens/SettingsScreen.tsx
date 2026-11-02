import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { useSettingsStore, ThemeMode } from '../../../store/useSettingsStore';
import { useTheme } from '../../../hooks/useTheme';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    profileName,
    profileAvatar,
    profileFocus,
    themeMode,
    setThemeMode,
    updateProfile,
    setIsLocked,
  } = useSettingsStore();

  const { colors, typography, radius } = useTheme();

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        updateProfile({ avatar: res.assets[0].uri });
      }
    } catch {
      // safe
    }
  };

  const handleLockNow = () => {
    setIsLocked(true);
    navigation.navigate('LockScreen');
  };

  return (
    <Screen scroll backgroundColor={colors.background} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.openDrawer()}
            style={[styles.menuBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Open Menu"
          >
            <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, typography.h1, { color: colors.textPrimary, marginLeft: 12 }]}>
            Settings
          </Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickAvatar}
            style={styles.avatarWrap}
          >
            {profileAvatar ? (
              <Image source={{ uri: profileAvatar }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarBox, { backgroundColor: colors.accentMint }]}>
                <Text style={[typography.h1, { color: colors.primary, fontWeight: '800' }]}>
                  {profileName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700' }]}>
              {profileName}
            </Text>
            <Text style={[typography.caption, { color: colors.primary, marginTop: 2 }]}>
              Focus: {profileFocus} · 100% Offline
            </Text>
          </View>
        </Card>

        {/* Settings Options Group */}
        <Card style={styles.menuCard}>
          {/* App Lock & Security (with NEW badge) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AppLockSettingsScreen')}
            style={styles.menuRow}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="lock-closed" size={20} color="#6D4AFF" />
            </View>
            <View style={styles.menuText}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  App Lock & Security
                </Text>
                <View style={[styles.newBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[typography.captionBold, { color: '#FFFFFF', fontSize: 10 }]}>
                    NEW
                  </Text>
                </View>
              </View>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                PIN, biometrics & screen protection
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Appearance */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsThemeModalOpen(true)}
            style={styles.menuRow}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.accentMint }]}>
              <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Appearance
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, textTransform: 'capitalize' }]}>
                {themeMode} Mode
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Data & Backup */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DataBackupScreen')}
            style={styles.menuRow}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.orangeSoft }]}>
              <Ionicons name="server-outline" size={20} color={colors.orange} />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Data & Backup
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Export, import & database reset
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Privacy */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                '100% Offline Privacy',
                'GrowPro operates strictly offline without analytics, telemetry, or external servers. All personal growth and financial data resides solely inside your device’s encrypted storage.'
              )
            }
            style={styles.menuRow}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.accentMint }]}>
              <Ionicons name="shield-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Privacy
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Data stays exclusively on device
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* About */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                'About GrowPro',
                'GrowPro v1.0.0\nPlan · Focus · Achieve\nBuilt with offline-first Expo & SQLite.'
              )
            }
            style={styles.menuRow}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.inputBg }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                About GrowPro
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Version 1.0 · Open offline
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Lock Now Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLockNow}
          style={[styles.lockNowBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="lock-closed" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[typography.bodyBold, { color: colors.primary }]}>
            Lock App Now
          </Text>
        </TouchableOpacity>

        {/* Theme Picker Modal */}
        <BottomSheetModal
          visible={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          title="Select Appearance"
        >
          <View style={{ gap: 10, paddingVertical: 10 }}>
            {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                activeOpacity={0.7}
                onPress={() => {
                  setThemeMode(mode);
                  setIsThemeModalOpen(false);
                }}
                style={[
                  styles.themeChoice,
                  {
                    backgroundColor: themeMode === mode ? colors.accentMint : colors.inputBg,
                    borderColor: themeMode === mode ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.bodyBold,
                    {
                      color: themeMode === mode ? colors.primary : colors.textPrimary,
                      textTransform: 'capitalize',
                    },
                  ]}
                >
                  {mode}
                </Text>
                {themeMode === mode && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetModal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  menuBtn: {
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  menuCard: {
    padding: 10,
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 14,
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  lockNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  themeChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
});

