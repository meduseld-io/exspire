# ExSpire — TODO

## Notification Integrations

- [ ] **SMS (Twilio)** — Add Twilio SMS transport to notifier. User enters phone number in settings, selects SMS as notification type. Env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`. Cost: ~$0.0079/msg + $1.15/mo for number.
- [ ] **WhatsApp (Twilio)** — Same Twilio account, different API endpoint. User enters WhatsApp number in settings. Requires Twilio WhatsApp sandbox or approved business profile.
- [ ] **Slack** — User pastes a Slack incoming webhook URL in settings. POST notification payloads to it. No API key needed, just the webhook URL.
- [ ] **Discord** — User pastes a Discord webhook URL in settings. POST rich embed notifications. Same pattern as Slack.

## Item Features

- [ ] **Item detail view** — Tap a tower block to open a detail modal/page showing full item info: name, category, expiry date, notification settings, creation date, notification history. Allow inline editing from the detail view.
- [ ] **Notification history** — Add `notification_log` table (`id`, `item_id`, `user_id`, `type` (email/push/sms/etc), `sent_at`, `status`). Log every notification sent. Show history in item detail view.
- [ ] **Snooze notifications** — "Remind me again in X days" button on notifications (push action button, email link, in-app). Add `snoozed_until` column to items table. Notifier skips items where `snoozed_until > now`.

## UI/UX

- [ ] **App icon badge count** — Use `navigator.setAppBadge(count)` to show number of items expiring within 7 days on the PWA icon. Update on each load and after push notifications. Clear badge when no items are expiring soon.
- [ ] **About/version screen** — Add an about section in settings modal showing app version (from package.json), build info, and links to GitHub repo / meduseld.io.
- [ ] **Offline handling** — Detect when API is unreachable (`navigator.onLine` + fetch error handling). Show a banner "You're offline — changes will sync when you reconnect." Queue create/update/delete actions in localStorage, replay them when connection is restored.

## Security & Reliability

- [ ] **Input sanitization/validation** — Add `express-validator` to all API endpoints. Validate email format, password length, item fields, date formats. Sanitize string inputs to prevent XSS.
- [ ] **Token refresh mechanism** — Current JWT tokens expire after 30 days with no refresh. Options: (a) sliding window — issue new token on each `/api/auth/me` call if token is >15 days old, or (b) separate refresh token flow with short-lived access tokens (15min) + long-lived refresh tokens (30d) stored in DB.
- [ ] **Database backups** — Automated SQLite backup. Options: (a) cron job that copies `exspire.db` to cloud storage (S3/Google Drive) daily, (b) add a `/api/admin/backup` endpoint that triggers manual backup. Use the same Google Drive approach as meduseld's backup service, or a simple S3 upload.
