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
import { AppLockSettingsScreen } from '../../features/settings/screens/AppLockSettingsScreen';
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

      {/* Dayvane Fullscreen / Modal Routes */}
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
      <Stack.Screen
        name="AppLockSettingsScreen"
        component={AppLockSettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};
