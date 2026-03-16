import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, TextInput, Dialog, Portal } from 'react-native-paper';
import { db } from '../database';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

export default function CRMScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [current, setCurrent] = useState<Partial<Contact>>({});

  const loadContacts = () => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM contacts ORDER BY name', [], (_, { rows }) => {
        setContacts(rows.raw());
      });
    });
  };

  useEffect(() => { loadContacts(); });

  useFocusEffect(React.useCallback(() => { loadContacts(); }, []));

  const openAdd = () => { setCurrent({}); setDialogVisible(true); };
  const openEdit = (c: Contact) => { setCurrent({ ...c }); setDialogVisible(true); };

  const save = () => {
    if (!current.name) return Alert.alert('Error', 'Name required');
    db.transaction((tx) => {
      if (current.id) {
        tx.executeSql(
          'UPDATE contacts SET name=?, email=?, phone=?, company=?, notes=? WHERE id=?',
          [current.name, current.email || '', current.phone || '', current.company || '', current.notes || '', current.id]
        );
      } else {
        tx.executeSql(
          'INSERT INTO contacts (name, email, phone, company, notes) VALUES (?, ?, ?, ?, ?)',
          [current.name, current.email || '', current.phone || '', current.company || '', current.notes || '']
        );
      }
    });
    setDialogVisible(false);
  };

  const deleteItem = (id: number) => {
    Alert.alert('Delete', 'Delete this contact?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => db.transaction((tx) => tx.executeSql('DELETE FROM contacts WHERE id=?', [id])) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={openAdd} style={styles.addBtn}>Add Contact</Button>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.company}</Text>
            <Text>{item.phone}</Text>
            <Text>{item.email}</Text>
          </View>
        )}
      />
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{current.id ? 'Edit Contact' : 'New Contact'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Name" value={current.name || ''} onChangeText={(t) => setCurrent({ ...current, name: t })} />
            <TextInput label="Company" value={current.company || ''} onChangeText={(t) => setCurrent({ ...current, company: t })} />
            <TextInput label="Phone" value={current.phone || ''} onChangeText={(t) => setCurrent({ ...current, phone: t })} keyboardType="phone-pad" />
            <TextInput label="Email" value={current.email || ''} onChangeText={(t) => setCurrent({ ...current, email: t })} keyboardType="email-address" />
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
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#ccc' },
  name: { fontWeight: 'bold', fontSize: 16 },
});
