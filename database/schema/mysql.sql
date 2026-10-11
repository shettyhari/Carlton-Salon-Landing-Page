-- Manual setup for MySQL / MariaDB (e.g. via phpMyAdmin).
-- Not needed if the backend runs with AUTO_MIGRATE=true, which creates this table itself.

CREATE DATABASE IF NOT EXISTS carlton_leads CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE carlton_leads;

CREATE TABLE IF NOT EXISTS leads (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(160) NOT NULL,
  city VARCHAR(120) NULL,
  capital_contribution VARCHAR(60) NULL,
  timeline VARCHAR(60) NULL,
  background VARCHAR(80) NULL,
  source VARCHAR(120) NULL,
  page VARCHAR(500) NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(300) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX leads_created_at_index (created_at),
  INDEX leads_email_index (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
