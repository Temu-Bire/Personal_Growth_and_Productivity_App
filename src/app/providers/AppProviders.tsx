import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DatabaseProvider } from './DatabaseProvider';
import { ThemeProvider } from './ThemeProvider';
import { useSettingsStore } from '../../store/useSettingsStore';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isInitialized, initialize } = useSettingsStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E8E4E" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    backgroundColor: '#0F4D2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
