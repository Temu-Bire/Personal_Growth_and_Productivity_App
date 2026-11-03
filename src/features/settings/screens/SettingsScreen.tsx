import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { useSettingsStore, ThemeMode } from '../../../store/useSettingsStore';
import { useTheme } from '../../../hooks/useTheme';

const FOCUS_OPTIONS = ['Study', 'Work', 'Trading', 'Habits', 'Personal'];

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

  // Modals state
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(profileName);
  const [editFocus, setEditFocus] = useState(profileFocus);
  const [editAvatar, setEditAvatar] = useState<string | null>(profileAvatar);

  const handleOpenEditProfile = () => {
    setEditName(profileName);
    setEditFocus(profileFocus);
    setEditAvatar(profileAvatar);
    setIsEditProfileOpen(true);
  };

  const handlePickEditAvatar = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        setEditAvatar(res.assets[0].uri);
      }
    } catch {
      // safe fallback
    }
  };

  const handleSaveProfile = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert('Name Required', 'Please enter your display name or username.');
      return;
    }

    await updateProfile({
      name: trimmed,
      avatar: editAvatar,
      focus: editFocus,
    });

    setIsEditProfileOpen(false);
    Alert.alert('Profile Saved', 'Your profile details have been updated.');
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

        {/* Profile Card with Quick Edit */}
        <Card style={styles.profileCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenEditProfile}
            style={styles.avatarWrap}
            accessibilityRole="button"
            accessibilityLabel="Change avatar"
          >
            {profileAvatar ? (
              <Image source={{ uri: profileAvatar }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarBox, { backgroundColor: colors.accentMint }]}>
                <Text style={[typography.h1, { color: colors.primary, fontWeight: '800' }]}>
                  {profileName ? profileName.charAt(0).toUpperCase() : 'G'}
                </Text>
              </View>
            )}
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenEditProfile}
            style={styles.profileInfo}
            accessibilityRole="button"
            accessibilityLabel="Edit profile name"
          >
            <View style={styles.nameRow}>
              <Text style={[typography.h2, { color: colors.textPrimary, fontWeight: '700', flex: 1 }]} numberOfLines={1}>
                {profileName || 'Temesgen'}
              </Text>
              <View style={[styles.editBadge, { backgroundColor: colors.accentMint }]}>
                <Ionicons name="pencil" size={13} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[typography.captionBold, { color: colors.primary }]}>
                  Edit
                </Text>
              </View>
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
              Focus: {profileFocus} · 100% Offline
            </Text>
          </TouchableOpacity>
        </Card>

        {/* SECTION: App Personalization & Customization */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, typography.h3, { color: colors.textPrimary }]}>
            Personalization & Customization
          </Text>
          <View style={[styles.proBadge, { backgroundColor: colors.accentMint }]}>
            <Ionicons name="sparkles" size={12} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[typography.captionBold, { color: colors.primary, fontSize: 11 }]}>
              CUSTOMIZE
            </Text>
          </View>
        </View>

        <Card style={styles.menuCard}>
          {/* 1. Appearance & Theme */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AppearanceSettingsScreen')}
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Appearance and Theme"
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.accentMint }]}>
              <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Appearance & Theme
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Color palettes, custom colors, contrast & font scaling
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* 2. Navigation & Sidebar */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('NavigationSettingsScreen')}
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Navigation and Sidebar"
          >
            <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="menu-outline" size={20} color="#6D4AFF" />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Sidebar & Navigation
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Reorder, hide, rename & create custom pages
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* 3. Categories & Units */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CategoriesSettingsScreen')}
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Categories and Units"
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="pricetags-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Categories & Units
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Custom categories, colors, icons & measurement units
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* 4. Dashboard Customization */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DashboardSettingsScreen')}
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Dashboard Customization"
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="apps-outline" size={20} color="#0284C7" />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Dashboard Feed
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Show, hide, reorder & resize feed widgets
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* 5. Form Builder */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('FormBuilderSettingsScreen')}
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Form Builder"
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="construct-outline" size={20} color="#DB2777" />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Form Builder
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Add custom fields, sections, required rules & preview
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* 6. Layout & Lists */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LayoutSettingsScreen')}
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Layout and Lists"
          >
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="layers-outline" size={20} color="#16A34A" />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Layout & Lists
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Card, list, compact, grid views & default sorting
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* 7. General Preferences */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('GeneralPreferencesScreen')}
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="General Preferences"
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="options-outline" size={20} color="#4B5563" />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                General Preferences
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Date format, week start day, sounds & haptics
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* SECTION: System & Data */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, typography.h3, { color: colors.textPrimary }]}>
            Security & System
          </Text>
        </View>

        {/* Settings Options Group */}
        <Card style={styles.menuCard}>
          {/* Profile & Name Editor */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOpenEditProfile}
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Edit Profile"
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.accentMint }]}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Profile & Username
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Change your name, avatar & main focus
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* App Lock & Security */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AppLockSettingsScreen')}
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="App Lock and Security"
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
            accessibilityRole="button"
            accessibilityLabel="Appearance"
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
            accessibilityRole="button"
            accessibilityLabel="Data and Backup"
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="cloud-download-outline" size={20} color="#0284C7" />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Data & Backup
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Export, import & local storage
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Help & Support */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('HelpScreen')}
            style={styles.menuRow}
            accessibilityRole="button"
            accessibilityLabel="Help and Support"
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="help-circle-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.menuText}>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                Help & Support
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                FAQ, guides & send feedback
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Lock App Now Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLockNow}
          style={[styles.lockNowBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Lock App Now"
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

        {/* Edit Profile Modal */}
        <BottomSheetModal
          visible={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          title="Edit Profile"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.editProfileContainer}>
            {/* Avatar Picker in Modal */}
            <View style={styles.modalAvatarRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickEditAvatar}
                style={styles.modalAvatarWrap}
              >
                {editAvatar ? (
                  <Image source={{ uri: editAvatar }} style={styles.modalAvatarImg} />
                ) : (
                  <View style={[styles.modalAvatarBox, { backgroundColor: colors.accentMint }]}>
                    <Text style={[typography.hero, { color: colors.primary, fontSize: 32 }]}>
                      {editName ? editName.charAt(0).toUpperCase() : 'G'}
                    </Text>
                  </View>
                )}
                <View style={[styles.modalCameraBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.modalAvatarActions}>
                <TouchableOpacity
                  onPress={handlePickEditAvatar}
                  style={[styles.smallBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                >
                  <Text style={[typography.captionBold, { color: colors.textPrimary }]}>
                    Choose Photo
                  </Text>
                </TouchableOpacity>

                {editAvatar && (
                  <TouchableOpacity
                    onPress={() => setEditAvatar(null)}
                    style={[styles.smallBtn, { marginTop: 8 }]}
                  >
                    <Text style={[typography.captionBold, { color: colors.danger }]}>
                      Remove Photo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Display Name / Username Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
                NAME / USERNAME
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>

            {/* Main Focus Options */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
                PRIMARY FOCUS
              </Text>
              <View style={styles.chipRow}>
                {FOCUS_OPTIONS.map((f) => {
                  const isSelected = editFocus === f;
                  return (
                    <Chip
                      key={f}
                      label={f}
                      selected={isSelected}
                      onPress={() => setEditFocus(f)}
                      style={styles.chipItem}
                    />
                  );
                })}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsEditProfileOpen(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Save Changes"
                variant="primary"
                onPress={handleSaveProfile}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </ScrollView>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  menuCard: {
    padding: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  editProfileContainer: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  modalAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatarWrap: {
    position: 'relative',
    marginRight: 16,
  },
  modalAvatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  modalAvatarBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modalAvatarActions: {
    flex: 1,
    justifyContent: 'center',
  },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    alignSelf: 'flex-start',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  textInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chipItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
});
