import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'exspire.db');

let db;

export async function initDb() {
  const SQL = await initSqlJs();

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      email_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other',
      expiry_date TEXT NOT NULL,
      notify_email TEXT,
      notify_push INTEGER NOT NULL DEFAULT 0,
      notify_days_before INTEGER NOT NULL DEFAULT 7,
      notified INTEGER NOT NULL DEFAULT 0,
      push_notified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT NOT NULL UNIQUE,
      keys_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Migrate: add new columns if missing
  try { db.run('ALTER TABLE items ADD COLUMN notify_push INTEGER NOT NULL DEFAULT 0'); } catch (e) { /* column exists */ }
  try { db.run('ALTER TABLE items ADD COLUMN push_notified INTEGER NOT NULL DEFAULT 0'); } catch (e) { /* column exists */ }
  try { db.run('ALTER TABLE items ADD COLUMN user_id INTEGER'); } catch (e) { /* column exists */ }
  try { db.run('ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0'); } catch (e) { /* column exists */ }
  try { db.run("ALTER TABLE items ADD COLUMN recurrence TEXT NOT NULL DEFAULT 'none'"); } catch (e) { /* column exists */ }
  try { db.run('ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0'); } catch (e) { /* column exists */ }
  save();
  return db;
}

export function save() {
  const data = db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

export function getDb() {
  return db;
}

// Helper to run a SELECT and return array of objects
export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper to run a SELECT and return first row as object (or null)
export function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}

// Helper to run INSERT/UPDATE/DELETE
export function run(sql, params = []) {
  db.run(sql, params);
  const changes = db.getRowsModified();
  const lastIdResult = all('SELECT last_insert_rowid() as id');
  save();
  return { lastId: lastIdResult[0]?.id, changes };
}
