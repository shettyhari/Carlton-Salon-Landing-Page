// Server-side validation for lead form submissions.
// Mirrors the checks in frontend/index.html so bad data never reaches the database.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+0-9\s-]{10,15}$/;

const OPTIONAL_FIELDS = {
  city: 120,
  capital_contribution: 60,
  timeline: 60,
  background: 80,
  source: 120,
  page: 500
};

function clean(value, max) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim().replace(/\s+/g, " ");
  return text ? text.slice(0, max) : null;
}

function validateLead(body) {
  const errors = [];
  const name = clean(body.name, 120);
  const phone = clean(body.phone, 20);
  const email = clean(body.email, 160);

  if (!name || name.length < 2) errors.push("Please enter your full name.");
  if (!phone || !PHONE_RE.test(phone) || phone.replace(/\D/g, "").length < 10) {
    errors.push("Please enter a valid phone number.");
  }
  if (!email || !EMAIL_RE.test(email)) errors.push("Please enter a valid email address.");

  const lead = { name, phone, email: email && email.toLowerCase() };
  for (const [field, max] of Object.entries(OPTIONAL_FIELDS)) {
    lead[field] = clean(body[field], max);
  }

  return { errors, lead };
}

module.exports = { validateLead };
