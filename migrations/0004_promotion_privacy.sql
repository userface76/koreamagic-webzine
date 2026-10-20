-- Stage promotion video/media and restricted contact information.
ALTER TABLE promotions ADD COLUMN video_url TEXT;
ALTER TABLE promotions ADD COLUMN contact_phone TEXT;
ALTER TABLE promotions ADD COLUMN contact_consent_at TEXT;
ALTER TABLE promotions ADD COLUMN contact_deleted_at TEXT;
CREATE INDEX IF NOT EXISTS idx_promotions_privacy_retention ON promotions(event_date,created_at) WHERE contact_phone IS NOT NULL;
