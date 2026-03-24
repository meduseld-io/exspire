import dotenv from 'dotenv';
dotenv.config({ path: '/etc/exspire.env' });
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import webpush from 'web-push';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { initDb, all, get, run } from './db.js';
import { startNotifier, sendTestNotification, getTransporter } from './notifier.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend build in production
app.use(express.static(join(__dirname, '../frontend/dist')));

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again in 15 minutes' },
});

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, isAdmin: !!user.is_admin }, JWT_SECRET, { expiresIn: '30d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminMiddleware(req, res, next) {
  const user = get('SELECT is_admin FROM users WHERE id = ?', [req.userId]);
  if (!user || !user.is_admin) return res.status(403).json({ error: 'Admin access required' });
  next();
}

// --- Auth routes ---

app.post('/api/auth/signup', authLimiter,
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').trim(),
  body('displayName').optional().trim().escape(),
  validate,
  async (req, res) => {
  const { email, password, displayName } = req.body;

  const existing = get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  try {
    const hash = await bcrypt.hash(password, 12);
    const result = run('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)', [email.toLowerCase(), hash, displayName || null]);
    const user = get('SELECT id, email, display_name, email_verified FROM users WHERE id = ?', [result.lastId]);
    res.status(201).json({ token: signToken(user), user: { id: user.id, email: user.email, displayName: user.display_name, emailVerified: !!user.email_verified, isAdmin: false } });
  } catch (err) {
    console.error('Signup failed:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/login', authLimiter,
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').trim(),
  validate,
  async (req, res) => {
  const { email, password } = req.body;

  const user = get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  try {
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: signToken(user), user: { id: user.id, email: user.email, displayName: user.display_name, emailVerified: !!user.email_verified, isAdmin: !!user.is_admin } });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

const APP_URL = process.env.APP_URL || 'https://exspire.meduseld.io';

function buildAuthEmail({ heading, body, ctaText, ctaUrl }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:32px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1d27;border-radius:8px;border:1px solid #2a2e3a;overflow:hidden">
        <tr>
          <td style="background:#1a1d27;padding:24px 32px 16px;border-bottom:1px solid #2a2e3a">
            <img src="${APP_URL}/logo.png" alt="ExSpire" style="height:28px;width:auto;vertical-align:middle;margin-right:8px" />
            <span style="font-size:20px;font-weight:700;color:#1589cf;vertical-align:middle">ExSpire</span>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px">
            <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#e4e4e7">${heading}</p>
            <p style="margin:0 0 20px;font-size:14px;color:#e4e4e7;line-height:1.6">${body}</p>
            <a href="${ctaUrl}" style="display:inline-block;background:#1589cf;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600">${ctaText}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #2a2e3a">
            <p style="margin:0;font-size:12px;color:#8b8d97">
              Sent by <a href="${APP_URL}" style="color:#1589cf;text-decoration:none">ExSpire</a> · Expiry tracking made simple
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = get('SELECT id, email, display_name, email_verified, is_admin FROM users WHERE id = ?', [req.userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, displayName: user.display_name, emailVerified: !!user.email_verified, isAdmin: !!user.is_admin });
});

// --- Email verification ---

app.post('/api/auth/send-verification', authMiddleware, async (req, res) => {
  const user = get('SELECT * FROM users WHERE id = ?', [req.userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.email_verified) return res.json({ message: 'Already verified' });

  const t = getTransporter();
  if (!t) return res.status(500).json({ error: 'Email not configured' });

  try {
    const token = jwt.sign({ id: user.id, purpose: 'verify' }, JWT_SECRET, { expiresIn: '24h' });
    const url = `${APP_URL}?verify=${encodeURIComponent(token)}`;
    await t.sendMail({
      from: process.env.NOTIFICATION_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Verify your ExSpire account',
      html: buildAuthEmail({
        heading: 'Verify your email',
        body: 'Click the button below to verify your email address. This link expires in 24 hours.',
        ctaText: 'Verify Email',
        ctaUrl: url,
      }),
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to send verification email:', err);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

app.post('/api/auth/verify',
  body('token').notEmpty().withMessage('Token is required').trim(),
  validate,
  async (req, res) => {
  const { token } = req.body;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.purpose !== 'verify') return res.status(400).json({ error: 'Invalid token' });
    run('UPDATE users SET email_verified = 1 WHERE id = ?', [payload.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Email verification failed:', err);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// --- Password reset ---

app.post('/api/auth/forgot-password', authLimiter,
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  validate,
  async (req, res) => {
  const { email } = req.body;

  // Always return success to prevent email enumeration
  const user = get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!user) return res.json({ success: true });

  const t = getTransporter();
  if (!t) return res.status(500).json({ error: 'Email not configured' });

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    run('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, token, expiresAt]);

    const url = `${APP_URL}?reset=${encodeURIComponent(token)}`;
    await t.sendMail({
      from: process.env.NOTIFICATION_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Reset your ExSpire password',
      html: buildAuthEmail({
        heading: 'Reset your password',
        body: 'Click the button below to set a new password. This link expires in 1 hour. If you didn\'t request this, you can safely ignore this email.',
        ctaText: 'Reset Password',
        ctaUrl: url,
      }),
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to send password reset email:', err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

app.post('/api/auth/reset-password',
  body('token').notEmpty().withMessage('Token is required').trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').trim(),
  validate,
  async (req, res) => {
  const { token, password } = req.body;

  const row = get("SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime('now')", [token]);
  if (!row) return res.status(400).json({ error: 'Invalid or expired reset link' });

  try {
    const hash = await bcrypt.hash(password, 12);
    run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, row.user_id]);
    run('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [row.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Password reset failed:', err);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// --- Change password ---

app.post('/api/auth/change-password', authMiddleware,
  body('currentPassword').notEmpty().withMessage('Current password is required').trim(),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters').trim(),
  validate,
  async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = get('SELECT * FROM users WHERE id = ?', [req.userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 12);
    run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Change password failed:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// --- Delete account ---

app.delete('/api/auth/account', authMiddleware,
  body('password').notEmpty().withMessage('Password is required to delete account').trim(),
  validate,
  async (req, res) => {
  const { password } = req.body;

  const user = get('SELECT * FROM users WHERE id = ?', [req.userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });
    run('DELETE FROM items WHERE user_id = ?', [user.id]);
    run('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);
    run('DELETE FROM users WHERE id = ?', [user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete account failed:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// --- Admin routes ---

app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const users = all(`
    SELECT u.id, u.email, u.display_name, u.email_verified, u.is_admin, u.created_at,
      (SELECT COUNT(*) FROM items WHERE user_id = u.id) as item_count
    FROM users u ORDER BY u.created_at DESC
  `);
  res.json(users.map(u => ({
    id: u.id, email: u.email, displayName: u.display_name,
    emailVerified: !!u.email_verified, isAdmin: !!u.is_admin,
    createdAt: u.created_at, itemCount: u.item_count,
  })));
});

app.get('/api/admin/users/:id/items', authMiddleware, adminMiddleware,
  param('id').isInt().withMessage('Invalid user ID').toInt(),
  validate,
  (req, res) => {
  const user = get('SELECT id FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const items = all('SELECT * FROM items WHERE user_id = ? ORDER BY expiry_date ASC', [req.params.id]);
  res.json(items);
});

// Configure web push if VAPID keys are set
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@meduseld.io',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Get VAPID public key for client subscription
app.get('/api/push/vapid-key', (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.status(404).json({ error: 'Push not configured' });
  res.json({ publicKey: key });
});

// Save push subscription
app.post('/api/push/subscribe', (req, res) => {
  const { subscription } = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  const existing = get('SELECT * FROM push_subscriptions WHERE endpoint = ?', [subscription.endpoint]);
  if (!existing) {
    run('INSERT INTO push_subscriptions (endpoint, keys_json) VALUES (?, ?)', [subscription.endpoint, JSON.stringify(subscription)]);
  }
  res.json({ success: true });
});

// Remove push subscription
app.post('/api/push/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'endpoint is required' });
  run('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
  res.json({ success: true });
});

// Send test push notification
app.post('/api/push/test', async (req, res) => {
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

// List all items (for current user)
app.get('/api/items', authMiddleware, (req, res) => {
  const items = all('SELECT * FROM items WHERE user_id = ? ORDER BY expiry_date ASC', [req.userId]);
  res.json(items);
});

// Create item
app.post('/api/items', authMiddleware,
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
  validate,
  (req, res) => {
  const { name, category, expiry_date, notify_email, notify_push, notify_days_before, recurrence } = req.body;
  const expDate = typeof expiry_date === 'object' ? expiry_date.toISOString().split('T')[0] : expiry_date;
  const rec = recurrence || 'none';
  const result = run(
    `INSERT INTO items (user_id, name, category, expiry_date, notify_email, notify_push, notify_days_before, recurrence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.userId, name, category || 'other', expDate, notify_email || null, notify_push ? 1 : 0, notify_days_before ?? 7, rec]
  );
  const item = get('SELECT * FROM items WHERE id = ?', [result.lastId]);
  res.status(201).json(item);
});

// Update item
app.put('/api/items/:id', authMiddleware,
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
  body('notify_email').optional({ values: 'falsy' }).isEmail().withMessage('Valid email required').normalizeEmail(),
  body('notify_push').optional().isBoolean().toBoolean(),
  body('notify_days_before').optional().isInt({ min: 0, max: 365 }).withMessage('Notify days must be 0-365').toInt(),
  body('recurrence').optional().isIn(['none', 'weekly', 'monthly', 'yearly']).withMessage('Invalid recurrence value'),
  validate,
  (req, res) => {
  const { name, category, expiry_date, notify_email, notify_push, notify_days_before, recurrence } = req.body;
  const existing = get('SELECT * FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (!existing) return res.status(404).json({ error: 'Item not found' });

  const validRecurrences = ['none', 'weekly', 'monthly', 'yearly'];
  const rec = recurrence !== undefined ? (validRecurrences.includes(recurrence) ? recurrence : existing.recurrence) : existing.recurrence;

  const shouldResetNotified =
    (expiry_date && expiry_date !== existing.expiry_date) ||
    (notify_days_before !== undefined && notify_days_before !== existing.notify_days_before) ||
    (notify_email && notify_email !== existing.notify_email);

  const shouldResetPushNotified = shouldResetNotified ||
    (notify_push !== undefined && (notify_push ? 1 : 0) !== existing.notify_push);

  run(
    `UPDATE items SET
      name = COALESCE(?, name),
      category = COALESCE(?, category),
      expiry_date = COALESCE(?, expiry_date),
      notify_email = COALESCE(?, notify_email),
      notify_push = ?,
      notify_days_before = COALESCE(?, notify_days_before),
      notified = ?,
      push_notified = ?,
      recurrence = ?
    WHERE id = ?`,
    [
      name || null, category || null, expiry_date || null,
      notify_email ?? null,
      notify_push !== undefined ? (notify_push ? 1 : 0) : existing.notify_push,
      notify_days_before ?? null,
      shouldResetNotified ? 0 : existing.notified,
      shouldResetPushNotified ? 0 : existing.push_notified,
      rec,
      req.params.id,
    ]
  );

  const item = get('SELECT * FROM items WHERE id = ?', [req.params.id]);
  res.json(item);
});

// Delete item
app.delete('/api/items/:id', authMiddleware,
  param('id').isInt().withMessage('Invalid item ID').toInt(),
  validate,
  (req, res) => {
  const existing = get('SELECT * FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  run('DELETE FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  res.json({ success: true });
});

// Send test notification email
app.post('/api/test-notification', authMiddleware,
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
