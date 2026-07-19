# PharmaCare Auth Backend (Node.js + MySQL, mobile + password only)

Real backend for customer auth: signup, login, and forgot-password —
all mobile number + password, no OTP/SMS involved.

## 1. Install

```bash
cd pharmacy-auth-backend
npm install
```

## 2. Configure

```bash
cp .env.example .env
```

Fill in `.env`:
- `DB_*` — your existing MySQL connection (same DB as your other pharmacy tables)
- `JWT_SECRET` — any long random string

## 3. Create the table

```bash
mysql -u <user> -p <your_db_name> < schema.sql
```

Adds a single `users` table alongside your existing `admin`, `categories`,
`medicines`, `orders`, `order_items` tables.

## 4. Run

```bash
npm run dev   # nodemon, auto-restart
# or
npm start
```

Server listens on `PORT` (default 4000).

## Endpoints

| Method | Path                        | Body                              | Notes |
|--------|-----------------------------|------------------------------------|-------|
| POST   | /api/auth/signup            | `{ mobile, password }`             | Creates account, returns JWT |
| POST   | /api/auth/login             | `{ mobile, password }`             | Returns JWT |
| POST   | /api/auth/forgot-password   | `{ mobile, newPassword }`          | Resets password, returns JWT |

All responses are JSON. Errors come back as `{ error: "message" }` with an
appropriate HTTP status.

## Security notes

- Passwords hashed with bcrypt, never stored in plaintext.
- Login/signup/forgot-password are rate-limited (10 requests / 15 min / IP) to slow brute force.
- **Forgot-password has no ownership verification** — since OTP was removed, anyone who
  knows a customer's mobile number can reset their password. That's acceptable for an
  internal tool or demo, but before real customers use this, add some verification step
  (an emailed reset link, a support-desk check, etc.).
- JWT returned to the client should be stored in memory or `sessionStorage` at minimum;
  for production, prefer an httpOnly cookie to reduce XSS exposure.
- Put this server behind HTTPS in production.