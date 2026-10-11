# Deployment

Hosting and the database are not decided yet, so this guide covers the two most likely setups. Both start the same way.

## 1. Build the release

From the repo root:

```bash
npm run build
```

This refreshes:

- `release/frontend`: the static landing page and thank-you page
- `release/backend`: the lead API, its database migrations and the PM2 file (no `node_modules`, no `.env`)

## 2a. Linux server (VPS / cloud: AWS, DigitalOcean, Hostinger VPS)

Needs Node.js 18+, Nginx and PM2 (`npm install -g pm2`).

1. Upload `release/frontend` to `/var/www/carlton-landing/frontend` and `release/backend` to `/var/www/carlton-landing/backend`.
2. In the backend folder:
   ```bash
   cp .env.example .env      # then edit: DB_CLIENT, database login, SERVE_FRONTEND=false
   npm ci --omit=dev
   pm2 start ecosystem.config.js && pm2 save && pm2 startup
   ```
3. Set up Nginx with `nginx.conf.example` (serves the page and forwards `/api/` to the backend), then add HTTPS with Certbot.
4. Check: `https://your-domain/api/health` should return `{"ok":true,"database":"connected"}`.

## 2b. cPanel / shared hosting

1. Upload the contents of `release/frontend` to `public_html` (or the subdomain's folder).
2. In cPanel, open **Setup Node.js App**, create an app with the application root pointing to the uploaded `release/backend` folder and startup file `src/server.js`.
3. Add the `.env` values as environment variables in that screen (or upload a `.env` file), with `DB_CLIENT=mysql` and the MySQL login from **MySQL Databases**. Run **NPM Install**, then start the app.
4. The app's URL must serve `/api/leads` on the same domain as the page. If it's on a different (sub)domain, set `FORM_ENDPOINT` in `frontend/index.html` to the full URL and add the page's domain to `CORS_ORIGINS`.

## Single-server option

If you'd rather not use Nginx (e.g. a PaaS like Render or Railway), deploy only `release/backend`, keep `SERVE_FRONTEND=true` and copy `release/frontend` next to it. The backend then serves both the page and the API.

## After deploying

- Submit a test lead and confirm it appears in the `leads` table.
- Add the Google Tag Manager snippet to both pages in `frontend/`.
