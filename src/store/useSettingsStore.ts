import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { DEFAULT_SETTINGS } from '../constants/defaults';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  isInitialized: boolean;
  hasOnboarded: boolean;
  themeMode: ThemeMode;
  profileName: string;
  profileAvatar: string | null;
  profileFocus: string;
  
  // App lock state
  appLockEnabled: boolean;
  appLockPin: string;
  useBiometrics: boolean;
  lockTimeoutMinutes: number;
  lockOnMinimize: boolean;
  hideContentInSwitcher: boolean;
  isLocked: boolean;
  
  // Notifications
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  
  // Pomodoro settings
  pomodoroWorkMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  
  // Actions
  initialize: () => Promise<void>;
  setHasOnboarded: (val: boolean) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  updateProfile: (profile: { name?: string; avatar?: string | null; focus?: string }) => Promise<void>;
  setAppLock: (settings: {
    enabled: boolean;
    pin?: string;
    useBiometrics?: boolean;
    lockTimeoutMinutes?: number;
    lockOnMinimize?: boolean;
    hideContentInSwitcher?: boolean;
  }) => Promise<void>;
  setIsLocked: (locked: boolean) => void;
  updateNotificationSettings: (enabled: boolean, time: string) => Promise<void>;
  updatePomodoroSettings: (work: number, shortBreak: number, longBreak: number) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  isInitialized: false,
  hasOnboarded: false,
  themeMode: DEFAULT_SETTINGS.themeMode,
  profileName: DEFAULT_SETTINGS.userName,
  profileAvatar: null,
  profileFocus: DEFAULT_SETTINGS.userFocus,

  appLockEnabled: false,
  appLockPin: '',
  useBiometrics: false,
  lockTimeoutMinutes: 1,
  lockOnMinimize: true,
  hideContentInSwitcher: true,
  isLocked: false,

  dailyReminderEnabled: true,
  dailyReminderTime: '08:30',

  pomodoroWorkMinutes: DEFAULT_SETTINGS.pomodoroWorkMinutes,
  pomodoroShortBreakMinutes: DEFAULT_SETTINGS.pomodoroShortBreakMinutes,
  pomodoroLongBreakMinutes: DEFAULT_SETTINGS.pomodoroLongBreakMinutes,

  initialize: async () => {
    try {
      const [
        onboarded,
        theme,
        name,
        avatar,
        focus,
        lockEnabled,
        pin,
        bio,
        timeout,
        lockMin,
        hideContent,
        reminderEnabled,
        reminderTime,
        pWork,
        pShort,
        pLong,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE_AVATAR),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE_FOCUS),
        AsyncStorage.getItem(STORAGE_KEYS.APP_LOCK_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.APP_LOCK_PIN),
        AsyncStorage.getItem(STORAGE_KEYS.APP_LOCK_BIOMETRICS),
        AsyncStorage.getItem(STORAGE_KEYS.APP_LOCK_TIMEOUT_MINUTES),
        AsyncStorage.getItem(STORAGE_KEYS.APP_LOCK_MINIMIZE),
        AsyncStorage.getItem(STORAGE_KEYS.APP_LOCK_HIDE_CONTENT),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDER_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDER_TIME),
        AsyncStorage.getItem(STORAGE_KEYS.POMODORO_WORK_MINS),
        AsyncStorage.getItem(STORAGE_KEYS.POMODORO_SHORT_BREAK_MINS),
        AsyncStorage.getItem(STORAGE_KEYS.POMODORO_LONG_BREAK_MINS),
      ]);

      const isLockEnabled = lockEnabled === 'true';

      set({
        isInitialized: true,
        hasOnboarded: onboarded === 'true',
        themeMode: (theme as ThemeMode) || DEFAULT_SETTINGS.themeMode,
        profileName: name || DEFAULT_SETTINGS.userName,
        profileAvatar: avatar || null,
        profileFocus: focus || DEFAULT_SETTINGS.userFocus,
        appLockEnabled: isLockEnabled,
        appLockPin: pin || '',
        useBiometrics: bio === 'true',
        lockTimeoutMinutes: timeout ? parseInt(timeout, 10) : 1,
        lockOnMinimize: lockMin !== 'false',
        hideContentInSwitcher: hideContent !== 'false',
        isLocked: isLockEnabled, // If app lock is enabled, lock on initial app launch
        dailyReminderEnabled: reminderEnabled !== 'false',
        dailyReminderTime: reminderTime || DEFAULT_SETTINGS.dailyReminderTime,
        pomodoroWorkMinutes: pWork ? parseInt(pWork, 10) : 25,
        pomodoroShortBreakMinutes: pShort ? parseInt(pShort, 10) : 5,
        pomodoroLongBreakMinutes: pLong ? parseInt(pLong, 10) : 15,
      });
    } catch {
      set({ isInitialized: true });
    }
  },

  setHasOnboarded: async (val: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, String(val));
    set({ hasOnboarded: val });
  },

  setThemeMode: async (mode: ThemeMode) => {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    set({ themeMode: mode });
  },

  updateProfile: async ({ name, avatar, focus }) => {
    const updates: Partial<SettingsState> = {};
    if (name !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_NAME, name);
      updates.profileName = name;
    }
    if (avatar !== undefined) {
      if (avatar) {
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_AVATAR, avatar);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE_AVATAR);
      }
      updates.profileAvatar = avatar;
    }
    if (focus !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_FOCUS, focus);
      updates.profileFocus = focus;
    }
    set(updates);
  },

  setAppLock: async (settings) => {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_LOCK_ENABLED, String(settings.enabled));
    if (settings.pin !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_LOCK_PIN, settings.pin);
    }
    if (settings.useBiometrics !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_LOCK_BIOMETRICS, String(settings.useBiometrics));
    }
    if (settings.lockTimeoutMinutes !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_LOCK_TIMEOUT_MINUTES, String(settings.lockTimeoutMinutes));
    }
    if (settings.lockOnMinimize !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_LOCK_MINIMIZE, String(settings.lockOnMinimize));
    }
    if (settings.hideContentInSwitcher !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_LOCK_HIDE_CONTENT, String(settings.hideContentInSwitcher));
    }

    set((state) => ({
      appLockEnabled: settings.enabled,
      appLockPin: settings.pin !== undefined ? settings.pin : state.appLockPin,
      useBiometrics: settings.useBiometrics !== undefined ? settings.useBiometrics : state.useBiometrics,
      lockTimeoutMinutes: settings.lockTimeoutMinutes !== undefined ? settings.lockTimeoutMinutes : state.lockTimeoutMinutes,
      lockOnMinimize: settings.lockOnMinimize !== undefined ? settings.lockOnMinimize : state.lockOnMinimize,
      hideContentInSwitcher: settings.hideContentInSwitcher !== undefined ? settings.hideContentInSwitcher : state.hideContentInSwitcher,
    }));
  },

  setIsLocked: (locked: boolean) => {
    set({ isLocked: locked });
  },

  updateNotificationSettings: async (enabled, time) => {
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_REMINDER_ENABLED, String(enabled));
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_REMINDER_TIME, time);
    set({ dailyReminderEnabled: enabled, dailyReminderTime: time });
  },

  updatePomodoroSettings: async (work, shortBreak, longBreak) => {
    await AsyncStorage.setItem(STORAGE_KEYS.POMODORO_WORK_MINS, String(work));
    await AsyncStorage.setItem(STORAGE_KEYS.POMODORO_SHORT_BREAK_MINS, String(shortBreak));
    await AsyncStorage.setItem(STORAGE_KEYS.POMODORO_LONG_BREAK_MINS, String(longBreak));
    set({
      pomodoroWorkMinutes: work,
      pomodoroShortBreakMinutes: shortBreak,
      pomodoroLongBreakMinutes: longBreak,
    });
  },
}));
