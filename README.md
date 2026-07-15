<p align="center">
  <img src="frontend/public/logo.png" alt="ExSpire" width="250">
</p>

# ExSpire

Track things before they expire. Add subscriptions, documents, warranties, memberships, and more with expiry dates, then get reminders before they lapse.

Items are displayed in a spire layout - the closest to expiring sit at the narrow top, widening as deadlines stretch further out.

## Features

- **Spire view** - items stacked by urgency with color-coded expiry indicators (red ≤3 days, yellow ≤14 days, green for safe). Expired items are dimmed and labeled "ExSpired"
- **Categories** - built-in presets (subscription, document, warranty, membership, insurance, domain, license) plus custom categories with color-coded badges
- **Recurring items** - set items to repeat weekly, monthly, or yearly. When they expire, the next occurrence is auto-created with reset notifications
- **Email reminders** - get notified a configurable number of days before an item expires. Styled HTML emails with item details and a direct link to the app
- **Push notifications** - browser push via Web Push (VAPID). Enable in settings, test with a button to verify setup
- **Search and filter** - filter by category chips (desktop) or dropdown (mobile), search by name with an inline search bar
- **Dark and light mode** - toggle in settings, persisted in localStorage
- **Spire alignment** - align the spire left, center, or right from settings
- **Show/hide recurring** - toggle recurring items on or off in the spire (off by default)
- **Paginated spire** - shows 21 items at a time with a "Show more" button
- **Mobile gestures** - swipe left on items to reveal edit/delete actions, pull down to refresh the item list
- **Inline editing** - edit items directly in the spire without opening a separate form
- **Meduseld Account** - sign in with a shared account across all Meduseld apps (ExSpire, Lembas, Bree, Bruinen). Manage your password and sessions at accounts.meduseld.io.
- **Admin panel** - admin users can view all users, their item counts, and expand to see individual items with urgency indicators
- **PWA support** - installable as a standalone app on mobile and desktop with a service worker and install prompt banner
- **Rate limiting** - API endpoints limited to 100 requests per 15 minutes

## How It Works

1. Sign in with your Meduseld Account (or create one - same account works on Lembas, Bree, and Bruinen)
2. Add items with a name, category, expiry date, and optional notification settings (email or push, configurable days before)
3. Your spire builds itself - items closest to expiring are at the top, widening toward the bottom
4. Get email or push reminders before things lapse (checked hourly by the server)
5. Recurring items auto-renew when they expire - the date rolls forward and notifications reset

## Tech Stack

- **Frontend**: React 19 + Vite, single-page app with CSS custom properties for theming
- **Backend**: Express.js (Node.js), RESTful API
- **Auth**: Meduseld Account (session cookies validated via accounts.meduseld.io)
- **Database**: sql.js (SQLite via WebAssembly), single-file persistence
- **Notifications**: Nodemailer (SMTP) for email, web-push (VAPID) for browser push
- **Scheduling**: node-cron for hourly notification checks and recurring item renewal

## Security

- Auth handled by Meduseld Account service (bcrypt, rotating refresh tokens, CSRF protection)
- Rate limiting on API endpoints (100 req / 15 min)
- All inputs validated and sanitized server-side via express-validator
- Session validation via cookie forwarding to accounts service

## Contributing

ExSpire is source-available - the code is public for viewing and contributions, but redistribution and commercial use require permission from the copyright holder.

Contributions are welcome - feel free to open issues or submit pull requests on [GitHub](https://github.com/meduseld-io/exspire).

ExSpire is developed and maintained by [@quietarcade](https://github.com/quietarcade) as part of [Meduseld](https://github.com/meduseld-io).

## License

Source Available - see [LICENSE](LICENSE).
