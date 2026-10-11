// Entry point for Vercel serverless functions (see /api/index.js and vercel.json).
// Vercel runs the Express app per request instead of a long-running server, so this:
//   1. refuses to use SQLite (Vercel's disk is temporary, leads would be lost)
//   2. creates/updates the leads table once per cold start, then hands off to the app

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
const dbClient = (process.env.DB_CLIENT || "").toLowerCase();
const hasDatabase = ["mysql", "postgres", "postgresql"].includes(dbClient) || /^(postgres(ql)?|mysql):\/\//i.test(url);

let app;
let ready;

function notConfigured(req, res) {
  console.error("No database configured: set DATABASE_URL (or POSTGRES_URL) in Vercel environment variables.");
  res.statusCode = 503;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: false, error: "Our form is temporarily unavailable. Please try again later." }));
}

module.exports = async function handler(req, res) {
  if (!hasDatabase) return notConfigured(req, res);

  if (!ready) {
    app = require("./app");
    const db = require("./db");
    ready = process.env.AUTO_MIGRATE === "false" ? Promise.resolve() : db.migrate.latest();
  }

  try {
    await ready;
  } catch (err) {
    ready = null;
    console.error("Database migration failed:", err.message);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: "Our form is temporarily unavailable. Please try again later." }));
  }

  return app(req, res);
};
