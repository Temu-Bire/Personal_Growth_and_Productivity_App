import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getDatabase } from '../../db/client';
import { seedDevData } from '../../db/seed';

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      getDatabase();
      seedDevData();
      setIsReady(true);
    } catch (e) {
      console.error('Failed to init SQLite DB:', e);
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E8E4E" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#0F4D2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

