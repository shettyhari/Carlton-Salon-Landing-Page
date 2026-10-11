// Database connection settings. Pick the database with DB_CLIENT in .env:
//   sqlite (default, local testing) | mysql | postgres
// If DB_CLIENT is not set but DATABASE_URL / POSTGRES_URL is, the type is taken from the URL.
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const fs = require("fs");
const path = require("path");

// In the repo, migrations live in ../database/migrations.
// In release/backend, the build copies them into ./migrations.
const migrationsDir = [path.join(__dirname, "../database/migrations"), path.join(__dirname, "migrations")]
  .find((dir) => fs.existsSync(dir));

// Vercel Postgres / Neon integrations provide POSTGRES_URL
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

function detectClient() {
  if (process.env.DB_CLIENT) return process.env.DB_CLIENT.toLowerCase();
  if (/^postgres(ql)?:\/\//i.test(url)) return "postgres";
  if (/^mysql:\/\//i.test(url)) return "mysql";
  return "sqlite";
}

const client = detectClient();

function sslOption() {
  // Leave SSL to the connection URL (e.g. ?sslmode=require) unless DB_SSL is set
  if (process.env.DB_SSL === "true") return { rejectUnauthorized: false };
  if (process.env.DB_SSL === "false") return false;
  return undefined;
}

function connectionFor(name) {
  if (name === "sqlite") {
    const file = path.resolve(__dirname, process.env.DB_FILE || "data/leads.sqlite");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    return { client: "better-sqlite3", connection: { filename: file }, useNullAsDefault: true };
  }

  const fields = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || (name === "mysql" ? 3306 : 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  if (name === "mysql") {
    return { client: "mysql2", connection: url || { ...fields, charset: "utf8mb4" } };
  }
  if (name === "postgres" || name === "postgresql") {
    const ssl = sslOption();
    const conn = url ? { connectionString: url } : fields;
    return { client: "pg", connection: ssl === undefined ? conn : { ...conn, ssl } };
  }
  throw new Error(`Unsupported DB_CLIENT "${name}". Use sqlite, mysql or postgres.`);
}

module.exports = {
  ...connectionFor(client),
  pool: client === "sqlite" ? undefined : { min: 0, max: process.env.VERCEL ? 2 : 10 },
  migrations: { directory: migrationsDir, tableName: "knex_migrations" }
};

module.exports.clientName = client;
