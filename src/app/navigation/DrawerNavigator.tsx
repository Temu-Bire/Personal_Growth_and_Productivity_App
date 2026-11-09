import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TabNavigator } from './TabNavigator';
import { DrawerContent } from '../../components/layout/DrawerContent';
import { GoalsScreen } from '../../features/goals/screens/GoalsScreen';
import { TasksScreen } from '../../features/tasks/screens/TasksScreen';
import { HabitsScreen } from '../../features/habits/screens/HabitsScreen';
import { ProjectsScreen } from '../../features/projects/screens/ProjectsScreen';
import { JournalScreen } from '../../features/journal/screens/JournalScreen';
import { AnalyticsScreen } from '../../features/analytics/screens/AnalyticsScreen';
import { ReportsScreen } from '../../features/reports/screens/ReportsScreen';
import { CoachScreen } from '../../features/coach/screens/CoachScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
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
          backgroundColor: '#121215',
        },
      }}
    >
      <Drawer.Screen name="DashboardScreen" component={TabNavigator} />
      <Drawer.Screen name="HabitsScreen" component={HabitsScreen} />
      <Drawer.Screen name="TasksScreen" component={TasksScreen} />
      <Drawer.Screen name="GoalsScreen" component={GoalsScreen} />
      <Drawer.Screen name="ProjectsScreen" component={ProjectsScreen} />
      <Drawer.Screen name="JournalScreen" component={JournalScreen} />
      <Drawer.Screen name="AnalyticsScreen" component={AnalyticsScreen} />
      <Drawer.Screen name="ReportsScreen" component={ReportsScreen} />
      <Drawer.Screen name="CoachScreen" component={CoachScreen} />
      <Drawer.Screen name="SettingsScreen" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};
