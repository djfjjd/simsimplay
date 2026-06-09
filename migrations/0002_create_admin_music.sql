CREATE TABLE IF NOT EXISTS music_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS music_tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('youtube', 'spotify')),
  source_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES music_categories(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO music_categories (name) VALUES
  ('수면'),
  ('집중'),
  ('명상'),
  ('행운'),
  ('우울'),
  ('불안');

