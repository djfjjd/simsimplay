import {
  clampEnergyScore,
  ensureAdminSchema,
  jsonError,
  mapSong,
  normalizeTags,
  parseOptionalId,
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

function routeId(request: Request) {
  const value = new URL(request.url).pathname.split("/").filter(Boolean).pop();
  return Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
}

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function optionalUrl(value: unknown, fallback = "#") {
  const url = textValue(value);
  return url || fallback;
}

export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  await ensureAdminSchema(env.DB);

  const id = routeId(request);
  if (!id) return jsonError("song id is required");

  const payload = await request.json<SongPayload>().catch(() => null);
  const title = textValue(payload?.title);
  const categoryId = parseOptionalId(payload?.categoryId);

  if (!title) return jsonError("title is required");

  if (categoryId) {
    const category = await env.DB.prepare("SELECT id FROM categories WHERE id = ?")
      .bind(categoryId)
      .first<{ id: number }>();
    if (!category) return jsonError("category not found", 404);
  }

  const existing = await env.DB.prepare("SELECT id FROM songs WHERE id = ?")
    .bind(id)
    .first<{ id: number }>();
  if (!existing) return jsonError("song not found", 404);

  await env.DB.prepare(
    `
      UPDATE songs
      SET
        category_id = ?,
        title = ?,
        prompt = ?,
        description = ?,
        mood_tags = ?,
        situation_tags = ?,
        time_tags = ?,
        energy_score = ?,
        audio_url = ?,
        thumbnail_url = ?,
        youtube_url = ?,
        spotify_url = ?,
        apple_music_url = ?,
        duration = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
  )
    .bind(
      categoryId,
      title,
      textValue(payload?.prompt),
      textValue(payload?.description),
      JSON.stringify(normalizeTags(payload?.emotionTags)),
      JSON.stringify(normalizeTags(payload?.situationTags)),
      JSON.stringify(normalizeTags(payload?.timeTags)),
      clampEnergyScore(payload?.energyScore),
      optionalUrl(payload?.audioUrl),
      textValue(payload?.thumbnailUrl),
      optionalUrl(payload?.youtubeUrl),
      optionalUrl(payload?.spotifyUrl),
      optionalUrl(payload?.appleMusicUrl),
      textValue(payload?.duration, "-") || "-",
      id,
    )
    .run();

  const song = await env.DB.prepare(`${songSelect} WHERE songs.id = ?`)
    .bind(id)
    .first<SongRow>();

  return Response.json({ song: song ? mapSong(song) : null });
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  await ensureAdminSchema(env.DB);

  const id = routeId(request);
  if (!id) return jsonError("song id is required");

  await env.DB.prepare("DELETE FROM songs WHERE id = ?").bind(id).run();

  return Response.json({ ok: true });
};
