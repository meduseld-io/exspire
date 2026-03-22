# ExSpire

Track things before they expire. Add subscriptions, documents, warranties, and more with expiry dates, then get email reminders before they lapse.

Items are displayed in a tower layout — the closest to expiring sit at the narrow top, widening as deadlines stretch further out.

## Stack

- React (Vite) frontend
- Express + SQLite (sql.js) backend
- nodemailer for email notifications
- node-cron for scheduled checks (hourly)

## Setup

```bash
# Backend
cd backend
cp .env.example .env   # fill in SMTP credentials
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to the backend on port 3001.
