-- Migration 0001: Initial schema for qr_codes and scan_log
CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY,
  target_url TEXT NOT NULL,
  design TEXT NOT NULL DEFAULT 'classic',
  max_scans INTEGER,
  scan_count INTEGER NOT NULL DEFAULT 0,
  unique_scan_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS scan_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qr_id TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  scanned_at INTEGER NOT NULL,
  FOREIGN KEY (qr_id) REFERENCES qr_codes(id)
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_scan_log_qr_id ON scan_log(qr_id);
CREATE INDEX IF NOT EXISTS idx_scan_log_visitor ON scan_log(qr_id, visitor_hash);
