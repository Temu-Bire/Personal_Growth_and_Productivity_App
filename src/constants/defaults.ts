export const DEFAULT_SETTINGS = {
  themeMode: 'dark' as 'light' | 'dark' | 'system',
  userName: 'Temesgen Birhenu',
  userFocus: 'Personal Growth',
  appLockEnabled: false,
  appLockPin: '',
  useBiometrics: false,
  lockTimeoutMinutes: 1,
  lockOnMinimize: true,
  hideContentInSwitcher: true,
  dailyReminderEnabled: true,
  dailyReminderTime: '08:00 AM',
  pomodoroWorkMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
};

export const FOCUS_CATEGORIES = ['Health', 'Career', 'Finance', 'Learning', 'Faith', 'Personal'] as const;
