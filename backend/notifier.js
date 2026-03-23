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

export function getTransporter() {
  if (!transporter) transporter = initTransporter();
  return transporter;
}

function buildEmailHtml({ name, category, expiryDate, notifyDaysBefore }) {
  const catColors = {
    subscription: '#6366f1', document: '#f59e0b', warranty: '#22c55e',
    membership: '#ec4899', insurance: '#14b8a6', domain: '#8b5cf6',
    license: '#f97316', other: '#64748b',
  };
  const catColor = catColors[category] || catColors.other;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:32px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1d27;border-radius:8px;border:1px solid #2a2e3a;overflow:hidden">
        <!-- Header -->
        <tr>
          <td style="background:#1a1d27;padding:24px 32px 16px;border-bottom:1px solid #2a2e3a">
            <img src="https://exspire.meduseld.io/logo.png" alt="ExSpire" style="height:28px;width:auto;vertical-align:middle;margin-right:8px" />
            <span style="font-size:20px;font-weight:700;color:#1589cf;vertical-align:middle">ExSpire</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:24px 32px">
            <p style="margin:0 0 8px;font-size:13px;color:#8b8d97;text-transform:uppercase;letter-spacing:0.05em;font-weight:600">Expiry Reminder</p>
            <table cellpadding="0" cellspacing="0" style="background:#0f1117;border-radius:8px;border:1px solid #2a2e3a;border-left:3px solid #f59e0b;width:100%;margin:12px 0 20px">
              <tr>
                <td style="padding:14px 16px">
                  <span style="font-size:16px;font-weight:600;color:#e4e4e7">${name}</span>
                  <span style="display:inline-block;margin-left:8px;font-size:11px;padding:2px 8px;border-radius:999px;background:${catColor}22;color:${catColor};text-transform:uppercase;font-weight:600;letter-spacing:0.03em">${category}</span>
                  <br />
                  <span style="font-size:13px;color:#8b8d97;margin-top:4px;display:inline-block">${expiryDate}</span>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:14px;color:#e4e4e7;line-height:1.6">
              You asked to be notified <strong>${notifyDaysBefore} day(s)</strong> before expiry. Time to check if you need to renew.
            </p>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 24px">
            <a href="https://exspire.meduseld.io" style="display:inline-block;background:#1589cf;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600">Open ExSpire</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #2a2e3a">
            <p style="margin:0;font-size:12px;color:#8b8d97">
              Sent by <a href="https://exspire.meduseld.io" style="color:#1589cf;text-decoration:none">ExSpire</a> · Expiry tracking made simple
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
          html: buildEmailHtml({
            name: item.name,
            category: item.category,
            expiryDate,
            notifyDaysBefore: item.notify_days_before,
          }),
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
  const t = getTransporter();
  if (!t) throw new Error('SMTP not configured');

  await t.sendMail({
    from: process.env.NOTIFICATION_FROM || process.env.SMTP_USER,
    to: email,
    subject: '⏰ Expiring soon: Test Item',
    html: buildEmailHtml({
      name: 'Test Item',
      category: 'subscription',
      expiryDate: '1 April 2026',
      notifyDaysBefore: 7,
    }),
  });
}

export function startNotifier() {
  transporter = getTransporter();
  // Run every hour
  cron.schedule('0 * * * *', checkAndNotify);
  console.log('Notifier scheduled (hourly checks)');
  // Also run once on startup
  checkAndNotify();
}
