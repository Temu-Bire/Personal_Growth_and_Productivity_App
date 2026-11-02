import { useState, useEffect, useRef, useCallback } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { FocusRepository } from '../focus.repository';
import { NotificationsService } from '../../settings/notifications.service';

export type TimerMode = 'pomodoro' | 'short_break' | 'long_break';

interface UseTimerProps {
  workMinutes?: number;
  shortBreakMinutes?: number;
  longBreakMinutes?: number;
  category?: string;
  onSessionComplete?: () => void;
}

export function useTimer({
  workMinutes = 25,
  shortBreakMinutes = 5,
  longBreakMinutes = 15,
  category = 'Study',
  onSessionComplete,
}: UseTimerProps = {}) {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);

  const getTargetSeconds = useCallback((m: TimerMode) => {
    switch (m) {
      case 'short_break':
        return shortBreakMinutes * 60;
      case 'long_break':
        return longBreakMinutes * 60;
      case 'pomodoro':
      default:
        return workMinutes * 60;
    }
  }, [workMinutes, shortBreakMinutes, longBreakMinutes]);

  const [totalSeconds, setTotalSeconds] = useState(getTargetSeconds('pomodoro'));
  const [secondsRemaining, setSecondsRemaining] = useState(getTargetSeconds('pomodoro'));

  const startTimeRef = useRef<number | null>(null);
  const endTimestampRef = useRef<number | null>(null);
  const intervalRef = useRef<any>(null);

  // When timer finishes
  const handleComplete = useCallback(async () => {
    setIsRunning(false);
    try {
      await deactivateKeepAwake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // safe
    }

    if (startTimeRef.current) {
      const now = Date.now();
      FocusRepository.logSession({
        type: mode,
        durationMinutes: Math.round(totalSeconds / 60),
        completedSeconds: totalSeconds,
        startTimestamp: new Date(startTimeRef.current).toISOString(),
        endTimestamp: new Date(now).toISOString(),
        category,
      });
    }

    NotificationsService.notifyTimerComplete(mode);
    onSessionComplete?.();
  }, [mode, totalSeconds, category, onSessionComplete]);

  // Main tick loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (!endTimestampRef.current) return;
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.round((endTimestampRef.current - now) / 1000));
        setSecondsRemaining(diffSeconds);

        if (diffSeconds <= 0) {
          clearInterval(intervalRef.current);
          handleComplete();
        }
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleComplete]);

  const start = async () => {
    const target = secondsRemaining > 0 ? secondsRemaining : totalSeconds;
    startTimeRef.current = Date.now() - (totalSeconds - target) * 1000;
    endTimestampRef.current = Date.now() + target * 1000;
    setIsRunning(true);
    try {
      await activateKeepAwakeAsync();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // safe
    }
  };

  const pause = async () => {
    setIsRunning(false);
    try {
      await deactivateKeepAwake();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // safe
    }
  };

  const reset = async () => {
    setIsRunning(false);
    try {
      await deactivateKeepAwake();
    } catch {
      // safe
    }
    const t = getTargetSeconds(mode);
    setTotalSeconds(t);
    setSecondsRemaining(t);
    startTimeRef.current = null;
    endTimestampRef.current = null;
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    try {
      deactivateKeepAwake();
    } catch {
      // safe
    }
    setMode(newMode);
    const t = getTargetSeconds(newMode);
    setTotalSeconds(t);
    setSecondsRemaining(t);
    startTimeRef.current = null;
    endTimestampRef.current = null;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;

  return {
    mode,
    isRunning,
    secondsRemaining,
    totalSeconds,
    progressPercent,
    start,
    pause,
    reset,
    switchMode,
  };
}
