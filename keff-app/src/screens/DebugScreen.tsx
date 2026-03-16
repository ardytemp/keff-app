import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Divider, useTheme } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { db } from '../database';

const tables = ['expenses', 'contacts', 'transactions', 'savings', 'budgets', 'invoices'];

export default function DebugScreen() {
  const [stats, setStats] = useState<{ [key: string]: number }>({});
  const [lastError, setLastError] = useState<string>('None');
  const theme = useTheme();

  const loadStats = () => {
    const s: { [k: string]: number } = {};
    db.transaction((tx) => {
      tables.forEach((table) => {
        tx.executeSql(`SELECT COUNT(*) as count FROM ${table}`, [], (_, { rows }) => {
          s[table] = rows.item(0).count;
          if (Object.keys(s).length === tables.length) {
            setStats({ ...s });
          }
        });
      });
    });
  };

  const clearAllData = () => {
    Alert.alert('Confirm', 'Delete all data? This cannot be undone.', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: () => {
          db.transaction((tx) => {
            tables.forEach((table) => {
              tx.executeSql(`DELETE FROM ${table}`);
            });
          });
          loadStats();
        },
      },
    ]);
  };

  const exportLogs = async () => {
    const logs = `Stats: ${JSON.stringify(stats, null, 2)}\nLast Error: ${lastError}`;
    Alert.alert('Logs', logs);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.title}>Debug Screen</Text>
      <Divider />
      <Text style={styles.section}>Database Stats</Text>
      {tables.map((t) => (
        <Text key={t} style={styles.row}>
          {t}: {stats[t] ?? '...'}
        </Text>
      ))}
      <Divider />
      <Text style={styles.section}>Last Error</Text>
      <Text style={styles.error}>{lastError}</Text>
      <Divider />
      <Button mode="contained" onPress={loadStats} style={styles.btn}>
        Refresh Stats
      </Button>
      <Button mode="outlined" onPress={clearAllData} style={styles.btn} buttonColor="#ffcccc">
        Clear All Data
      </Button>
      <Button mode="text" onPress={exportLogs} style={styles.btn}>
        Export Logs
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, marginBottom: 12, fontWeight: 'bold' },
  section: { fontSize: 18, marginTop: 12, marginBottom: 6 },
  row: { fontSize: 16, paddingVertical: 4 },
  error: { color: 'red', marginBottom: 12 },
  btn: { marginTop: 8 },
});
