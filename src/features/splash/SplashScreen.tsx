import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  navigation: any;
}

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { hasOnboarded, appLockEnabled, isLocked } = useSettingsStore();
  const { typography } = useTheme();

  useEffect(() => {
    if (hasOnboarded) {
      const timer = setTimeout(() => {
        if (appLockEnabled && isLocked) {
          navigation.replace('LockScreen');
        } else {
          navigation.replace('MainApp');
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [hasOnboarded, appLockEnabled, isLocked, navigation]);

  const handleGetStarted = () => {
    if (hasOnboarded) {
      if (appLockEnabled && isLocked) {
        navigation.replace('LockScreen');
      } else {
        navigation.replace('MainApp');
      }
    } else {
      navigation.replace('Onboarding');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Graphic at top */}
      <View style={styles.mountainContainer}>
        <Svg width={width} height={180} viewBox="0 0 375 180">
          <Path
            d="M -20 180 L 120 40 L 220 180 Z"
            fill="#18181B"
            opacity={0.7}
          />
          <Path
            d="M 130 180 L 250 20 L 390 180 Z"
            fill="#121215"
            opacity={0.9}
          />
          <Path
            d="M 187 65 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0"
            fill="#FFFFFF"
            opacity={0.06}
          />
          <Path
            d="M 0 180 Q 90 120 190 150 T 375 130 L 375 180 Z"
            fill="#18181B"
          />
        </Svg>
      </View>

      {/* Center Branding */}
      <View style={styles.centerContent}>
        <View style={styles.logoBadge}>
          <Ionicons name="sparkles" size={40} color="#FFFFFF" />
        </View>

        <Text style={[styles.brandTitle, typography.hero]}>Dayvane</Text>
        <Text style={[styles.tagline, typography.h3]}>Intentional Daily Living</Text>

        <Text style={[styles.subTagline, typography.body]}>
          Your private offline companion for habits, tasks, and goals
        </Text>
      </View>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGetStarted}
          style={styles.startButton}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
        >
          <Text style={[styles.btnText, typography.button]}>Get Started</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, typography.caption]}>
          Version 1.0 · 100% offline
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 36,
  },
  mountainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  brandTitle: {
    color: '#FAFAFA',
    fontWeight: '800',
    fontSize: 34,
    letterSpacing: -0.5,
  },
  tagline: {
    color: '#A1A1AA',
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  subTagline: {
    color: '#71717A',
    marginTop: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
  footer: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#FAFAFA',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#09090B',
    fontWeight: '700',
    fontSize: 16,
  },
  versionText: {
    color: '#71717A',
    marginTop: 16,
  },
});
