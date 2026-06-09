import { ensureAdminSchema, jsonError } from "./_schema";

type CategoryRow = {
  id: number;
  name: string;
  created_at: string;
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  await ensureAdminSchema(env.DB);

  const { results } = await env.DB.prepare(
    "SELECT id, name, created_at FROM music_categories ORDER BY id ASC",
  ).all<CategoryRow>();

  return Response.json({ categories: results });
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  await ensureAdminSchema(env.DB);

  const payload = await request.json<{ name?: unknown }>().catch(() => null);
  const name = typeof payload?.name === "string" ? payload.name.trim() : "";

  if (!name) {
    return jsonError("category name is required");
  }

  await env.DB.prepare("INSERT OR IGNORE INTO music_categories (name) VALUES (?)")
    .bind(name)
    .run();

  const category = await env.DB.prepare(
    "SELECT id, name, created_at FROM music_categories WHERE name = ?",
  )
    .bind(name)
    .first<CategoryRow>();

  return Response.json({ category }, { status: 201 });
};

