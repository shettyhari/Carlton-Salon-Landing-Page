-- Manual setup for SQLite.
-- Not needed if the backend runs with AUTO_MIGRATE=true, which creates this table itself.

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(160) NOT NULL,
  city VARCHAR(120),
  capital_contribution VARCHAR(60),
  timeline VARCHAR(60),
  background VARCHAR(80),
  source VARCHAR(120),
  page VARCHAR(500),
  ip_address VARCHAR(64),
  user_agent VARCHAR(300),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS leads_created_at_index ON leads (created_at);
CREATE INDEX IF NOT EXISTS leads_email_index ON leads (email);
