import dotenv from 'dotenv';
dotenv.config({ path: '/etc/exspire.env' });
import express from 'express';
import cors from 'cors';
import webpush from 'web-push';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { initDb, all, get, run } from './db.js';
import { startNotifier, sendTestNotification, getTransporter } from './notifier.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS - allow credentials from meduseld.io subdomains
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /\.meduseld\.io$/.test(new URL(origin).hostname) || origin === 'http://localhost:5173') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  credentials: true,
}));
app.use(express.json());

// Serve frontend build in production
app.use(express.static(join(__dirname, '../frontend/dist')));

const ACCOUNTS_URL = process.env.ACCOUNTS_URL || 'https://accounts.meduseld.io';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

// ================= AUTH MIDDLEWARE =================
// Validates the user's Meduseld Account session by forwarding cookies to accounts service

async function authMiddleware(req, res, next) {
  const cookies = req.headers.cookie;
  if (!cookies || !cookies.includes('meduseld_access')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const resp = await fetch(`${ACCOUNTS_URL}/user/me`, {
      headers: { cookie: cookies },
      redirect: 'manual',
    });

    if (resp.status === 401) {
      // Try refresh
      const refreshResp = await fetch(`${ACCOUNTS_URL}/auth/refresh`, {
        method: 'POST',
        headers: { cookie: cookies },
        redirect: 'manual',
      });

      if (!refreshResp.ok) {
        return res.status(401).json({ error: 'Session expired', code: 'TOKEN_EXPIRED' });
      }

      // Forward new cookies to the client
      const setCookies = refreshResp.headers.getSetCookie?.() || [];
      setCookies.forEach(c => res.append('Set-Cookie', c));

      const refreshData = await refreshResp.json();
      if (refreshData.user) {
        req.user = refreshData.user;
        req.userId = refreshData.user.id;
        return next();
      }
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!resp.ok) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await resp.json();
    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    console.error('Auth validation failed:', err);
    return res.status(500).json({ error: 'Auth service unavailable' });
  }
}

function adminMiddleware(req, res, next) {
  // Check ExSpire's own admin flag (set via migration or manually)
  const localUser = get('SELECT is_admin FROM users WHERE meduseld_id = ?', [req.userId]);
  if (localUser && localUser.is_admin) return next();
  return res.status(403).json({ error: 'Admin access required' });
}

// ================= USER SYNC =================
// Ensure the Meduseld Account user has a local ExSpire record (for item ownership)

function ensureLocalUser(req, res, next) {
  const existing = get('SELECT id FROM users WHERE meduseld_id = ?', [req.userId]);
  if (existing) {
    req.localUserId = existing.id;
    return next();
  }

  // Create local record
  const result = run(
    'INSERT INTO users (meduseld_id, email, display_name) VALUES (?, ?, ?)',
    [req.userId, req.user.email, req.user.displayName || null]
  );
  req.localUserId = result.lastId;
  next();
}

// ================= AUTH STATUS ENDPOINT =================

app.get('/api/auth/me', apiLimiter, authMiddleware, (req, res) => {
  const localUser = get('SELECT is_admin FROM users WHERE meduseld_id = ?', [req.userId]);
  res.json({
    id: req.user.id,
    email: req.user.email,
    displayName: req.user.displayName,
    avatar: req.user.avatar || null,
    emailVerified: req.user.emailVerified,
    isAdmin: !!(localUser && localUser.is_admin),
  });
});

// ================= ADMIN ROUTES =================

app.get('/api/admin/users', apiLimiter, authMiddleware, adminMiddleware, (req, res) => {
  const users = all(`
    SELECT u.id, u.meduseld_id, u.email, u.display_name, u.is_admin, u.created_at,
      (SELECT COUNT(*) FROM items WHERE user_id = u.id) as item_count
    FROM users u ORDER BY u.created_at DESC
  `);
  res.json(users.map(u => ({
    id: u.id, meduseldId: u.meduseld_id, email: u.email, displayName: u.display_name,
    isAdmin: !!u.is_admin, createdAt: u.created_at, itemCount: u.item_count,
  })));
});

app.get('/api/admin/users/:id/items', apiLimiter, authMiddleware, adminMiddleware,
  param('id').isInt().withMessage('Invalid user ID').toInt(),
  validate,
  (req, res) => {
  const user = get('SELECT id FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const items = all('SELECT * FROM items WHERE user_id = ? ORDER BY expiry_date ASC', [req.params.id]);
  res.json(items);
});

// ================= PUSH NOTIFICATIONS =================

// Configure web push if VAPID keys are set
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@meduseld.io',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

app.get('/api/push/vapid-key', apiLimiter, (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.status(404).json({ error: 'Push not configured' });
  res.json({ publicKey: key });
});

app.post('/api/push/subscribe', apiLimiter, authMiddleware, ensureLocalUser, (req, res) => {
  const { subscription } = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  const existing = get('SELECT * FROM push_subscriptions WHERE endpoint = ?', [subscription.endpoint]);
  if (!existing) {
    run('INSERT INTO push_subscriptions (endpoint, keys_json, user_id) VALUES (?, ?, ?)',
      [subscription.endpoint, JSON.stringify(subscription), req.localUserId]);
  }
  res.json({ success: true });
});

app.post('/api/push/unsubscribe', apiLimiter, (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'endpoint is required' });
  run('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
  res.json({ success: true });
});

app.post('/api/push/test', apiLimiter, authMiddleware, async (req, res) => {
  const subs = all('SELECT * FROM push_subscriptions');
  if (subs.length === 0) return res.status(400).json({ error: 'No push subscriptions found' });
  const payload = JSON.stringify({ title: '⏰ ExSpire Test', body: 'Push notifications are working!' });
  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(JSON.parse(sub.keys_json), payload);
      sent++;
    } catch (err) {
      console.error('Failed to send push to subscription:', err);
      if (err.statusCode === 410 || err.statusCode === 404) {
        run('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
      }
    }
  }
  res.json({ success: true, sent });
});

// ================= ITEMS =================

app.get('/api/items', apiLimiter, authMiddleware, ensureLocalUser, (req, res) => {
  const items = all('SELECT * FROM items WHERE user_id = ? ORDER BY expiry_date ASC', [req.localUserId]);
  res.json(items);
});

app.post('/api/items', apiLimiter, authMiddleware, ensureLocalUser,
  body('name').notEmpty().withMessage('Name is required').trim().escape(),
  body('category').optional().trim().escape(),
  body('expiry_date').isISO8601().withMessage('Valid date is required (YYYY-MM-DD)').toDate()
    .custom((value) => {
      const d = new Date(value);
      const year = d.getFullYear();
      if (year < 2000 || year > 2100) throw new Error('Year must be between 2000 and 2100');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (d < today) throw new Error('Expiry date cannot be in the past');
      return true;
    }),
  body('notify_email').optional({ values: 'falsy' }).isEmail().withMessage('Valid email required for notifications').normalizeEmail(),
  body('notify_push').optional().isBoolean().toBoolean(),
  body('notify_days_before').optional().isInt({ min: 0, max: 365 }).withMessage('Notify days must be 0-365').toInt(),
  body('recurrence').optional().isIn(['none', 'weekly', 'monthly', 'yearly']).withMessage('Invalid recurrence value'),
  body('notify_frequency').optional().isIn(['once', 'daily', 'weekly']).withMessage('Invalid notify frequency value'),
  validate,
  (req, res) => {
  const { name, category, expiry_date, notify_email, notify_push, notify_days_before, recurrence, notify_frequency } = req.body;
  const expDate = typeof expiry_date === 'object' ? expiry_date.toISOString().split('T')[0] : expiry_date;
  const rec = recurrence || 'none';
  const freq = notify_frequency || 'once';
  const result = run(
    `INSERT INTO items (user_id, name, category, expiry_date, notify_email, notify_push, notify_days_before, recurrence, notify_frequency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.localUserId, name, category || 'other', expDate, notify_email || null, notify_push ? 1 : 0, notify_days_before ?? 7, rec, freq]
  );
  const item = get('SELECT * FROM items WHERE id = ?', [result.lastId]);
  res.status(201).json(item);
});

app.put('/api/items/:id', apiLimiter, authMiddleware, ensureLocalUser,
  param('id').isInt().withMessage('Invalid item ID').toInt(),
  body('name').optional().trim().escape(),
  body('category').optional().trim().escape(),
  body('expiry_date').optional().isISO8601().withMessage('Valid date is required (YYYY-MM-DD)')
    .custom((value) => {
      const d = new Date(value);
      const year = d.getFullYear();
      if (year < 2000 || year > 2100) throw new Error('Year must be between 2000 and 2100');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (d < today) throw new Error('Expiry date cannot be in the past');
      return true;
    }),
  body('notify_email').optional().custom((value) => {
    if (value === '' || value === null) return true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('Valid email required');
    return true;
  }),
  body('notify_push').optional().isBoolean().toBoolean(),
  body('notify_days_before').optional().isInt({ min: 0, max: 365 }).withMessage('Notify days must be 0-365').toInt(),
  body('recurrence').optional().isIn(['none', 'weekly', 'monthly', 'yearly']).withMessage('Invalid recurrence value'),
  body('notify_frequency').optional().isIn(['once', 'daily', 'weekly']).withMessage('Invalid notify frequency value'),
  validate,
  (req, res) => {
  const { name, category, expiry_date, notify_email, notify_push, notify_days_before, recurrence, notify_frequency } = req.body;
  const existing = get('SELECT * FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.localUserId]);
  if (!existing) return res.status(404).json({ error: 'Item not found' });

  const validRecurrences = ['none', 'weekly', 'monthly', 'yearly'];
  const rec = recurrence !== undefined ? (validRecurrences.includes(recurrence) ? recurrence : existing.recurrence) : existing.recurrence;

  const validFreqs = ['once', 'daily', 'weekly'];
  const freq = notify_frequency !== undefined ? (validFreqs.includes(notify_frequency) ? notify_frequency : existing.notify_frequency || 'once') : (existing.notify_frequency || 'once');

  const shouldResetNotified =
    (expiry_date && expiry_date !== existing.expiry_date) ||
    (notify_days_before !== undefined && notify_days_before !== existing.notify_days_before) ||
    (notify_email && notify_email !== existing.notify_email) ||
    (notify_frequency !== undefined && notify_frequency !== (existing.notify_frequency || 'once'));

  const shouldResetPushNotified = shouldResetNotified ||
    (notify_push !== undefined && (notify_push ? 1 : 0) !== existing.notify_push);

  run(
    `UPDATE items SET
      name = COALESCE(?, name),
      category = COALESCE(?, category),
      expiry_date = COALESCE(?, expiry_date),
      notify_email = ?,
      notify_push = ?,
      notify_days_before = COALESCE(?, notify_days_before),
      notified = ?,
      push_notified = ?,
      recurrence = ?,
      notify_frequency = ?,
      last_notified_at = ?
    WHERE id = ?`,
    [
      name || null, category || null, expiry_date || null,
      notify_email !== undefined ? (notify_email || null) : existing.notify_email,
      notify_push !== undefined ? (notify_push ? 1 : 0) : existing.notify_push,
      notify_days_before ?? null,
      shouldResetNotified ? 0 : existing.notified,
      shouldResetPushNotified ? 0 : existing.push_notified,
      rec,
      freq,
      shouldResetNotified ? null : existing.last_notified_at,
      req.params.id,
    ]
  );

  const item = get('SELECT * FROM items WHERE id = ?', [req.params.id]);
  res.json(item);
});

app.delete('/api/items/:id', apiLimiter, authMiddleware, ensureLocalUser,
  param('id').isInt().withMessage('Invalid item ID').toInt(),
  validate,
  (req, res) => {
  const existing = get('SELECT * FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.localUserId]);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  run('DELETE FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.localUserId]);
  res.json({ success: true });
});

// ================= TEST NOTIFICATION =================

app.post('/api/test-notification', apiLimiter, authMiddleware,
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  validate,
  async (req, res) => {
  const { email } = req.body;
  try {
    await sendTestNotification(email);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to send test notification:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================= HEALTH (PUBLIC) =================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'exspire' });
});

const PORT = process.env.PORT || 3001;

// SPA fallback
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
