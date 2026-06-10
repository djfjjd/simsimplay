import {
  clampEnergyScore,
  ensureAdminSchema,
  jsonError,
  mapSong,
  normalizeTags,
  parseOptionalId,
  type SongRow,
} from "./_schema";

type MusicPayload = {
  id?: unknown;
  categoryId?: unknown;
  title?: unknown;
  description?: unknown;
  moodTags?: unknown;
  situationTags?: unknown;
  energyScore?: unknown;
  audioUrl?: unknown;
  thumbnailUrl?: unknown;
  youtubeUrl?: unknown;
  spotifyUrl?: unknown;
  appleMusicUrl?: unknown;
  duration?: unknown;
  sourceUrl?: unknown;
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

function linkPayload(payload: MusicPayload | null) {
  const sourceUrl = textValue(payload?.sourceUrl);
  const youtubeUrl = textValue(payload?.youtubeUrl) || (sourceUrl.includes("youtu") ? sourceUrl : "#");
  const spotifyUrl = textValue(payload?.spotifyUrl) || (sourceUrl.includes("spotify") ? sourceUrl : "#");
  return { youtubeUrl, spotifyUrl };
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  await ensureAdminSchema(env.DB);

  const { results } = await env.DB.prepare(`${songSelect} ORDER BY songs.id DESC`).all<SongRow>();

  return Response.json({ tracks: results.map(mapSong), songs: results.map(mapSong) });
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  await ensureAdminSchema(env.DB);

  const payload = await request.json<MusicPayload>().catch(() => null);
  const title = textValue(payload?.title);
  const categoryId = parseOptionalId(payload?.categoryId);

  if (!title) return jsonError("title is required");
  if (!categoryId) return jsonError("categoryId is required");

  const category = await env.DB.prepare("SELECT id FROM categories WHERE id = ?")
    .bind(categoryId)
    .first<{ id: number }>();
  if (!category) return jsonError("category not found", 404);

  const links = linkPayload(payload);
  const result = await env.DB.prepare(
    `
      INSERT INTO songs (
        category_id,
        title,
        description,
        mood_tags,
        situation_tags,
        energy_score,
        audio_url,
        thumbnail_url,
        youtube_url,
        spotify_url,
        apple_music_url,
        duration
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      categoryId,
      title,
      textValue(payload?.description),
      JSON.stringify(normalizeTags(payload?.moodTags)),
      JSON.stringify(normalizeTags(payload?.situationTags)),
      clampEnergyScore(payload?.energyScore),
      optionalUrl(payload?.audioUrl),
      textValue(payload?.thumbnailUrl),
      links.youtubeUrl,
      links.spotifyUrl,
      optionalUrl(payload?.appleMusicUrl),
      textValue(payload?.duration, "-") || "-",
    )
    .run();

  const song = await env.DB.prepare(`${songSelect} WHERE songs.id = ?`)
    .bind(result.meta.last_row_id)
    .first<SongRow>();

  return Response.json({ track: song ? mapSong(song) : null, song: song ? mapSong(song) : null }, { status: 201 });
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  await ensureAdminSchema(env.DB);

  const payload = await request.json<MusicPayload>().catch(() => null);
  const id = typeof payload?.id === "number" ? Math.trunc(payload.id) : 0;

  if (!id) return jsonError("music id is required");

  await env.DB.prepare("DELETE FROM songs WHERE id = ?").bind(id).run();

  return Response.json({ ok: true });
};
