const defaultCategories = [
  "수면",
  "집중",
  "명상",
  "행운",
  "우울",
  "우울회복",
  "불안",
  "불안완화",
  "새벽감성",
  "긍정에너지",
  "감정회복",
];

const defaultPlaylists = [
  {
    title: "잠들기 전 마음정리",
    description: "생각이 많아 쉽게 잠들기 어려운 밤을 위한 음악 모음",
    situation: "잠들기 전",
    moodTag: "수면",
    totalDuration: "48분",
  },
  {
    title: "출근길 긍정 에너지",
    description: "하루를 시작하기 전 기분을 끌어올리고 싶을 때",
    situation: "출근길",
    moodTag: "긍정",
    totalDuration: "36분",
  },
  {
    title: "불안할 때 듣는 음악",
    description: "걱정과 초조함이 반복될 때 마음을 천천히 정리하는 음악",
    situation: "불안할 때",
    moodTag: "불안완화",
    totalDuration: "55분",
  },
  {
    title: "우울한 날 회복 음악",
    description: "마음이 무겁고 에너지가 낮은 날을 위한 회복 음악",
    situation: "우울한 날",
    moodTag: "회복",
    totalDuration: "42분",
  },
  {
    title: "공부와 코딩 집중 음악",
    description: "집중은 필요하지만 자극적인 소리는 피하고 싶을 때",
    situation: "공부와 코딩",
    moodTag: "집중",
    totalDuration: "64분",
  },
  {
    title: "새벽 감성 명상 음악",
    description: "조용한 새벽에 마음을 차분히 바라보고 싶을 때",
    situation: "새벽",
    moodTag: "명상",
    totalDuration: "38분",
  },
];

export async function ensureAdminSchema(db: D1Database) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        title TEXT NOT NULL,
        slug TEXT NOT NULL DEFAULT '',
        prompt TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        mood_tags TEXT NOT NULL DEFAULT '[]',
        situation_tags TEXT NOT NULL DEFAULT '[]',
        time_tags TEXT NOT NULL DEFAULT '[]',
        energy_score INTEGER NOT NULL DEFAULT 50,
        status TEXT NOT NULL DEFAULT 'published',
        audio_url TEXT NOT NULL DEFAULT '#',
        thumbnail_url TEXT NOT NULL DEFAULT '',
        youtube_url TEXT NOT NULL DEFAULT '#',
        spotify_url TEXT NOT NULL DEFAULT '#',
        apple_music_url TEXT NOT NULL DEFAULT '#',
        duration TEXT NOT NULL DEFAULT '-',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL DEFAULT '',
        situation TEXT NOT NULL DEFAULT '',
        mood_tag TEXT NOT NULL DEFAULT '',
        total_duration TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS playlist_songs (
        playlist_id INTEGER NOT NULL,
        song_id INTEGER NOT NULL,
        position INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (playlist_id, song_id),
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
  ]);

  // Ensure columns exist (for local dev where ensureAdminSchema runs repeatedly)
  try {
    await db.prepare("ALTER TABLE songs ADD COLUMN prompt TEXT NOT NULL DEFAULT ''").run();
  } catch {}
  try {
    await db.prepare("ALTER TABLE songs ADD COLUMN slug TEXT NOT NULL DEFAULT ''").run();
  } catch {}
  try {
    await db.prepare("ALTER TABLE songs ADD COLUMN status TEXT NOT NULL DEFAULT 'published'").run();
  } catch {}
  try {
    await db.prepare("ALTER TABLE songs ADD COLUMN time_tags TEXT NOT NULL DEFAULT '[]'").run();
  } catch {}
  try {
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_songs_slug ON songs(slug)").run();
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_songs_status_id ON songs(status, id)").run();
  } catch {}
  try {
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)").run();
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts(status, created_at)").run();
  } catch {}

  try {
    await normalizeExistingPostSlugs(db);
  } catch {}

  await db.batch(
    defaultCategories.map((name) =>
      db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)").bind(name),
    ),
  );

  await db.batch(
    defaultPlaylists.map((playlist) =>
      db
        .prepare(
          `
            INSERT OR IGNORE INTO playlists
              (title, description, situation, mood_tag, total_duration)
            VALUES (?, ?, ?, ?, ?)
          `,
        )
        .bind(
          playlist.title,
          playlist.description,
          playlist.situation,
          playlist.moodTag,
          playlist.totalDuration,
        ),
    ),
  );
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export type SongRow = {
  id: number;
  category_id: number | null;
  category_name: string | null;
  title: string;
  slug: string;
  prompt: string;
  description: string;
  mood_tags: string;
  situation_tags: string;
  time_tags: string;
  energy_score: number;
  status: string;
  audio_url: string;
  thumbnail_url: string;
  youtube_url: string;
  spotify_url: string;
  apple_music_url: string;
  duration: string;
  created_at: string;
  updated_at: string;
};

export type PlaylistRow = {
  id: number;
  title: string;
  description: string;
  situation: string;
  mood_tag: string;
  song_count: number;
  total_duration: string;
  created_at: string;
  updated_at: string;
};

export type PostRow = {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  tags: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export function mapPost(row: PostRow) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    description: row.description,
    content: row.content,
    tags: parseJsonArray(row.tags),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createSlugBase(input: string, fallback = "post") {
  const slug = input
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");

  return slug || fallback;
}

export async function ensureUniquePostSlug(db: D1Database, input: string, currentId?: number | string | null) {
  const base = createSlugBase(input, currentId ? `post-${currentId}` : "post");
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = currentId
      ? await db.prepare("SELECT id FROM posts WHERE slug = ? AND id != ? LIMIT 1").bind(slug, currentId).first<{ id: number }>()
      : await db.prepare("SELECT id FROM posts WHERE slug = ? LIMIT 1").bind(slug).first<{ id: number }>();

    if (!existing) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function normalizeExistingPostSlugs(db: D1Database) {
  const { results } = await db.prepare("SELECT id, title, slug FROM posts ORDER BY id ASC").all<Pick<PostRow, "id" | "title" | "slug">>();
  const reserved = new Set((results || []).map((row) => (row.slug || "").trim()).filter(Boolean));
  const used = new Set<string>();

  for (const row of results || []) {
    const currentSlug = (row.slug || "").trim();
    let nextSlug = currentSlug;

    if (!nextSlug || used.has(nextSlug)) {
      const base = createSlugBase(row.title, `post-${row.id}`);
      nextSlug = base;
      let suffix = 2;

      while (used.has(nextSlug) || reserved.has(nextSlug)) {
        nextSlug = `${base}-${suffix}`;
        suffix += 1;
      }
    }

    used.add(nextSlug);

    if (row.slug !== nextSlug) {
      await db
        .prepare("UPDATE posts SET slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(nextSlug, row.id)
        .run();
    }
  }
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

export function clampEnergyScore(value: unknown) {
  const score =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 50;
  if (!Number.isFinite(score)) return 50;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function parseOptionalId(value: unknown) {
  const id =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : 0;
  return Number.isFinite(id) && id > 0 ? Math.trunc(id) : null;
}

export function mapSong(row: SongRow) {
  const moodTags = parseJsonArray(row.mood_tags);

  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name ?? "미분류",
    title: row.title,
    slug: row.slug || "",
    prompt: row.prompt || "",
    description: row.description,
    emotionTags: moodTags,
    moodTags,
    situationTags: parseJsonArray(row.situation_tags),
    timeTags: parseJsonArray(row.time_tags),
    energyScore: row.energy_score,
    status: row.status || "published",
    audioUrl: row.audio_url,
    thumbnailUrl: row.thumbnail_url,
    youtubeUrl: row.youtube_url,
    spotifyUrl: row.spotify_url,
    appleMusicUrl: row.apple_music_url,
    duration: row.duration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPlaylist(row: PlaylistRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    situation: row.situation,
    moodTag: row.mood_tag,
    songCount: row.song_count,
    totalDuration: row.total_duration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
