ALTER TABLE songs ADD COLUMN slug TEXT NOT NULL DEFAULT '';
ALTER TABLE songs ADD COLUMN status TEXT NOT NULL DEFAULT 'published';

CREATE INDEX IF NOT EXISTS idx_songs_slug ON songs(slug);
CREATE INDEX IF NOT EXISTS idx_songs_status_id ON songs(status, id);

INSERT OR IGNORE INTO categories (name) VALUES
  ('우울회복'),
  ('새벽감성');
