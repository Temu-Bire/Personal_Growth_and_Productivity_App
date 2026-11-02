import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ProgressRing } from '../../../components/ui/ProgressRing';
import { useTimer, TimerMode } from '../hooks/useTimer';
import { formatDurationSeconds } from '../../../utils/format';
import { useTheme } from '../../../hooks/useTheme';
import { useSettingsStore } from '../../../store/useSettingsStore';

export const FocusTimerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { typography } = useTheme();
  const { pomodoroWorkMinutes, pomodoroShortBreakMinutes, pomodoroLongBreakMinutes } = useSettingsStore();

  const {
    mode,
    isRunning,
    secondsRemaining,
    progressPercent,
    start,
    pause,
    reset,
    switchMode,
  } = useTimer({
    workMinutes: pomodoroWorkMinutes,
    shortBreakMinutes: pomodoroShortBreakMinutes,
    longBreakMinutes: pomodoroLongBreakMinutes,
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color="#A7F3D0" />
        </TouchableOpacity>

        <View style={styles.leafIconBadge}>
          <Ionicons name="leaf" size={26} color="#A7F3D0" />
        </View>

        <TouchableOpacity
          onPress={reset}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Reset"
        >
          <Ionicons name="refresh" size={22} color="#A7F3D0" />
        </TouchableOpacity>
      </View>

      {/* Center Circular Countdown */}
      <View style={styles.centerSection}>
        <ProgressRing
          size={260}
          strokeWidth={14}
          progress={progressPercent}
          color="#34A863"
          trackColor="rgba(255, 255, 255, 0.12)"
        >
          <View style={styles.ringCenter}>
            <Text style={[styles.timeDigits, typography.hero]}>
              {formatDurationSeconds(secondsRemaining)}
            </Text>
            <Text style={[styles.modeLabel, typography.bodyMedium]}>
              {mode === 'pomodoro' ? 'Focus' : mode === 'short_break' ? 'Short Break' : 'Long Break'}
            </Text>
          </View>
        </ProgressRing>

        {/* Play/Pause Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={isRunning ? pause : start}
          style={styles.playBtn}
          accessibilityRole="button"
          accessibilityLabel={isRunning ? 'Pause' : 'Start'}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={36}
            color="#0F4D2E"
            style={{ marginLeft: isRunning ? 0 : 4 }}
          />
        </TouchableOpacity>

        {/* Mode Selector Pills */}
        <View style={styles.pillsContainer}>
          {[
            { key: 'pomodoro' as TimerMode, label: 'Pomodoro' },
            { key: 'short_break' as TimerMode, label: 'Short Break' },
            { key: 'long_break' as TimerMode, label: 'Long Break' },
          ].map((item) => {
            const isActive = mode === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => switchMode(item.key)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isActive ? 'rgba(52, 168, 99, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    borderColor: isActive ? '#34A863' : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    typography.captionBold,
                    { color: isActive ? '#A7F3D0' : '#D1D5DB' },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Footer message */}
      <View style={styles.footer}>
        <Text style={[styles.stayFocused, typography.bodyBold]}>
          Stay Focused! 🧘
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F4D2E',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  ringCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigits: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  modeLabel: {
    color: '#A7F3D0',
    marginTop: 6,
    fontWeight: '500',
  },
  playBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  stayFocused: {
    color: '#A7F3D0',
    fontSize: 16,
  },
});
