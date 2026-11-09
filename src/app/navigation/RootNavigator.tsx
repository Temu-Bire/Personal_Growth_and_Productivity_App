import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../../features/splash/SplashScreen';
import { OnboardingScreen } from '../../features/onboarding/OnboardingScreen';
import { LockScreen } from '../../features/settings/LockScreen';
import { DrawerNavigator } from './DrawerNavigator';
import { GoalsScreen } from '../../features/goals/screens/GoalsScreen';
import { ProjectsScreen } from '../../features/projects/screens/ProjectsScreen';
import { JournalScreen } from '../../features/journal/screens/JournalScreen';
import { AnalyticsScreen } from '../../features/analytics/screens/AnalyticsScreen';
import { ReportsScreen } from '../../features/reports/screens/ReportsScreen';
import { CoachScreen } from '../../features/coach/screens/CoachScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { TasksScreen } from '../../features/tasks/screens/TasksScreen';
import { AppLockSettingsScreen } from '../../features/settings/screens/AppLockSettingsScreen';
import { DataBackupScreen } from '../../features/settings/screens/DataBackupScreen';
import { AppearanceSettingsScreen } from '../../features/settings/screens/AppearanceSettingsScreen';
import { NavigationSettingsScreen } from '../../features/settings/screens/NavigationSettingsScreen';
import { CategoriesSettingsScreen } from '../../features/settings/screens/CategoriesSettingsScreen';
import { DashboardSettingsScreen } from '../../features/settings/screens/DashboardSettingsScreen';
import { FormBuilderSettingsScreen } from '../../features/settings/screens/FormBuilderSettingsScreen';
import { LayoutSettingsScreen } from '../../features/settings/screens/LayoutSettingsScreen';
import { GeneralPreferencesScreen } from '../../features/settings/screens/GeneralPreferencesScreen';

import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="LockScreen" component={LockScreen} />
      <Stack.Screen name="MainApp" component={DrawerNavigator} />

      {/* Dayvane Fullscreen / Modal Routes from More menu */}
      <Stack.Screen
        name="GoalsScreen"
        component={GoalsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ProjectsScreen"
        component={ProjectsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="JournalScreen"
        component={JournalScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AnalyticsScreen"
        component={AnalyticsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ReportsScreen"
        component={ReportsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CoachScreen"
        component={CoachScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* Settings Sub-screens */}
      <Stack.Screen
        name="AppearanceSettingsScreen"
        component={AppearanceSettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="NavigationSettingsScreen"
        component={NavigationSettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CategoriesSettingsScreen"
        component={CategoriesSettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="DashboardSettingsScreen"
        component={DashboardSettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="FormBuilderSettingsScreen"
        component={FormBuilderSettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="LayoutSettingsScreen"
        component={LayoutSettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GeneralPreferencesScreen"
        component={GeneralPreferencesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AppLockSettingsScreen"
        component={AppLockSettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="DataBackupScreen"
        component={DataBackupScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};
