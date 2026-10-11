-- Manual setup for PostgreSQL.
-- Not needed if the backend runs with AUTO_MIGRATE=true, which creates this table itself.
-- Create the database first if needed:  CREATE DATABASE carlton_leads;

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_created_at_index ON leads (created_at);
CREATE INDEX IF NOT EXISTS leads_email_index ON leads (email);
