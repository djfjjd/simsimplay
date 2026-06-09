import { ensureAdminSchema, jsonError } from "./_schema";

type MusicRow = {
  id: number;
  category_id: number;
  category_name: string;
  title: string;
  source_type: "youtube" | "spotify";
  source_url: string;
  created_at: string;
};

function detectSourceType(url: string): "youtube" | "spotify" | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("spotify.com")) return "spotify";
    return null;
  } catch {
    return null;
  }
}

function fallbackTitle(sourceType: "youtube" | "spotify", categoryName: string) {
  return `${categoryName} ${sourceType === "spotify" ? "Spotify" : "YouTube"} 음악`;
}

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

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  await ensureAdminSchema(env.DB);

  const payload = await request
    .json<{ categoryId?: unknown; title?: unknown; sourceUrl?: unknown }>()
    .catch(() => null);
  const categoryId =
    typeof payload?.categoryId === "number" ? Math.trunc(payload.categoryId) : 0;
  const sourceUrl =
    typeof payload?.sourceUrl === "string" ? payload.sourceUrl.trim() : "";
  const sourceType = detectSourceType(sourceUrl);

  if (!categoryId) return jsonError("categoryId is required");
  if (!sourceUrl) return jsonError("YouTube or Spotify link is required");
  if (!sourceType) return jsonError("Only YouTube or Spotify links are supported");

  const category = await env.DB.prepare(
    "SELECT id, name FROM music_categories WHERE id = ?",
  )
    .bind(categoryId)
    .first<{ id: number; name: string }>();

  if (!category) return jsonError("category not found", 404);

  const title =
    typeof payload?.title === "string" && payload.title.trim()
      ? payload.title.trim()
      : fallbackTitle(sourceType, category.name);

  const result = await env.DB.prepare(
    `
      INSERT INTO music_tracks (category_id, title, source_type, source_url)
      VALUES (?, ?, ?, ?)
    `,
  )
    .bind(category.id, title, sourceType, sourceUrl)
    .run();

  return Response.json(
    {
      track: {
        id: result.meta.last_row_id,
        category_id: category.id,
        category_name: category.name,
        title,
        source_type: sourceType,
        source_url: sourceUrl,
      },
    },
    { status: 201 },
  );
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  await ensureAdminSchema(env.DB);

  const payload = await request.json<{ id?: unknown }>().catch(() => null);
  const id = typeof payload?.id === "number" ? Math.trunc(payload.id) : 0;

  if (!id) return jsonError("music id is required");

  await env.DB.prepare("DELETE FROM music_tracks WHERE id = ?").bind(id).run();

  return Response.json({ ok: true });
};
