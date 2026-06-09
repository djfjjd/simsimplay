import { ensureAdminSchema, jsonError, mapPlaylist, type PlaylistRow } from "../admin/_schema";

type PlaylistPayload = {
  title?: unknown;
  description?: unknown;
  situation?: unknown;
  moodTag?: unknown;
  totalDuration?: unknown;
  songIds?: unknown;
};

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

const playlistSelect = `
  SELECT
    playlists.id,
    playlists.title,
    playlists.description,
    playlists.situation,
    playlists.mood_tag,
    COUNT(playlist_songs.song_id) AS song_count,
    playlists.total_duration,
    playlists.created_at,
    playlists.updated_at
  FROM playlists
  LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
`;

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  await ensureAdminSchema(env.DB);

  const { results } = await env.DB.prepare(
    `${playlistSelect} GROUP BY playlists.id ORDER BY playlists.id ASC`,
  ).all<PlaylistRow>();

  return Response.json({ playlists: results.map(mapPlaylist) });
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  await ensureAdminSchema(env.DB);

  const payload = await request.json<PlaylistPayload>().catch(() => null);
  const title = textValue(payload?.title);
  if (!title) return jsonError("title is required");

  const result = await env.DB.prepare(
    `
      INSERT INTO playlists (title, description, situation, mood_tag, total_duration)
      VALUES (?, ?, ?, ?, ?)
    `,
  )
    .bind(
      title,
      textValue(payload?.description),
      textValue(payload?.situation),
      textValue(payload?.moodTag),
      textValue(payload?.totalDuration),
    )
    .run();

  const playlistId = Number(result.meta.last_row_id);
  const songIds = Array.isArray(payload?.songIds)
    ? payload.songIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)
    : [];

  if (songIds.length > 0) {
    await env.DB.batch(
      songIds.map((songId, index) =>
        env.DB.prepare(
          "INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)",
        ).bind(playlistId, songId, index),
      ),
    );
  }

  const playlist = await env.DB.prepare(
    `${playlistSelect} WHERE playlists.id = ? GROUP BY playlists.id`,
  )
    .bind(playlistId)
    .first<PlaylistRow>();

  return Response.json({ playlist: playlist ? mapPlaylist(playlist) : null }, { status: 201 });
};
