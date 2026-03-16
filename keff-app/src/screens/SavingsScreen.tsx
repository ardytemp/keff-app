import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, TextInput, Dialog, Portal, Card, ProgressBar } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { db } from '../database';

interface Savings {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  notes: string;
}

export default function SavingsScreen() {
  const [savings, setSavings] = useState<Savings[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [current, setCurrent] = useState<Partial<Savings>>({});

  useFocusEffect(
    React.useCallback(() => {
      db.withTransactionSync((tx) => {
        tx.executeSql('SELECT * FROM savings ORDER BY deadline', [], (_, { rows }) => {
          setSavings(rows.raw());
        });
      });
    }, [])
  );

  const openAdd = () => { setCurrent({ target_amount: 0, current_amount: 0 }); setDialogVisible(true); };
  const openEdit = (s: Savings) => { setCurrent({ ...s }); setDialogVisible(true); };

  const save = () => {
    if (!current.name) return Alert.alert('Error', 'Name required');
    if (current.target_amount == null) return Alert.alert('Error', 'Target amount required');
    db.withTransactionSync((tx) => {
      if (current.id) {
        tx.executeSql(
          'UPDATE savings SET name=?, target_amount=?, current_amount=?, deadline=?, notes=? WHERE id=?',
          [current.name, current.target_amount, current.current_amount, current.deadline || '', current.notes || '', current.id]
        );
      } else {
        tx.executeSql(
          'INSERT INTO savings (name, target_amount, current_amount, deadline, notes) VALUES (?, ?, ?, ?, ?)',
          [current.name, current.target_amount, current.current_amount, current.deadline || '', current.notes || '']
        );
      }
    });
    setDialogVisible(false);
  };

  const deleteItem = (id: number) => {
    Alert.alert('Delete', 'Delete this savings goal?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => db.withTransactionSync((tx) => tx.executeSql('DELETE FROM savings WHERE id=?', [id])) },
    ]);
  };

  const deposit = (id: number, currentAmt: number) => {
    Alert.prompt('Deposit', 'Amount to add:', [
      { text: 'Cancel' },
      {
        text: 'Add',
        onPress: (amountStr) => {
          const amount = parseFloat(amountStr || '0');
          if (amount <= 0) return;
          db.withTransactionSync((tx) => {
            tx.executeSql('UPDATE savings SET current_amount = current_amount + ? WHERE id = ?', [amount, id]);
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={openAdd} style={styles.addBtn}>Add Savings Goal</Button>
      <FlatList
        data={savings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const progress = item.target_amount > 0 ? item.current_amount / item.target_amount : 0;
          return (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.title}>{item.name}</Text>
                <Text>Target: Rp {item.target_amount.toLocaleString()}</Text>
                <Text>Current: Rp {item.current_amount.toLocaleString()}</Text>
                <ProgressBar progress={Math.min(progress, 1)} color="#4CAF50" style={styles.progress} />
                {item.deadline && <Text>Deadline: {item.deadline}</Text>}
                {item.notes && <Text>{item.notes}</Text>}
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => deposit(item.id, item.current_amount)}>Add Deposit</Button>
                <Button onPress={() => openEdit(item)}>Edit</Button>
                <Button onPress={() => deleteItem(item.id)}>Delete</Button>
              </Card.Actions>
            </Card>
          );
        }}
      />
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{current.id ? 'Edit Savings' : 'New Savings Goal'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Name" value={current.name || ''} onChangeText={(t) => setCurrent({ ...current, name: t })} />
            <TextInput label="Target Amount" value={current.target_amount?.toString() || ''} onChangeText={(t) => setCurrent({ ...current, target_amount: parseFloat(t) || 0 })} keyboardType="numeric" />
            <TextInput label="Current Amount" value={current.current_amount?.toString() || ''} onChangeText={(t) => setCurrent({ ...current, current_amount: parseFloat(t) || 0 })} keyboardType="numeric" />
            <TextInput label="Deadline (YYYY-MM-DD)" value={current.deadline || ''} onChangeText={(t) => setCurrent({ ...current, deadline: t })} />
            <TextInput label="Notes" value={current.notes || ''} onChangeText={(t) => setCurrent({ ...current, notes: t })} multiline />
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
