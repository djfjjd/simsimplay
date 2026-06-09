import {
  clampEnergyScore,
  ensureAdminSchema,
  jsonError,
  mapSong,
  normalizeTags,
  type SongRow,
} from "../admin/_schema";

type SongPayload = {
  categoryId?: unknown;
  title?: unknown;
  prompt?: unknown;
  description?: unknown;
  emotionTags?: unknown;
  situationTags?: unknown;
  timeTags?: unknown;
  energyScore?: unknown;
  audioUrl?: unknown;
  thumbnailUrl?: unknown;
  youtubeUrl?: unknown;
  spotifyUrl?: unknown;
  appleMusicUrl?: unknown;
  duration?: unknown;
};

const songSelect = `
  SELECT
    songs.id,
    songs.category_id,
    categories.name AS category_name,
    songs.title,
    songs.prompt,
    songs.description,
    songs.mood_tags,
    songs.situation_tags,
    songs.time_tags,
    songs.energy_score,
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

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function optionalUrl(value: unknown, fallback = "#") {
  const url = textValue(value);
  return url || fallback;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  await ensureAdminSchema(env.DB);

  const url = new URL(request.url);
  const category = url.searchParams.get("category")?.trim();
  const mood = url.searchParams.get("mood")?.trim();
  const search = url.searchParams.get("search")?.trim();
  
  const params: string[] = [];
  const filters: string[] = [];

  if (category) {
    filters.push("categories.name = ?");
    params.push(category);
  }

  if (mood) {
    filters.push("(songs.mood_tags LIKE ? OR songs.situation_tags LIKE ? OR songs.time_tags LIKE ?)");
    params.push(`%${mood}%`, `%${mood}%`, `%${mood}%`);
  }

  if (search) {
    filters.push("(songs.title LIKE ? OR songs.description LIKE ? OR songs.prompt LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const { results } = await env.DB.prepare(`${songSelect}${where} ORDER BY songs.id DESC`)
    .bind(...params)
    .all<SongRow>();

  return Response.json({ songs: results.map(mapSong) });
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  await ensureAdminSchema(env.DB);

  const payload = await request.json<SongPayload>().catch(() => null);
  const title = textValue(payload?.title);
  const categoryId =
    typeof payload?.categoryId === "number" ? Math.trunc(payload.categoryId) : null;

  if (!title) return jsonError("title is required");

  if (categoryId) {
    const category = await env.DB.prepare("SELECT id FROM categories WHERE id = ?")
      .bind(categoryId)
      .first<{ id: number }>();
    if (!category) return jsonError("category not found", 404);
  }

  const emotionTags = normalizeTags(payload?.emotionTags);
  const situationTags = normalizeTags(payload?.situationTags);
  const timeTags = normalizeTags(payload?.timeTags);
  
  const result = await env.DB.prepare(
    `
      INSERT INTO songs (
        category_id,
        title,
        prompt,
        description,
        mood_tags,
        situation_tags,
        time_tags,
        energy_score,
        audio_url,
        thumbnail_url,
        youtube_url,
        spotify_url,
        apple_music_url,
        duration
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      categoryId,
      title,
      textValue(payload?.prompt),
      textValue(payload?.description),
      JSON.stringify(emotionTags),
      JSON.stringify(situationTags),
      JSON.stringify(timeTags),
      clampEnergyScore(payload?.energyScore),
      optionalUrl(payload?.audioUrl),
      textValue(payload?.thumbnailUrl),
      optionalUrl(payload?.youtubeUrl),
      optionalUrl(payload?.spotifyUrl),
      optionalUrl(payload?.appleMusicUrl),
      textValue(payload?.duration, "-") || "-",
    )
    .run();

  const song = await env.DB.prepare(`${songSelect} WHERE songs.id = ?`)
    .bind(result.meta.last_row_id)
    .first<SongRow>();

  return Response.json({ song: song ? mapSong(song) : null }, { status: 201 });
};
