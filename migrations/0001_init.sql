CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'news',
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  source_url TEXT,
  publisher TEXT,
  venue TEXT,
  event_date TEXT,
  origin TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','quarantined','deleted','rejected')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_articles_status_date ON articles(status, published_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_article_sources ON articles(source_url) WHERE source_url IS NOT NULL;

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'show',
  description TEXT NOT NULL DEFAULT '',
  venue TEXT,
  event_date TEXT,
  link_url TEXT,
  image_url TEXT,
  source_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','quarantined','deleted','rejected')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_promotions_status_event ON promotions(status,event_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_promotions_links ON promotions(link_url) WHERE link_url IS NOT NULL;

CREATE TABLE IF NOT EXISTS marketplace (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'props',
  description TEXT NOT NULL DEFAULT '',
  price_krw INTEGER NOT NULL DEFAULT 0 CHECK(price_krw>=0),
  item_condition TEXT NOT NULL DEFAULT 'used',
  region TEXT,
  seller_alias TEXT NOT NULL,
  contact_url TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','quarantined','deleted','rejected','sold')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_marketplace_status_date ON marketplace(status,published_at DESC);

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'sidebar',
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS feed_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  feed_url TEXT NOT NULL UNIQUE,
  allowed_host TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'news' CHECK(kind IN ('news','show')),
  verified INTEGER NOT NULL DEFAULT 0,
  auto_publish INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 0,
  last_checked_at TEXT
);
CREATE TABLE IF NOT EXISTS moderation_logs (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS issue_articles (
  issue_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  PRIMARY KEY (issue_id,article_id),
  FOREIGN KEY(issue_id) REFERENCES issues(id),
  FOREIGN KEY(article_id) REFERENCES articles(id)
);
