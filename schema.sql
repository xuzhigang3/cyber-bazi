-- Cloudflare D1 Database Schema
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  name TEXT,
  gender TEXT,
  date TEXT,
  time TEXT,
  location TEXT,
  email TEXT,
  bazi_year TEXT,
  bazi_month TEXT,
  bazi_day TEXT,
  bazi_hour TEXT,
  summary TEXT,
  teaser TEXT,
  full_report TEXT,
  is_paid INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
