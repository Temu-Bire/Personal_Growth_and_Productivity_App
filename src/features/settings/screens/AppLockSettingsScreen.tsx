import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/ui/Card';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { Button } from '../../../components/ui/Button';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { useTheme } from '../../../hooks/useTheme';

export const AppLockSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    appLockEnabled,
    useBiometrics,
    lockOnMinimize,
    hideContentInSwitcher,
    setAppLock,
  } = useSettingsStore();

  const { colors, typography, radius } = useTheme();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPin, setNewPin] = useState('');

  const handleToggleLock = (val: boolean) => {
    if (val) {
      setIsPinModalOpen(true);
    } else {
      setAppLock({ enabled: false, pin: '', useBiometrics: false });
    }
  };

  const handleSavePin = () => {
    if (newPin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
      return;
    }
    setAppLock({ enabled: true, pin: newPin });
    setNewPin('');
    setIsPinModalOpen(false);
    Alert.alert('PIN Updated', 'Your app lock PIN has been configured.');
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
            App Lock & Security
          </Text>
        </View>

        {/* Status Banner */}
        <Card style={[styles.statusCard, { backgroundColor: appLockEnabled ? colors.surface : colors.inputBg, borderColor: colors.border }]}>
          <View style={styles.statusRow}>
            <View style={[styles.lockIconBox, { backgroundColor: appLockEnabled ? colors.primary : colors.textMuted }]}>
              <Ionicons name="shield-checkmark" size={24} color={appLockEnabled ? colors.background : '#FFFFFF'} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typography.h3, { color: colors.textPrimary }]}>
                {appLockEnabled ? 'App Lock is ON' : 'App Lock is OFF'}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                Your personal growth data is secured strictly offline.
              </Text>
            </View>
          </View>
        </Card>

        {/* Toggles */}
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelGroup}>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
                Enable App Lock
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Require 4-digit PIN or biometrics to open
              </Text>
            </View>
            <Switch
              value={appLockEnabled}
              onValueChange={handleToggleLock}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={appLockEnabled ? colors.primary : '#FFFFFF'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLabelGroup}>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
                Use Biometrics
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Fingerprint or Face ID
              </Text>
            </View>
            <Switch
              value={useBiometrics}
              disabled={!appLockEnabled}
              onValueChange={(val) => setAppLock({ enabled: appLockEnabled, useBiometrics: val })}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={useBiometrics ? colors.primary : '#FFFFFF'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity
            disabled={!appLockEnabled}
            onPress={() => setIsPinModalOpen(true)}
            style={styles.settingRow}
          >
            <View style={styles.settingLabelGroup}>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
                Change PIN
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Set a new 4-digit passcode
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Advanced Lock Settings */}
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelGroup}>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
                Lock When App Minimized
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Re-lock immediately when leaving app
              </Text>
            </View>
            <Switch
              value={lockOnMinimize}
              disabled={!appLockEnabled}
              onValueChange={(val) => setAppLock({ enabled: appLockEnabled, lockOnMinimize: val })}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={lockOnMinimize ? colors.primary : '#FFFFFF'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLabelGroup}>
              <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
                Hide Content in App Switcher
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Obscure screen in multitasking preview
              </Text>
            </View>
            <Switch
              value={hideContentInSwitcher}
              disabled={!appLockEnabled}
              onValueChange={(val) => setAppLock({ enabled: appLockEnabled, hideContentInSwitcher: val })}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={hideContentInSwitcher ? colors.primary : '#FFFFFF'}
            />
          </View>
        </Card>

        {/* Change PIN Modal */}
        <BottomSheetModal
          visible={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          title="Set 4-Digit PIN"
        >
          <View style={{ paddingTop: 8 }}>
            <Text style={[typography.body, { color: colors.textSecondary, marginBottom: 14 }]}>
              Enter a 4-digit PIN to secure GrowPro:
            </Text>

            <View style={styles.dotsRow}>
              {[0, 1, 2, 3].map((idx) => (
                <View
                  key={idx}
                  style={[
                    styles.pinCircle,
                    {
                      borderColor: newPin.length > idx ? colors.primary : colors.border,
                      backgroundColor: newPin.length > idx ? colors.primary : 'transparent',
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.keypadRow}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k, i) => {
                if (!k) return <View key={i} style={styles.numKey} />;
                if (k === 'del') {
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setNewPin(newPin.slice(0, -1))}
                      style={styles.numKey}
                    >
                      <Ionicons name="backspace-outline" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => newPin.length < 4 && setNewPin(newPin + k)}
                    style={styles.numKey}
                  >
                    <Text style={[typography.h1, { color: colors.textPrimary }]}>{k}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="Confirm PIN"
              onPress={handleSavePin}
              disabled={newPin.length !== 4}
              variant="primary"
              size="lg"
              style={{ marginTop: 16 }}
            />
          </View>
        </BottomSheetModal>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollPadding: {
    paddingBottom: 100,
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
  statusCard: {
    padding: 16,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    padding: 16,
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLabelGroup: {
    flex: 1,
    marginRight: 10,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 14,
  },
  pinCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  keypadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 260,
    alignSelf: 'center',
  },
  numKey: {
    width: 68,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
});

