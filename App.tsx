import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { navigationRef } from './src/app/navigation/navigationRef';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useTheme } from './src/hooks/useTheme';

function AppContent() {
  const { isDark } = useTheme();
  const { appLockEnabled, lockOnMinimize, isLocked, setIsLocked } = useSettingsStore();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        if (appLockEnabled && lockOnMinimize) {
          setIsLocked(true);
        }
      } else if (nextAppState === 'active') {
        if (appLockEnabled && isLocked) {
          if (navigationRef.isReady() && navigationRef.getCurrentRoute()?.name !== 'LockScreen') {
            navigationRef.navigate('LockScreen');
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appLockEnabled, lockOnMinimize, isLocked, setIsLocked]);

  return (
    <NavigationContainer ref={navigationRef}>
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

