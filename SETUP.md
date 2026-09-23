# GIST Mentoring System — Setup Guide (Fixed)

This document reflects the current, working state of the project after fixing:
1. A syntax error in `app.js` that broke the entire frontend script (login, dashboards, everything).
2. Missing seed data — the database had no admins/mentors/students despite `LOGIN_CREDENTIALS.md` documenting ~40 demo accounts.
3. A latent bug in `backend/db.js` that made it silently use the wrong DB password when required outside of `server.js`.

## 1. Prerequisites

- Node.js (v18+ recommended)
- MySQL or MariaDB running locally

## 2. Install dependencies

```bash
npm install
```

## 3. Configure the database connection

Edit `backend/.env` and set your real MySQL credentials:

```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_actual_mysql_password
MYSQL_DATABASE=gist_mentoring_system
PORT=3000
TOKEN_SECRET=change_this_to_something_random
```

**Important:** `backend/.env` currently contains real-looking API keys (OpenAI, Gemini, OpenRouter) and a database password. Do not commit this file or share it publicly — rotate any keys that may have already been exposed (e.g. if this repo was ever pushed to GitHub or shared in a chat).

If you're on a fresh MySQL install and get `ERROR 1045 (28000): Access denied`, make sure the MySQL root user is set up for password auth (not just socket auth):

```sql
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('your_password');
FLUSH PRIVILEGES;
```

## 4. Create tables

You don't need to run `schema.sql` manually — `backend/server.js` calls `initDatabase()` on startup, which creates the database and all tables automatically if they don't exist.

## 5. Seed demo data

The database starts empty. Run the new seed script to populate it with the accounts documented in `LOGIN_CREDENTIALS.md`:

```bash
node backend/seed.js
```

This is safe to re-run any time — it upserts rather than duplicating rows. It creates:
- 6 admin accounts (`admin1` super admin + 5 branch admins)
- 6 mentor accounts (one or two per department)
- 29 student accounts across CSE/ECE/EEE/MECH/CIVIL, each linked to a mentor in their department

All credentials match `LOGIN_CREDENTIALS.md` exactly (e.g. `admin1` / `admin123`, `mentor1` / `mentor123`, any listed roll number / `student123`).

## 6. Start the server

```bash
npm start
```

You should see:
```
MySQL connected successfully.
GIST Mentoring System running on http://localhost:3000
```

Open `http://localhost:3000` in your browser.

## 7. Verify login works

Quick sanity check from the command line (server must be running):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"admin123","userType":"admin"}'
```

You should get back a JSON object with a `token` and `user`. Same pattern works for `mentor1`/`mentor123`/`"userType":"mentor"` and any student roll number/`student123`/`"userType":"student"`.

## What was actually wrong (for your project report / viva)

| Issue | File | Symptom | Fix |
|---|---|---|---|
| Syntax error (`credentials.password` used as a bare expression instead of `password: credentials.password`) | `app.js` line 39 | Whole script failed to parse — nothing on any page worked, not just login | Corrected to a proper object property |
| No seed data | database (not a file bug) | Every login attempt returned "Invalid credentials" because the tables were empty | Added `backend/seed.js` |
| `db.js` didn't load its own `.env` | `backend/db.js` | Any script other than `server.js` that imported `db.js` directly (like a seed script) would silently connect with the wrong fallback password | Added `dotenv.config()` at the top of `db.js` |

## Known limitation worth mentioning if asked

Passwords are stored and compared in plain text (`WHERE roll_no = ? AND password = ?` in `server.js`). That's acceptable for a college demo/project, but if you want to harden it later, hash passwords with `bcrypt` on registration and compare hashes on login instead of storing/comparing plaintext.
