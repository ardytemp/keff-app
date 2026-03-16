import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, TextInput, Dialog, Portal, Card, ProgressBar } from 'react-native-paper';
import { db } from '../database';

interface Budget {
  id: number;
  category: string;
  amount: number;
  period: string;
  start_date: string;
}

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [spending, setSpending] = useState<{ [key: string]: number }>({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [current, setCurrent] = useState<Partial<Budget>>({});

  const loadBudgets = () => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM budgets', [], (_, { rows }) => setBudgets(rows.raw()));
    });
  };

  const loadSpending = () => {
    const today = new Date();
    const monthStart = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-01`;
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT category, SUM(amount) as total FROM expenses WHERE date >= ? GROUP BY category',
        [monthStart],
        (_, { rows }) => {
          const map: { [k: string]: number } = {};
          for (let i = 0; i < rows.length; i++) {
            const item = rows.item(i);
            map[item.category] = item.total || 0;
          }
          setSpending(map);
        }
      );
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      loadBudgets();
      loadSpending();
    }, [])
  );

  const openAdd = () => { setCurrent({ period: 'monthly' }); setDialogVisible(true); };
  const openEdit = (b: Budget) => { setCurrent({ ...b }); setDialogVisible(true); };

  const save = () => {
    if (!current.category || !current.amount) return Alert.alert('Error', 'Category and amount required');
    db.transaction((tx) => {
      if (current.id) {
        tx.executeSql('UPDATE budgets SET category=?, amount=?, period=?, start_date=? WHERE id=?', [current.category, current.amount, current.period, current.start_date || '', current.id]);
      } else {
        tx.executeSql('INSERT INTO budgets (category, amount, period, start_date) VALUES (?, ?, ?, ?)', [current.category, current.amount, current.period, current.start_date || '']);
      }
    });
    loadBudgets();
    setDialogVisible(false);
  };

  const deleteItem = (id: number) => {
    Alert.alert('Delete', 'Delete budget?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => db.transaction((tx) => tx.executeSql('DELETE FROM budgets WHERE id=?', [id])) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={openAdd} style={styles.addBtn}>Add Budget</Button>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const spent = spending[item.category] || 0;
          const progress = item.amount > 0 ? spent / item.amount : 0;
          return (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.title}>{item.category}</Text>
                <Text>Budget: Rp {item.amount.toLocaleString()} ({item.period})</Text>
                <Text>Spent: Rp {spent.toLocaleString()}</Text>
                <ProgressBar progress={Math.min(progress, 1)} color={progress >= 1 ? '#F44336' : '#4CAF50'} style={styles.progress} />
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => openEdit(item)}>Edit</Button>
                <Button onPress={() => deleteItem(item.id)}>Delete</Button>
              </Card.Actions>
            </Card>
          );
        }}
      />
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{current.id ? 'Edit Budget' : 'New Budget'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Category" value={current.category || ''} onChangeText={(t) => setCurrent({ ...current, category: t })} />
            <TextInput label="Amount" value={current.amount?.toString() || ''} onChangeText={(t) => setCurrent({ ...current, amount: parseFloat(t) || 0 })} keyboardType="numeric" />
            <TextInput label="Period" value={current.period || 'monthly'} onChangeText={(t) => setCurrent({ ...current, period: t })} />
            <TextInput label="Start Date (YYYY-MM-DD)" value={current.start_date || ''} onChangeText={(t) => setCurrent({ ...current, start_date: t })} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={save}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addBtn: { marginBottom: 16 },
  card: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  progress: { height: 8, borderRadius: 4, marginTop: 8 },
});
