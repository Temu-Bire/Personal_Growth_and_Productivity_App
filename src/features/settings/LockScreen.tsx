import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTheme } from '../../hooks/useTheme';
import { AppLockService } from './appLock.service';

interface Props {
  navigation: any;
}

export const LockScreen: React.FC<Props> = ({ navigation }) => {
  const { profileName, appLockPin, useBiometrics, setIsLocked, setAppLock } = useSettingsStore();
  const { typography } = useTheme();

  const [enteredPin, setEnteredPin] = useState('');
  const [hasError, setHasError] = useState(false);

  const effectivePin = appLockPin || '0000';

  const handleUnlockSuccess = useCallback(() => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // safe
    }
    setIsLocked(false);
    navigation.replace('MainApp');
  }, [navigation, setIsLocked]);

  // Try biometric authentication on mount if enabled
  useEffect(() => {
    if (useBiometrics) {
      AppLockService.authenticateBiometrics('Unlock GrowPro').then((success) => {
        if (success) {
          handleUnlockSuccess();
        }
      });
    }
  }, [useBiometrics, handleUnlockSuccess]);

  const handleKeyPress = (digit: string) => {
    if (enteredPin.length < 4) {
      const next = enteredPin + digit;
      setEnteredPin(next);
      setHasError(false);

      if (next.length === 4) {
        if (next === effectivePin) {
          handleUnlockSuccess();
        } else {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } catch {
            // safe
          }
          setHasError(true);
          setTimeout(() => {
            setEnteredPin('');
            setHasError(false);
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin(enteredPin.slice(0, -1));
    setHasError(false);
  };

  const handleBiometricsClick = async () => {
    const success = await AppLockService.authenticateBiometrics('Unlock GrowPro');
    if (success) {
      handleUnlockSuccess();
    } else {
      Alert.alert('Authentication Failed', 'Please enter your PIN.');
    }
  };

  const handleForgotPin = () => {
    Alert.alert(
      'Reset PIN',
      'Forgot your PIN? You can reset your App Lock to regain access without losing your personal data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset PIN',
          style: 'destructive',
          onPress: async () => {
            await setAppLock({ enabled: false, pin: '', useBiometrics: false });
            handleUnlockSuccess();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.lockIconCircle}>
          <Ionicons name="lock-closed" size={32} color="#A7F3D0" />
        </View>

        <Text style={[styles.welcomeTitle, typography.h1]}>
          Welcome back, {profileName || 'Temesgen'}
        </Text>
        <Text style={[styles.enterPinSub, typography.body]}>
          {hasError ? 'Incorrect PIN. Try again.' : 'Enter your PIN to unlock'}
        </Text>
      </View>

      {/* PIN Dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((idx) => {
          const filled = enteredPin.length > idx;
          return (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor: hasError
                    ? '#EF4444'
                    : filled
                    ? '#10B981'
                    : 'transparent',
                  borderColor: hasError ? '#EF4444' : '#34A863',
                },
              ]}
            />
          );
        })}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, i) => {
          if (!key) return <View key={i} style={styles.keyEmpty} />;
          if (key === 'del') {
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={handleBackspace}
                style={styles.keyBtn}
              >
                <Ionicons name="backspace-outline" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              onPress={() => handleKeyPress(key)}
              style={styles.keyBtn}
            >
              <Text style={styles.numText}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Biometrics and Recovery Actions */}
      <View style={styles.footer}>
        {useBiometrics && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBiometricsClick}
            style={styles.bioBtn}
          >
            <Ionicons name="finger-print" size={22} color="#A7F3D0" style={{ marginRight: 8 }} />
            <Text style={[typography.bodyMedium, { color: '#A7F3D0' }]}>
              Use fingerprint / Face ID
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleForgotPin}
          style={{ paddingVertical: 10, alignItems: 'center' }}
          accessibilityRole="button"
          accessibilityLabel="Forgot PIN"
        >
          <Text style={[typography.caption, { color: '#A7F3D0', opacity: 0.85 }]}>
            Forgot PIN? Tap to reset
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F4D2E',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 30,
  },
  lockIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#165131',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.3)',
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  enterPinSub: {
    color: '#A7F3D0',
    marginTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 24,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 290,
    alignSelf: 'center',
  },
  keyBtn: {
    width: 78,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  keyEmpty: {
    width: 78,
    height: 64,
    margin: 6,
  },
  numText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
});

