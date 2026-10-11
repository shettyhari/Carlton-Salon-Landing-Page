require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const app = require("./app");
const db = require("./db");

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  if (process.env.AUTO_MIGRATE !== "false") {
    const [, applied] = await db.migrate.latest();
    if (applied.length) console.log("Applied migrations:", applied.join(", "));
  }
  app.listen(PORT, () => {
    console.log(`Carlton landing backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
