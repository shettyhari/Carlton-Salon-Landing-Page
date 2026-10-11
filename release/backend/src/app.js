const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const db = require("./db");
const leadsRouter = require("./routes/leads");

const app = express();

// Behind Nginx / a hosting proxy, use the visitor's real IP for rate limiting
app.set("trust proxy", process.env.TRUST_PROXY === "false" ? false : 1);
app.disable("x-powered-by");

// CORS is only needed when the frontend is hosted on a different domain from the API.
// List allowed origins in CORS_ORIGINS, comma-separated.
const origins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
if (origins.length) {
  app.use("/api", cors({ origin: origins, methods: ["POST", "GET"] }));
}

app.use(express.json({ limit: "20kb" }));

app.get("/api/health", async (req, res) => {
  try {
    await db.raw("select 1");
    res.json({ ok: true, database: "connected" });
  } catch (err) {
    res.status(503).json({ ok: false, database: "unavailable" });
  }
});

app.use("/api/leads", leadsRouter);

app.use("/api", (req, res) => res.status(404).json({ ok: false, error: "Not found" }));

// Optionally serve the landing page from the same server (default: on)
const frontendDir = path.resolve(__dirname, "..", process.env.FRONTEND_DIR || "../frontend");
if (process.env.SERVE_FRONTEND !== "false" && fs.existsSync(frontendDir)) {
  app.use(express.static(frontendDir, { extensions: ["html"] }));
}

// Malformed JSON and other errors
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed" || err.type === "entity.too.large") {
    return res.status(400).json({ ok: false, error: "Invalid request." });
  }
  console.error(err);
  res.status(500).json({ ok: false, error: "Something went wrong." });
});

module.exports = app;
