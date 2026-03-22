import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initDb, all, get, run } from './db.js';
import { startNotifier } from './notifier.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend build in production
app.use(express.static(join(__dirname, '../frontend/dist')));

// List all items
app.get('/api/items', (req, res) => {
  const items = all('SELECT * FROM items ORDER BY expiry_date ASC');
  res.json(items);
});

// Create item
app.post('/api/items', (req, res) => {
  const { name, category, expiry_date, notify_email, notify_days_before } = req.body;
  if (!name || !expiry_date) {
    return res.status(400).json({ error: 'name and expiry_date are required' });
  }
  const result = run(
    `INSERT INTO items (name, category, expiry_date, notify_email, notify_days_before) VALUES (?, ?, ?, ?, ?)`,
    [name, category || 'other', expiry_date, notify_email || null, notify_days_before ?? 7]
  );
  const item = get('SELECT * FROM items WHERE id = ?', [result.lastId]);
  res.status(201).json(item);
});

// Update item
app.put('/api/items/:id', (req, res) => {
  const { name, category, expiry_date, notify_email, notify_days_before } = req.body;
  const existing = get('SELECT * FROM items WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Item not found' });

  const shouldResetNotified =
    (expiry_date && expiry_date !== existing.expiry_date) ||
    (notify_days_before !== undefined && notify_days_before !== existing.notify_days_before) ||
    (notify_email && notify_email !== existing.notify_email);

  run(
    `UPDATE items SET
      name = COALESCE(?, name),
      category = COALESCE(?, category),
      expiry_date = COALESCE(?, expiry_date),
      notify_email = COALESCE(?, notify_email),
      notify_days_before = COALESCE(?, notify_days_before),
      notified = ?
    WHERE id = ?`,
    [
      name || null, category || null, expiry_date || null,
      notify_email ?? null, notify_days_before ?? null,
      shouldResetNotified ? 0 : existing.notified,
      Number(req.params.id),
    ]
  );

  const item = get('SELECT * FROM items WHERE id = ?', [Number(req.params.id)]);
  res.json(item);
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
  const result = run('DELETE FROM items WHERE id = ?', [Number(req.params.id)]);
  if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;

// SPA fallback — serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../frontend/dist/index.html'));
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`ExSpire API running on port ${PORT}`);
    startNotifier();
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
