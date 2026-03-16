import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { View, Text, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database';

export default function App() {
  const [error, setError] = useState<Error | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    setLogs((l) => [...l, msg]);
    console.log(msg);
  };

  useEffect(() => {
    try {
      log('Init start');
      initDatabase();
      log('DB initialized');
    } catch (e: any) {
      log('DB error: ' + e.message);
      setError(e);
    }
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>App crashed</Text>
        <Text>{error.message}</Text>
        {logs.map((l, i) => (
          <Text key={i}>{l}</Text>
        ))}
      </View>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', fontSize: 18, marginBottom: 10 },
});
