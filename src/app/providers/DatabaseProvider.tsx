import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { getDatabaseAsync } from '../../db/client';
import { seedInitialDataAsync } from '../../db/seed';

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const initDb = useCallback(async () => {
    try {
      setInitError(null);
      const db = await getDatabaseAsync();
      await seedInitialDataAsync(db);
      setIsReady(true);
    } catch (e: unknown) {
      console.error('Failed to initialize Dayvane offline database:', e);
      setInitError(e instanceof Error ? e.message : 'Database initialization error');
    }
  }, []);

  useEffect(() => {
    initDb();
  }, [initDb]);

  if (initError) {
    return (
      <View style={styles.errorCenter}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Offline Storage Notice</Text>
        <Text style={styles.errorDetails}>{initError}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={initDb}>
          <Text style={styles.retryBtnText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCenter: {
    flex: 1,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#FAFAFA',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetails: {
    color: '#A1A1AA',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  retryBtn: {
    backgroundColor: '#27272A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  retryBtnText: {
    color: '#FAFAFA',
    fontWeight: '600',
    fontSize: 15,
  },
});
