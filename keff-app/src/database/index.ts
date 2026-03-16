import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('keff.db');

export function initDatabase() {
  db.transaction((tx) => {
    tx.executeSql(
      `PRAGMA journal_mode = WAL;
       CREATE TABLE IF NOT EXISTS expenses (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         amount REAL NOT NULL,
         category TEXT NOT NULL,
         description TEXT,
         date TEXT NOT NULL,
         contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
         created_at TEXT DEFAULT CURRENT_TIMESTAMP
       );
       CREATE TABLE IF NOT EXISTS contacts (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         email TEXT,
         phone TEXT,
         company TEXT,
         notes TEXT,
         created_at TEXT DEFAULT CURRENT_TIMESTAMP
       );
       CREATE TABLE IF NOT EXISTS transactions (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         contact_id INTEGER,
         amount REAL NOT NULL,
         type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
         date TEXT NOT NULL,
         notes TEXT,
         created_at TEXT DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
       );
       CREATE TABLE IF NOT EXISTS savings (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         target_amount REAL NOT NULL,
         current_amount REAL DEFAULT 0,
         deadline TEXT,
         notes TEXT,
         created_at TEXT DEFAULT CURRENT_TIMESTAMP
       );
       CREATE TABLE IF NOT EXISTS budgets (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         category TEXT NOT NULL,
         amount REAL NOT NULL,
         period TEXT NOT NULL CHECK(period IN ('monthly', 'yearly')),
         start_date TEXT,
         created_at TEXT DEFAULT CURRENT_TIMESTAMP
       );
       CREATE TABLE IF NOT EXISTS invoices (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         contact_id INTEGER,
         invoice_number TEXT NOT NULL UNIQUE,
         amount REAL NOT NULL,
         date_issued TEXT NOT NULL,
         date_due TEXT,
         status TEXT NOT NULL CHECK(status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
         notes TEXT,
         created_at TEXT DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
       );`,
      [],
      () => console.log('Tables created'),
      (_, err) => { console.error('DB error', err); return false; }
    );
  });
}

export { db };
