-- Study material library: curator-approved video references and on-site learning notes.
-- Deploy only after reviewing current D1 data; apply with: npm run db:remote
CREATE TABLE IF NOT EXISTS study_resources (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('youtube','note')),
  title TEXT NOT NULL,
  url TEXT,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published','hidden')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_study_resources_lesson_status
  ON study_resources(lesson_id,status,created_at DESC);
