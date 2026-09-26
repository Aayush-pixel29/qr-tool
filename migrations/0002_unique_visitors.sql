-- Migration 0002: Add unique visitor tracking columns and index
ALTER TABLE qr_codes ADD COLUMN unique_scan_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE scan_log ADD COLUMN visitor_hash TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_scan_log_visitor ON scan_log(qr_id, visitor_hash);
