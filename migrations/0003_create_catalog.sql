CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  mood_tags TEXT NOT NULL DEFAULT '[]',
  situation_tags TEXT NOT NULL DEFAULT '[]',
  energy_score INTEGER NOT NULL DEFAULT 50,
  audio_url TEXT NOT NULL DEFAULT '#',
  thumbnail_url TEXT NOT NULL DEFAULT '',
  youtube_url TEXT NOT NULL DEFAULT '#',
  spotify_url TEXT NOT NULL DEFAULT '#',
  apple_music_url TEXT NOT NULL DEFAULT '#',
  duration TEXT NOT NULL DEFAULT '-',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS playlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  situation TEXT NOT NULL DEFAULT '',
  mood_tag TEXT NOT NULL DEFAULT '',
  total_duration TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id INTEGER NOT NULL,
  song_id INTEGER NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (playlist_id, song_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO categories (name) VALUES
  ('수면'),
  ('집중'),
  ('명상'),
  ('행운'),
  ('우울'),
  ('불안'),
  ('불안완화'),
  ('긍정에너지'),
  ('감정회복');

INSERT OR IGNORE INTO playlists
  (title, description, situation, mood_tag, total_duration)
VALUES
  ('잠들기 전 마음정리', '생각이 많아 쉽게 잠들기 어려운 밤을 위한 음악 모음', '잠들기 전', '수면', '48분'),
  ('출근길 긍정 에너지', '하루를 시작하기 전 기분을 끌어올리고 싶을 때', '출근길', '긍정', '36분'),
  ('불안할 때 듣는 음악', '걱정과 초조함이 반복될 때 마음을 천천히 정리하는 음악', '불안할 때', '불안완화', '55분'),
  ('우울한 날 회복 음악', '마음이 무겁고 에너지가 낮은 날을 위한 회복 음악', '우울한 날', '회복', '42분'),
  ('공부와 코딩 집중 음악', '집중은 필요하지만 자극적인 소리는 피하고 싶을 때', '공부와 코딩', '집중', '64분'),
  ('새벽 감성 명상 음악', '조용한 새벽에 마음을 차분히 바라보고 싶을 때', '새벽', '명상', '38분');
