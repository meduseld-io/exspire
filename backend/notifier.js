import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { all, run } from './db.js';

let transporter = null;

function initTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP not configured — email notifications disabled');
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: parseInt(SMTP_PORT || '587') === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function checkAndNotify() {
  if (!transporter) return;

  const rows = all(`
    SELECT * FROM items
    WHERE notified = 0
      AND notify_email IS NOT NULL
      AND notify_email != ''
      AND date(expiry_date) <= date('now', '+' || notify_days_before || ' days')
  `);

  for (const item of rows) {
    try {
      const expiryDate = new Date(item.expiry_date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

      await transporter.sendMail({
        from: process.env.NOTIFICATION_FROM || process.env.SMTP_USER,
        to: item.notify_email,
        subject: `⏰ Expiring soon: ${item.name}`,
        html: `
          <h2>Expiry Reminder</h2>
          <p><strong>${item.name}</strong> (${item.category}) expires on <strong>${expiryDate}</strong>.</p>
          <p>You asked to be notified ${item.notify_days_before} day(s) before expiry.</p>
        `,
      });

      run('UPDATE items SET notified = 1 WHERE id = ?', [item.id]);
      console.log(`Notification sent for "${item.name}" to ${item.notify_email}`);
    } catch (err) {
      console.error(`Failed to send notification for "${item.name}":`, err);
    }
  }
}

export function startNotifier() {
  transporter = initTransporter();
  // Run every hour
  cron.schedule('0 * * * *', checkAndNotify);
  console.log('Notifier scheduled (hourly checks)');
  // Also run once on startup
  checkAndNotify();
}
