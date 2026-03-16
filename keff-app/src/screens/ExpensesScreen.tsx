import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { db } from '../database';
import { exportToCSV, importFromCSV } from '../utils/csv';

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      db.withTransactionSync((tx) => {
        tx.executeSql('SELECT * FROM expenses ORDER BY date DESC', [], (_, { rows }) => {
          setExpenses(rows.raw());
        });
      });
    }, [])
  );

  const handleExport = async () => {
    try {
      const uri = await exportToCSV(expenses, 'expenses.csv');
      Alert.alert('Exported', `Saved to ${uri}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });
      if (result.canceled) return;
      const imported = await importFromCSV(result.assets[0].uri);
      db.withTransactionSync((tx) => {
        imported.forEach((exp: any) => {
          tx.executeSql(
            'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
            [exp.amount, exp.category, exp.description, exp.date]
          );
        });
      });
      Alert.alert('Imported', `${imported.length} records added`);
    } catch (e) {
      Alert.alert('Error', 'Failed to import CSV');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Button mode="contained" onPress={handleExport}>Export CSV</Button>
        <Button mode="outlined" onPress={handleImport}>Import CSV</Button>
      </View>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.date} - {item.category}</Text>
            <Text>${item.amount.toFixed(2)}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 16, justifyContent: 'space-between' },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
});
