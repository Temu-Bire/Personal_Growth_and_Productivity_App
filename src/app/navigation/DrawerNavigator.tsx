import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TabNavigator } from './TabNavigator';
import { DrawerContent } from '../../components/layout/DrawerContent';
import { GoalsScreen } from '../../features/goals/screens/GoalsScreen';
import { HabitsScreen } from '../../features/habits/screens/HabitsScreen';
import { StudyScreen } from '../../features/study/screens/StudyScreen';
import { ProjectsScreen } from '../../features/projects/screens/ProjectsScreen';
import { JournalScreen } from '../../features/journal/screens/JournalScreen';
import { TradingScreen } from '../../features/trading/screens/TradingScreen';
import { AnalyticsScreen } from '../../features/analytics/screens/AnalyticsScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { HelpScreen } from '../../features/help/screens/HelpScreen';
import { DrawerParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          width: 280,
          backgroundColor: '#0F4D2E',
        },
      }}
    >
      <Drawer.Screen name="DashboardScreen" component={TabNavigator} />
      <Drawer.Screen name="GoalsScreen" component={GoalsScreen} />
      <Drawer.Screen name="HabitsScreen" component={HabitsScreen} />
      <Drawer.Screen name="StudyScreen" component={StudyScreen} />
      <Drawer.Screen name="ProjectsScreen" component={ProjectsScreen} />
      <Drawer.Screen name="JournalScreen" component={JournalScreen} />
      <Drawer.Screen name="TradingScreen" component={TradingScreen} />
      <Drawer.Screen name="AnalyticsScreen" component={AnalyticsScreen} />
      <Drawer.Screen name="SettingsScreen" component={SettingsScreen} />
      <Drawer.Screen name="HelpScreen" component={HelpScreen} />
    </Drawer.Navigator>
  );
};

