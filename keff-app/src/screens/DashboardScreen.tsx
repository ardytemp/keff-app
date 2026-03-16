import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';
import { db } from '../database';

export default function DashboardScreen() {
  const [stats, setStats] = React.useState({ totalExpenses: 0, totalIncome: 0, contactCount: 0 });

  useFocusEffect(
    React.useCallback(() => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT SUM(amount) as total FROM expenses',
          [],
          (_, { rows }) => {
            const totalExp = rows.item(0).total || 0;
            setStats((s) => ({ ...s, totalExpenses: totalExp }));
          }
        );
        tx.executeSql(
          'SELECT SUM(amount) as total FROM transactions WHERE type = "income"',
          [],
          (_, { rows }) => {
            const totalInc = rows.item(0).total || 0;
            setStats((s) => ({ ...s, totalIncome: totalInc }));
          }
        );
        tx.executeSql(
          'SELECT COUNT(*) as count FROM contacts',
          [],
          (_, { rows }) => {
            setStats((s) => ({ ...s, contactCount: rows.item(0).count }));
          }
        );
      });
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Keff Dashboard</Text>
      <Text>Total Expenses: {stats.totalExpenses.toFixed(2)}</Text>
      <Text>Total Income: {stats.totalIncome.toFixed(2)}</Text>
      <Text>Contacts: {stats.contactCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
