import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../../features/splash/SplashScreen';
import { OnboardingScreen } from '../../features/onboarding/OnboardingScreen';
import { LockScreen } from '../../features/settings/LockScreen';
import { DrawerNavigator } from './DrawerNavigator';
import { TasksScreen } from '../../features/tasks/screens/TasksScreen';
import { FocusTimerScreen } from '../../features/focus-timer/screens/FocusTimerScreen';
import { AppLockSettingsScreen } from '../../features/settings/screens/AppLockSettingsScreen';
import { DataBackupScreen } from '../../features/settings/screens/DataBackupScreen';
import { WeeklyReviewScreen } from '../../features/weekly-review/screens/WeeklyReviewScreen';
import { SkillsScreen } from '../../features/skills/screens/SkillsScreen';
import { AppearanceSettingsScreen } from '../../features/settings/screens/AppearanceSettingsScreen';
import { NavigationSettingsScreen } from '../../features/settings/screens/NavigationSettingsScreen';
import { CategoriesSettingsScreen } from '../../features/settings/screens/CategoriesSettingsScreen';
import { DashboardSettingsScreen } from '../../features/settings/screens/DashboardSettingsScreen';
import { FormBuilderSettingsScreen } from '../../features/settings/screens/FormBuilderSettingsScreen';
import { IdeasScreen } from '../../features/ideas/screens/IdeasScreen';

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

      {/* Detail / Fullscreen routes */}
      <Stack.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="FocusTimerScreen"
        component={FocusTimerScreen}
        options={{ animation: 'slide_from_bottom' }}
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
      <Stack.Screen
        name="WeeklyReviewScreen"
        component={WeeklyReviewScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SkillsScreen"
        component={SkillsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Ideas"
        component={IdeasScreen}
        options={{ animation: 'slide_from_right' }}
      />
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
    </Stack.Navigator>
  );
};
