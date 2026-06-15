import { ensureAdminSchema, mapSong, type SongRow } from "./admin/_schema";

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

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  await ensureAdminSchema(env.DB);

  const { results } = await env.DB.prepare(`${songSelect} WHERE songs.status = 'published' ORDER BY songs.id DESC`).all<SongRow>();
  const songs = results.map(mapSong);

  return Response.json({ songs, tracks: songs });
};
