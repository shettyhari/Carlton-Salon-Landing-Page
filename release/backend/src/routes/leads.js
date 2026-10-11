const express = require("express");
const db = require("../db");
const { validateLead } = require("../validate");

const router = express.Router();

// Simple in-memory rate limit: max 10 submissions per IP per 10 minutes
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

router.post("/", async (req, res) => {
  const body = req.body || {};

  // Honeypot: real visitors never see or fill this field
  if (body.company_website) {
    return res.status(201).json({ ok: true });
  }

  if (rateLimited(req.ip)) {
    return res.status(429).json({ ok: false, error: "Too many submissions. Please try again in a few minutes." });
  }

  const { errors, lead } = validateLead(body);
  if (errors.length) {
    return res.status(400).json({ ok: false, error: errors.join(" ") });
  }

  try {
    await db("leads").insert({
      ...lead,
      ip_address: req.ip ? String(req.ip).slice(0, 64) : null,
      user_agent: (req.get("user-agent") || "").slice(0, 300) || null
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Failed to save lead:", err.message);
    return res.status(500).json({ ok: false, error: "Could not save your details. Please try again." });
  }
});

module.exports = router;
