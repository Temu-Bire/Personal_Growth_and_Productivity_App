import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useTheme } from './src/hooks/useTheme';

function AppContent() {
  const { isDark } = useTheme();
  const { appLockEnabled, lockOnMinimize, setIsLocked } = useSettingsStore();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        if (appLockEnabled && lockOnMinimize) {
          setIsLocked(true);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appLockEnabled, lockOnMinimize, setIsLocked]);

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

