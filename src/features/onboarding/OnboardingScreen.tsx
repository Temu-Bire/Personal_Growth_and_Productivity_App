import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { FOCUS_CATEGORIES } from '../../constants/defaults';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ONBOARDING_SLIDES } from './slides';

interface Props {
  navigation: any;
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, typography, radius } = useTheme();
  const { updateProfile, setAppLock, setHasOnboarded, setIsLocked } = useSettingsStore();

  const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2 = slides, 3 = profile, 4 = lock pin

  // Profile Form
  const [name, setName] = useState('Temesgen');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<string>('Study');

  // Lock Form
  const [pin, setPin] = useState('');
  const [useBiometrics, setUseBiometrics] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch {
      // Permission or picker failure
    }
  };

  const handleNextSlide = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(3); // Go to Profile Setup
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your display name.');
      return;
    }
    await updateProfile({
      name: name.trim(),
      avatar: avatarUri,
      focus: selectedFocus,
    });
    setCurrentStep(4); // Go to App Lock setup
  };

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
    }
  };

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleFinishWithLock = async () => {
    if (pin.length === 4) {
      await setAppLock({
        enabled: true,
        pin,
        useBiometrics,
      });
      setIsLocked(false);
    }
    await setHasOnboarded(true);
    navigation.replace('MainApp');
  };

  const handleSkipLock = async () => {
    await setAppLock({
      enabled: false,
      pin: '',
      useBiometrics: false,
    });
    setIsLocked(false);
    await setHasOnboarded(true);
    navigation.replace('MainApp');
  };

  // Render Slides (0, 1, 2)
  if (currentStep <= 2) {
    const slide = ONBOARDING_SLIDES[currentStep];

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => setCurrentStep(3)}
            style={styles.skipBtn}
            accessibilityRole="button"
          >
            <Text style={[typography.bodyMedium, { color: colors.textMuted }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.slideCenter}>
          <View
            style={[
              styles.illustrationCard,
              { backgroundColor: slide.cardBg, borderRadius: radius.xxl },
            ]}
          >
            <View style={[styles.iconBadge, { backgroundColor: slide.badgeBg }]}>
              <Ionicons name={slide.icon as any} size={48} color={slide.iconColor} />
            </View>
          </View>

          <Text style={[styles.slideTitle, typography.h1, { color: colors.textPrimary }]}>
            {slide.title}
          </Text>
          <Text style={[styles.slideDesc, typography.body, { color: colors.textSecondary }]}>
            {slide.description}
          </Text>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {ONBOARDING_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === currentStep ? colors.primary : colors.border,
                    width: i === currentStep ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Button
            title={currentStep === 2 ? 'Get Started' : 'Next →'}
            onPress={handleNextSlide}
            variant="primary"
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Render Step 3: Profile Setup
  if (currentStep === 3) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.profileHeader}>
          <View style={[styles.profileIconBadge, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.profileTitle, typography.h1, { color: colors.textPrimary }]}>
            Set up your profile
          </Text>
          <Text style={[styles.profileSub, typography.body, { color: colors.textSecondary }]}>
            Stored only on this device.{'\n'}No account needed.
          </Text>
        </View>

        <View style={styles.profileBody}>
          {/* Avatar Picker */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickAvatar}
            style={styles.avatarPickWrapper}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
            ) : (
              <View style={[styles.avatarEmpty, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
                <View style={[styles.plusBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </View>
              </View>
            )}
            <Text style={[styles.addPhotoText, typography.caption, { color: colors.textMuted }]}>
              Add photo (optional)
            </Text>
          </TouchableOpacity>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Your Name
            </Text>
            <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                style={[styles.textInput, typography.body, { color: colors.textPrimary }]}
              />
            </View>
          </View>

          {/* Main Focus Pills */}
          <View style={styles.focusGroup}>
            <Text style={[styles.inputLabel, typography.captionBold, { color: colors.textSecondary }]}>
              Your main focus:
            </Text>
            <View style={styles.pillsRow}>
              {FOCUS_CATEGORIES.map((cat) => {
                const isSelected = selectedFocus === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.7}
                    onPress={() => setSelectedFocus(cat)}
                    style={[
                      styles.focusPill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.inputBg,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.captionBold,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Button title="Continue" onPress={handleSaveProfile} variant="primary" size="lg" />
          <Text style={[styles.lockHint, typography.caption, { color: colors.textMuted }]}>
            Next: protect your data with App Lock
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render Step 4: Create PIN / App Lock
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.lockHeader}>
        <View style={[styles.lockIconBadge, { backgroundColor: '#EDE9FE' }]}>
          <Ionicons name="lock-closed" size={32} color="#6D4AFF" />
        </View>
        <Text style={[styles.profileTitle, typography.h1, { color: colors.textPrimary }]}>
          Create a PIN
        </Text>
        <Text style={[styles.profileSub, typography.body, { color: colors.textSecondary }]}>
          Lock GrowPro with a 4-digit PIN.{'\n'}Nobody else can open your data.
        </Text>
      </View>

      {/* PIN Dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((idx) => {
          const filled = pin.length > idx;
          return (
            <View
              key={idx}
              style={[
                styles.pinDot,
                {
                  borderColor: filled ? colors.primary : colors.border,
                  backgroundColor: filled ? colors.primary : 'transparent',
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
                onPress={handlePinBackspace}
                style={styles.keyBtn}
              >
                <Ionicons name="backspace-outline" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              onPress={() => handlePinPress(key)}
              style={styles.keyBtn}
            >
              <Text style={[typography.h1, { color: colors.textPrimary }]}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Biometrics Switch */}
      <View style={[styles.bioRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="finger-print" size={24} color={colors.primary} style={{ marginRight: 12 }} />
        <Text style={[typography.bodyMedium, { color: colors.textPrimary, flex: 1 }]}>
          Use biometrics
        </Text>
        <Switch
          value={useBiometrics}
          onValueChange={setUseBiometrics}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={useBiometrics ? colors.primary : '#FFFFFF'}
        />
      </View>

      {/* Footer */}
      <View style={styles.lockFooter}>
        {pin.length === 4 ? (
          <Button
            title="Set PIN & Finish"
            onPress={handleFinishWithLock}
            variant="primary"
            size="lg"
          />
        ) : (
          <TouchableOpacity onPress={handleSkipLock} style={styles.skipLockBtn}>
            <Text style={[typography.bodyMedium, { color: colors.textMuted }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  topBar: {
    alignItems: 'flex-end',
    height: 44,
    justifyContent: 'center',
  },
  skipBtn: {
    padding: 8,
  },
  slideCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  illustrationCard: {
    width: '100%',
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '700',
  },
  slideDesc: {
    textAlign: 'center',
    maxWidth: 290,
    marginBottom: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomBar: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  profileIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  profileTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  profileSub: {
    textAlign: 'center',
    marginTop: 6,
  },
  profileBody: {
    marginTop: 20,
  },
  avatarPickWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPreview: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#27272A',
  },
  avatarEmpty: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
  },
  focusGroup: {
    marginBottom: 20,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  focusPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  lockHint: {
    marginTop: 4,
  },
  lockHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  lockIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 280,
    alignSelf: 'center',
  },
  keyBtn: {
    width: 74,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  keyEmpty: {
    width: 74,
    height: 58,
    margin: 4,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  lockFooter: {
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
  },
  skipLockBtn: {
    padding: 10,
  },
});

