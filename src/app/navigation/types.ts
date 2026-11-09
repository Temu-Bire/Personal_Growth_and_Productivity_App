import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Habits: undefined;
  Tasks: { openAdd?: boolean } | undefined;
  Calendar: undefined;
  More: undefined;
};

export type DrawerParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  DashboardScreen: undefined;
  HabitsScreen: undefined;
  TasksScreen: { openAdd?: boolean } | undefined;
  CalendarScreen: undefined;
  MoreScreen: undefined;
  GoalsScreen: undefined;
  ProjectsScreen: undefined;
  JournalScreen: undefined;
  AnalyticsScreen: undefined;
  ReportsScreen: undefined;
  CoachScreen: undefined;
  SettingsScreen: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainApp: NavigatorScreenParams<DrawerParamList> | undefined;
  LockScreen: undefined;
  GoalsScreen: undefined;
  ProjectsScreen: undefined;
  JournalScreen: undefined;
  AnalyticsScreen: undefined;
  ReportsScreen: undefined;
  CoachScreen: undefined;
  SettingsScreen: undefined;
  AppearanceSettingsScreen: undefined;
  NavigationSettingsScreen: undefined;
  CategoriesSettingsScreen: undefined;
  DashboardSettingsScreen: undefined;
  FormBuilderSettingsScreen: undefined;
  LayoutSettingsScreen: undefined;
  GeneralPreferencesScreen: undefined;
  AppLockSettingsScreen: undefined;
  DataBackupScreen: undefined;
};
