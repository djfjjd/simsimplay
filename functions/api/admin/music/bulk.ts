import { ensureAdminSchema, jsonError, mapSong, type SongRow } from "../_schema";

interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
}

type TrackMetadata = {
  fileName: string;
  title?: string;
  slug?: string;
  category?: string;
  emotionTags?: string[];
  situationTags?: string[];
  timeTags?: string[];
  energyScore?: number;
  prompt?: string;
  status?: "draft" | "published";
};

const allowedCategories = ["수면", "불안완화", "우울회복", "집중", "새벽감성", "행운"];
const maxFiles = 100;
const maxFileSize = 100 * 1024 * 1024;

const songSelect = `
  SELECT
    songs.id,
    songs.category_id,
    categories.name AS category_name,
    songs.title,
    songs.slug,
    songs.prompt,
    songs.description,
    songs.mood_tags,
    songs.situation_tags,
    songs.time_tags,
    songs.energy_score,
    songs.status,
    songs.audio_url,
    songs.thumbnail_url,
    songs.youtube_url,
    songs.spotify_url,
    songs.apple_music_url,
    songs.duration,
    songs.created_at,
    songs.updated_at
  FROM songs
  LEFT JOIN categories ON categories.id = songs.category_id
`;

function normalizeFileTitle(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "track.mp3";
}

function slugBase(input: string) {
  return input
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "") || "music";
}

async function uniqueSongSlug(db: D1Database, input: string, used: Set<string>) {
  const base = slugBase(input);
  let slug = base;
  let suffix = 2;

  while (used.has(slug) || await db.prepare("SELECT id FROM songs WHERE slug = ? LIMIT 1").bind(slug).first()) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  used.add(slug);
  return slug;
}

function hasAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function analyzeTrack(fileName: string, metadata?: TrackMetadata) {
  const title = (metadata?.title || normalizeFileTitle(fileName)).trim() || "Untitled Track";
  const lower = `${fileName} ${title}`.toLowerCase();
  const korean = `${fileName} ${title}`;

  let category = metadata?.category && allowedCategories.includes(metadata.category)
    ? metadata.category
    : "행운";

  if (hasAny(lower, ["sleep", "night", "dream", "bed", "deep rest"]) || hasAny(korean, ["수면", "잠", "숙면", "밤"])) {
    category = "수면";
  } else if (hasAny(lower, ["anxiety", "calm", "relief", "breath"]) || hasAny(korean, ["불안", "진정", "호흡", "안정"])) {
    category = "불안완화";
  } else if (hasAny(lower, ["sad", "blue", "recovery", "heal"]) || hasAny(korean, ["우울", "회복", "치유", "위로"])) {
    category = "우울회복";
  } else if (hasAny(lower, ["focus", "study", "work", "coding", "lofi"]) || hasAny(korean, ["집중", "공부", "작업", "코딩"])) {
    category = "집중";
  } else if (hasAny(lower, ["dawn", "midnight", "early morning"]) || hasAny(korean, ["새벽", "몽환", "감성"])) {
    category = "새벽감성";
  } else if (hasAny(lower, ["luck", "fortune", "bright", "hope"]) || hasAny(korean, ["행운", "희망", "긍정", "운세"])) {
    category = "행운";
  }

  const tagsByCategory: Record<string, { emotion: string[]; situation: string[]; time: string[]; energy: number }> = {
    "수면": { emotion: ["수면", "평온"], situation: ["잠들기전", "명상"], time: ["밤"], energy: 18 },
    "불안완화": { emotion: ["불안", "평온"], situation: ["호흡", "휴식"], time: ["저녁"], energy: 28 },
    "우울회복": { emotion: ["우울", "회복"], situation: ["퇴근후", "감정정리"], time: ["저녁"], energy: 42 },
    "집중": { emotion: ["집중", "평온"], situation: ["공부", "작업"], time: ["오후"], energy: 64 },
    "새벽감성": { emotion: ["그리움", "명상"], situation: ["새벽", "독서"], time: ["새벽"], energy: 34 },
    "행운": { emotion: ["희망", "행복"], situation: ["아침", "출근길"], time: ["아침"], energy: 72 },
  };

  const preset = tagsByCategory[category];
  return {
    title,
    category,
    emotionTags: metadata?.emotionTags?.length ? metadata.emotionTags : preset.emotion,
    situationTags: metadata?.situationTags?.length ? metadata.situationTags : preset.situation,
    timeTags: metadata?.timeTags?.length ? metadata.timeTags : preset.time,
    energyScore: Number.isFinite(metadata?.energyScore) ? Math.max(0, Math.min(100, Math.round(Number(metadata?.energyScore)))) : preset.energy,
    prompt: metadata?.prompt?.trim() || `${category} mood, ${title}, warm ambient texture, gentle piano, clean mix, loopable, no vocal`,
    status: metadata?.status === "draft" ? "draft" : "published",
  };
}

function thumbnailForCategory(category: string) {
  const palettes: Record<string, [string, string]> = {
    "수면": ["#1d4ed8", "#0f172a"],
    "불안완화": ["#0f766e", "#082f49"],
    "우울회복": ["#7c3aed", "#1e1b4b"],
    "집중": ["#2563eb", "#111827"],
    "새벽감성": ["#9333ea", "#312e81"],
    "행운": ["#f59e0b", "#7c2d12"],
  };
  const [from, to] = palettes[category] || palettes["행운"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><circle cx="500" cy="78" r="86" fill="rgba(255,255,255,.14)"/><circle cx="106" cy="288" r="112" fill="rgba(255,255,255,.09)"/><text x="48" y="198" fill="white" font-family="Arial,sans-serif" font-size="42" font-weight="800">${category}</text><text x="50" y="236" fill="rgba(255,255,255,.7)" font-family="Arial,sans-serif" font-size="20">SimSimPlay</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function mediaUrl(key: string) {
  return `/api/media?key=${encodeURIComponent(key)}`;
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  if (!env.MEDIA) return jsonError("media storage is not configured", 500);

  await ensureAdminSchema(env.DB);

  const form = await request.formData().catch(() => null);
  if (!form) return jsonError("multipart form data is required");

  const files = form.getAll("files").filter((file): file is File => file instanceof File);
  if (files.length === 0) return jsonError("mp3 files are required");
  if (files.length > maxFiles) return jsonError(`up to ${maxFiles} files can be uploaded at once`, 413);

  let metadata: TrackMetadata[] = [];
  try {
    const parsed = JSON.parse(String(form.get("metadata") || "[]"));
    metadata = Array.isArray(parsed) ? parsed : [];
  } catch {
    return jsonError("metadata must be valid JSON");
  }
  const metadataByName = new Map(metadata.map((item) => [item.fileName, item]));

  const { results: categories } = await env.DB.prepare("SELECT id, name FROM categories").all<{ id: number; name: string }>();
  const categoryIdByName = new Map(categories.map((category) => [category.name, category.id]));
  const usedSlugs = new Set<string>();
  const uploadedSongs: SongRow[] = [];
  const errors: Array<{ fileName: string; error: string }> = [];

  for (const file of files) {
    try {
      if (file.size <= 0) throw new Error("file is empty");
      if (file.size > maxFileSize) throw new Error("file is too large");
      const contentType = file.type || "audio/mpeg";
      if (!contentType.startsWith("audio/") && !file.name.toLowerCase().endsWith(".mp3")) {
        throw new Error("mp3 file is required");
      }

      const analyzed = analyzeTrack(file.name, metadataByName.get(file.name));
      const categoryId = categoryIdByName.get(analyzed.category);
      if (!categoryId) throw new Error(`category not found: ${analyzed.category}`);

      const slug = await uniqueSongSlug(env.DB, metadataByName.get(file.name)?.slug || analyzed.title, usedSlugs);
      const key = `audio/bulk/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeFileName(file.name)}`;

      await env.MEDIA.put(key, file, {
        httpMetadata: {
          contentType,
          cacheControl: "public, max-age=31536000, immutable",
        },
        customMetadata: {
          originalName: file.name,
          slug,
          category: analyzed.category,
        },
      });

      const result = await env.DB.prepare(`
        INSERT INTO songs (
          category_id,
          title,
          slug,
          prompt,
          description,
          mood_tags,
          situation_tags,
          time_tags,
          energy_score,
          status,
          audio_url,
          thumbnail_url,
          youtube_url,
          spotify_url,
          apple_music_url,
          duration
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '#', '#', '#', '-')
      `).bind(
        categoryId,
        analyzed.title,
        slug,
        analyzed.prompt,
        `${analyzed.category} 분위기에 맞춰 자동 분류된 힐링음악입니다.`,
        JSON.stringify(analyzed.emotionTags),
        JSON.stringify(analyzed.situationTags),
        JSON.stringify(analyzed.timeTags),
        analyzed.energyScore,
        analyzed.status,
        mediaUrl(key),
        thumbnailForCategory(analyzed.category),
      ).run();

      const song = await env.DB.prepare(`${songSelect} WHERE songs.id = ?`)
        .bind(result.meta.last_row_id)
        .first<SongRow>();
      if (song) uploadedSongs.push(song);
    } catch (error) {
      errors.push({ fileName: file.name, error: error instanceof Error ? error.message : "upload failed" });
    }
  }

  return Response.json({
    songs: uploadedSongs.map(mapSong),
    errors,
    count: uploadedSongs.length,
  }, { status: errors.length > 0 && uploadedSongs.length === 0 ? 400 : 201 });
};
