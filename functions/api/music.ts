import { ensureAdminSchema } from "./admin/_schema";

type MusicRow = {
  id: number;
  category_id: number;
  category_name: string;
  title: string;
  source_type: "youtube" | "spotify";
  source_url: string;
  created_at: string;
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  await ensureAdminSchema(env.DB);

  const { results } = await env.DB.prepare(
    `
      SELECT
        music_tracks.id,
        music_tracks.category_id,
        music_categories.name AS category_name,
        music_tracks.title,
        music_tracks.source_type,
        music_tracks.source_url,
        music_tracks.created_at
      FROM music_tracks
      JOIN music_categories ON music_categories.id = music_tracks.category_id
      ORDER BY music_tracks.id DESC
    `,
  ).all<MusicRow>();

  return Response.json({ tracks: results });
};

