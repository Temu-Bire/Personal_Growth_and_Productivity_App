import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Habits: undefined;
  Stats: undefined;
  More: undefined;
};

export type DrawerParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  DashboardScreen: undefined;
  GoalsScreen: undefined;
  HabitsScreen: undefined;
  StudyScreen: undefined;
  ProjectsScreen: undefined;
  JournalScreen: undefined;
  TradingScreen: undefined;
  AnalyticsScreen: undefined;
  SettingsScreen: undefined;
  HelpScreen: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainApp: NavigatorScreenParams<DrawerParamList> | undefined;
  LockScreen: undefined;
  Tasks: { openAdd?: boolean } | undefined;
  FocusTimerScreen: undefined;
  AppLockSettingsScreen: undefined;
  DataBackupScreen: undefined;
  WeeklyReviewScreen: undefined;
  SkillsScreen: undefined;
};
