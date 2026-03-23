# ExSpire

Track things before they expire. Add subscriptions, documents, warranties, and more with expiry dates, then get reminders before they lapse.

Items are displayed in a tower layout — the closest to expiring sit at the narrow top, widening as deadlines stretch further out.

## Features

- Email and password authentication (signup, login, password reset, email verification)
- Tower-style item list sorted by urgency with color-coded expiry indicators
- Category filtering with chip bar (desktop) and dropdown (mobile)
- Inline search to filter items by name
- Custom categories beyond the built-in presets
- Recurring items (weekly, monthly, yearly) with auto-renewal on expiry
- Email notifications before items expire (hourly cron check)
- Browser push notifications via Web Push / VAPID
- Dark and light mode (configurable in settings after login, defaults to dark)
- Tower alignment setting (left, center, right)
- Show/hide recurring items toggle (off by default)
- Swipe left to reveal edit/delete actions on mobile
- Pull-to-refresh on mobile
- Paginated tower with "Show more" button (21 items per page)
- Styled HTML email templates for notifications, verification, and password reset
- PWA support with service worker and app manifest
- Profile dropdown menu with settings and logout
- Change password and delete account from settings
- Rate limiting on auth endpoints (5 attempts per 15 minutes per IP)
- Input sanitization and validation on all API endpoints (express-validator)
- Toast notifications and delete confirmation dialogs
- Staggered tower build animation on filter changes

## Stack

- React (Vite) frontend
- Express + SQLite (sql.js) backend
- bcryptjs for password hashing
- jsonwebtoken for session auth (30-day expiry)
- nodemailer for email notifications
- web-push for browser push notifications
- node-cron for scheduled checks (hourly)
- express-rate-limit for brute force protection
- express-validator for input sanitization

## Setup

```bash
# Backend
cd backend
cp .env.example .env   # fill in SMTP + VAPID credentials
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to the backend on port 3001.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend port (default `3001`) |
| `JWT_SECRET` | Secret for signing auth tokens |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `NOTIFICATION_FROM` | Email sender name and address |
| `VAPID_PUBLIC_KEY` | VAPID public key for web push |
| `VAPID_PRIVATE_KEY` | VAPID private key for web push |
| `VAPID_SUBJECT` | VAPID subject (mailto: URI) |
| `APP_URL` | Public app URL for email links |
