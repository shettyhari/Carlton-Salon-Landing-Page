// Database connection settings. Pick the database with DB_CLIENT in .env:
//   sqlite (default, local testing) | mysql | postgres
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const fs = require("fs");
const path = require("path");

// In the repo, migrations live in ../database/migrations.
// In release/backend, the build copies them into ./migrations.
const migrationsDir = [path.join(__dirname, "../database/migrations"), path.join(__dirname, "migrations")]
  .find((dir) => fs.existsSync(dir));

const client = (process.env.DB_CLIENT || "sqlite").toLowerCase();

function connectionFor(name) {
  if (name === "sqlite") {
    const file = path.resolve(__dirname, process.env.DB_FILE || "data/leads.sqlite");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    return { client: "better-sqlite3", connection: { filename: file }, useNullAsDefault: true };
  }

  const url = process.env.DATABASE_URL;
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
    const ssl = process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false;
    return { client: "pg", connection: url ? { connectionString: url, ssl } : { ...fields, ssl } };
  }
  throw new Error(`Unsupported DB_CLIENT "${name}". Use sqlite, mysql or postgres.`);
}

module.exports = {
  ...connectionFor(client),
  pool: client === "sqlite" ? undefined : { min: 0, max: 10 },
  migrations: { directory: migrationsDir, tableName: "knex_migrations" }
};
