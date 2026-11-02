export const DEFAULT_SETTINGS = {
  themeMode: 'system' as 'light' | 'dark' | 'system',
  userName: 'Temesgen',
  userFocus: 'Study',
  appLockEnabled: false,
  appLockPin: '',
  useBiometrics: false,
  lockTimeoutMinutes: 1,
  lockOnMinimize: true,
  hideContentInSwitcher: true,
  dailyReminderEnabled: true,
  dailyReminderTime: '08:30',
  pomodoroWorkMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
};

export const FOCUS_CATEGORIES = ['Study', 'Habits', 'Work', 'Trading'] as const;

