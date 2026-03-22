import cron from 'node-cron';
import nodemailer from 'nodemailer';
import webpush from 'web-push';
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
  // Email notifications
  if (transporter) {
    const emailRows = all(`
      SELECT * FROM items
      WHERE notified = 0
        AND notify_email IS NOT NULL
        AND notify_email != ''
        AND date(expiry_date) <= date('now', '+' || notify_days_before || ' days')
    `);

    for (const item of emailRows) {
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
            <hr style="border:none;border-top:1px solid #2a2e3a;margin:16px 0" />
            <p style="font-size:12px;color:#8b8d97">Sent by <a href="https://exspire.meduseld.io" style="color:#6366f1">ExSpire</a></p>
          `,
        });

        run('UPDATE items SET notified = 1 WHERE id = ?', [item.id]);
        console.log(`Email sent for "${item.name}" to ${item.notify_email}`);
      } catch (err) {
        console.error(`Failed to send email for "${item.name}":`, err);
      }
    }
  }

  // Push notifications
  const pushRows = all(`
    SELECT * FROM items
    WHERE push_notified = 0
      AND notify_push = 1
      AND date(expiry_date) <= date('now', '+' || notify_days_before || ' days')
  `);

  if (pushRows.length > 0) {
    const subs = all('SELECT * FROM push_subscriptions');
    for (const item of pushRows) {
      const expiryDate = new Date(item.expiry_date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      const payload = JSON.stringify({
        title: `⏰ Expiring soon: ${item.name}`,
        body: `${item.name} (${item.category}) expires on ${expiryDate}`,
      });
      for (const sub of subs) {
        try {
          await webpush.sendNotification(JSON.parse(sub.keys_json), payload);
        } catch (err) {
          console.error(`Failed to push for "${item.name}":`, err);
          if (err.statusCode === 410 || err.statusCode === 404) {
            run('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
          }
        }
      }
      run('UPDATE items SET push_notified = 1 WHERE id = ?', [item.id]);
      console.log(`Push sent for "${item.name}"`);
    }
  }
}

export async function sendTestNotification(email) {
  if (!transporter) {
    transporter = initTransporter();
  }
  if (!transporter) {
    throw new Error('SMTP not configured');
  }

  await transporter.sendMail({
    from: process.env.NOTIFICATION_FROM || process.env.SMTP_USER,
    to: email,
    subject: '⏰ Expiring soon: Test Item',
    html: `
      <h2>Expiry Reminder</h2>
      <p><strong>Test Item</strong> (subscription) expires on <strong>1 April 2026</strong>.</p>
      <p>You asked to be notified 7 day(s) before expiry.</p>
      <hr style="border:none;border-top:1px solid #2a2e3a;margin:16px 0" />
      <p style="font-size:12px;color:#8b8d97">Sent by <a href="https://exspire.meduseld.io" style="color:#6366f1">ExSpire</a></p>
    `,
  });
}

export function startNotifier() {
  transporter = initTransporter();
  // Run every hour
  cron.schedule('0 * * * *', checkAndNotify);
  console.log('Notifier scheduled (hourly checks)');
  // Also run once on startup
  checkAndNotify();
}
