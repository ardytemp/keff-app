import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, TextInput, Dialog, Portal, Card, Chip } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { db } from '../database';

interface Invoice {
  id: number;
  contact_id: number;
  invoice_number: string;
  amount: number;
  date_issued: string;
  date_due: string;
  status: string;
  notes: string;
  contact_name?: string;
}

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [current, setCurrent] = useState<Partial<Invoice>>({});
  const [contacts, setContacts] = useState<{id: number; name: string}[]>([]);

  useEffect(() => {
    db.withTransaction((tx) => {
      tx.executeSql('SELECT id, name FROM contacts', [], (_, { rows }) => setContacts(rows.raw()));
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      db.withTransaction((tx) => {
        tx.executeSql(`
          SELECT i.*, c.name as contact_name FROM invoices i
          LEFT JOIN contacts c ON i.contact_id = c.id
          ORDER BY i.date_issued DESC
        `, [], (_, { rows }) => setInvoices(rows.raw()));
      });
    }, [])
  );

  const openAdd = () => { setCurrent({ status: 'draft', date_issued: new Date().toISOString().split('T')[0] }); setDialogVisible(true); };
  const openEdit = (i: Invoice) => { setCurrent({ ...i }); setDialogVisible(true); };
  const openSend = (id: number) => {
    db.withTransaction((tx) => tx.executeSql('UPDATE invoices SET status = ? WHERE id = ?', ['sent', i.id]));
  };
  const openPaid = (id: number) => {
    db.withTransaction((tx) => tx.executeSql('UPDATE invoices SET status = ? WHERE id = ?', ['paid', i.id]));
  };

  const save = () => {
    if (!current.invoice_number || !current.amount || !current.date_issued) return Alert.alert('Error', 'Number, amount, date required');
    db.withTransaction((tx) => {
      if (current.id) {
        tx.executeSql(
          'UPDATE invoices SET contact_id=?, invoice_number=?, amount=?, date_issued=?, date_due=?, status=?, notes=? WHERE id=?',
          [current.contact_id, current.invoice_number, current.amount, current.date_issued, current.date_due || '', current.status, current.notes || '', current.id]
        );
      } else {
        tx.executeSql(
          'INSERT INTO invoices (contact_id, invoice_number, amount, date_issued, date_due, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [current.contact_id, current.invoice_number, current.amount, current.date_issued, current.date_due || '', current.status, current.notes || '']
        );
      }
    });
    setDialogVisible(false);
  };

  const statusColor = (s: string) => {
    switch(s) { case 'paid': return 'green'; case 'sent': return 'blue'; case 'overdue': return 'red'; case 'draft': return 'gray'; default: return 'orange'; }
  };

  const pickContact = () => {
    Alert.alert(
      "Select Contact",
      null,
      contacts.map(c => ({ text: c.name, onPress: () => setCurrent({ ...current, contact_id: c.id }) }))
    );
  };

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={openAdd} style={styles.addBtn}>Create Invoice</Button>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>{item.invoice_number}</Text>
              <Text>{item.contact_name || 'No contact'}</Text>
              <Text>Amount: Rp {item.amount.toLocaleString()}</Text>
              <Text>Issued: {item.date_issued}  Due: {item.date_due || '-'}</Text>
              <Chip mode="outlined" textStyle={{color: statusColor(item.status)}} style={{alignSelf: 'flex-start', marginTop: 4}}>{item.status.toUpperCase()}</Chip>
            </Card.Content>
            <Card.Actions>
              {item.status === 'draft' && <Button onPress={() => openSend(item.id)}>Send</Button>}
              {item.status === 'sent' && <Button onPress={() => openPaid(item.id)}>Mark Paid</Button>}
              <Button onPress={() => openEdit(item)}>Edit</Button>
            </Card.Actions>
          </Card>
        )}
      />
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{current.id ? 'Edit Invoice' : 'New Invoice'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Invoice Number" value={current.invoice_number || ''} onChangeText={(t) => setCurrent({ ...current, invoice_number: t })} />
            <TextInput label="Amount" value={current.amount?.toString() || ''} onChangeText={(t) => setCurrent({ ...current, amount: parseFloat(t) || 0 })} keyboardType="numeric" />
            <TextInput label="Date Issued" value={current.date_issued || ''} onChangeText={(t) => setCurrent({ ...current, date_issued: t })} />
            <TextInput label="Due Date" value={current.date_due || ''} onChangeText={(t) => setCurrent({ ...current, date_due: t })} />
            <TextInput label="Notes" value={current.notes || ''} onChangeText={(t) => setCurrent({ ...current, notes: t })} multiline />
            <Text style={{marginTop: 8}}>Contact:</Text>
            <Button onPress={pickContact}>{current.contact_id ? contacts.find(c => c.id === current.contact_id)?.name : 'Choose Contact'}</Button>
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
});
