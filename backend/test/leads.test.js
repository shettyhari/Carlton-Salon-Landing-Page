// Run with: npm test (from backend/ or the repo root)
const { test, before, after } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "carlton-test-"));
process.env.DB_CLIENT = "sqlite";
process.env.DB_FILE = path.join(tmpDir, "test.sqlite");
process.env.SERVE_FRONTEND = "false";

const app = require("../src/app");
const db = require("../src/db");

let server;
let base;

before(async () => {
  await db.migrate.latest();
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await db.destroy();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const post = (body, ip = "10.0.0.1") =>
  fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": ip },
    body: JSON.stringify(body)
  });

const validLead = {
  name: "Priya Sharma",
  phone: "+91 98765 43210",
  email: "Priya@Example.com",
  city: "Hyderabad, Telangana",
  capital_contribution: "₹1 Cr – ₹1.5 Cr",
  timeline: "Within 3 months",
  background: "Business owner",
  source: "Carlton franchise landing page",
  page: "https://example.com/"
};

test("health check reports the database as connected", async () => {
  const res = await fetch(`${base}/api/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { ok: true, database: "connected" });
});

test("valid lead is saved", async () => {
  const res = await post(validLead);
  assert.strictEqual(res.status, 201);
  const row = await db("leads").where({ phone: "+91 98765 43210" }).first();
  assert.ok(row);
  assert.strictEqual(row.email, "priya@example.com");
  assert.strictEqual(row.capital_contribution, "₹1 Cr – ₹1.5 Cr");
  assert.ok(row.created_at);
});

test("missing or invalid required fields are rejected", async () => {
  const res = await post({ name: "A", phone: "abc", email: "not-an-email" }, "10.0.0.2");
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.ok, false);
  assert.match(body.error, /full name/);
  assert.match(body.error, /phone/);
  assert.match(body.error, /email/);
});

test("honeypot submissions are accepted but not stored", async () => {
  const before = await db("leads").count({ n: "*" }).first();
  const res = await post({ ...validLead, phone: "+91 90000 00001", company_website: "spam.example" }, "10.0.0.3");
  assert.strictEqual(res.status, 201);
  const after = await db("leads").count({ n: "*" }).first();
  assert.strictEqual(Number(after.n), Number(before.n));
});

test("too many submissions from one IP are rate limited", async () => {
  let last;
  for (let i = 0; i < 11; i++) {
    last = await post({ ...validLead, phone: `+91 91111 1111${i % 10}` }, "10.0.0.9");
  }
  assert.strictEqual(last.status, 429);
});

test("malformed JSON returns 400", async () => {
  const res = await fetch(`${base}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{bad json"
  });
  assert.strictEqual(res.status, 400);
});
