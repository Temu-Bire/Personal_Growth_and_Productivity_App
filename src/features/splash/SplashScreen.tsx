import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { RootStackParamList } from '../../app/navigation/types';
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
    // If already onboarded, automatically navigate after a short pause
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
      {/* Mountain Landscape Graphic at top */}
      <View style={styles.mountainContainer}>
        <Svg width={width} height={180} viewBox="0 0 375 180">
          {/* Background mountain */}
          <Path
            d="M -20 180 L 120 40 L 220 180 Z"
            fill="#124027"
            opacity={0.6}
          />
          {/* Middle mountain */}
          <Path
            d="M 130 180 L 250 20 L 390 180 Z"
            fill="#165131"
            opacity={0.8}
          />
          {/* Sun / Moon circle */}
          <Path
            d="M 187 65 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0"
            fill="#A7F3D0"
            opacity={0.3}
          />
          {/* Foreground mountain ridge */}
          <Path
            d="M 0 180 Q 90 120 190 150 T 375 130 L 375 180 Z"
            fill="#0F4D2E"
          />
        </Svg>
      </View>

      {/* Center Branding */}
      <View style={styles.centerContent}>
        <View style={styles.logoBadge}>
          <Ionicons name="leaf" size={44} color="#A7F3D0" />
        </View>

        <Text style={[styles.brandTitle, typography.hero]}>GrowPro</Text>
        <Text style={[styles.tagline, typography.h3]}>Plan · Focus · Achieve</Text>

        <Text style={[styles.subTagline, typography.body]}>
          Invest in yourself, build a better future
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
    backgroundColor: '#0A321D',
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
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#165131',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.3)',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 34,
    letterSpacing: -0.5,
  },
  tagline: {
    color: '#A7F3D0',
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  subTagline: {
    color: '#9CA3AF',
    marginTop: 14,
    textAlign: 'center',
    maxWidth: 240,
  },
  footer: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#1E8E4E',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 16,
  },
});
