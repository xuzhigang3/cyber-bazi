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
  summary_zh TEXT,
  summary_en TEXT,
  teaser_zh TEXT,
  teaser_en TEXT,
  full_report_zh TEXT,
  full_report_en TEXT,
  is_paid INTEGER DEFAULT 0,
  lang TEXT DEFAULT 'zh',
  input_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_input_hash ON reports(input_hash);

CREATE TABLE IF NOT EXISTS configs (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS ai_usage (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
