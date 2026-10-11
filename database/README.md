# Database

Leads from the landing page form are stored in a single `leads` table.

The database is not fixed yet. The backend supports **SQLite**, **MySQL** and **PostgreSQL**. Choose one by setting `DB_CLIENT` in `backend/.env`:

| `DB_CLIENT` | Good for | Connection settings |
|---|---|---|
| `sqlite` (default) | Local testing, very low volume | `DB_FILE` (a file on the server) |
| `mysql` | cPanel / Hostinger / most shared hosting | `DATABASE_URL` or `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` |
| `postgres` | Cloud servers, Render, Railway, Supabase, AWS RDS | Same as MySQL, plus `DB_SSL=true` for most managed hosts |

## Creating the table

You normally don't need to do anything: with `AUTO_MIGRATE=true` (the default) the backend creates or updates the table when it starts.

To run it by hand:

```bash
cd backend
npm run migrate
```

If your host only lets you create tables through a control panel (e.g. phpMyAdmin), run the matching file from `schema/` instead and set `AUTO_MIGRATE=false`.

## Folders

- `migrations/`: versioned table changes, used by the backend (Knex). Add a new file here for any future column change.
- `schema/`: the same table as plain SQL for MySQL, PostgreSQL and SQLite, for manual setup.

## Table: `leads`

| Column | Notes |
|---|---|
| `id` | Auto-increment primary key |
| `name`, `phone`, `email` | Required |
| `city`, `capital_contribution`, `timeline`, `background` | Optional form answers |
| `source`, `page` | Which landing page the lead came from |
| `ip_address`, `user_agent` | Kept for spam checks |
| `created_at` | Submission time |
