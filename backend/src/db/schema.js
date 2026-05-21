const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || './data/congelo.db';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  INSERT OR IGNORE INTO categories (name) VALUES
    ('Viande'), ('Poisson'), ('Légumes'), ('Plats préparés'), ('Autre');

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'pièce',
    category_id INTEGER REFERENCES categories(id),
    frozen_at TEXT DEFAULT (date('now')),
    expires_at TEXT,
    barcode TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity REAL,
    unit TEXT,
    user TEXT DEFAULT 'Famille',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
