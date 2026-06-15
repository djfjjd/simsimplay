import { ensureAdminSchema, normalizeExistingPostSlugs } from "../_schema";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const db = env.DB;

  await ensureAdminSchema(db);

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await request.json().catch(() => ({})) as { ids?: unknown };
  const ids = Array.isArray(body.ids)
    ? body.ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
    : null;

  await normalizeExistingPostSlugs(db);

  if (ids && ids.length === 0) {
    return Response.json({ error: "발행할 글을 선택해 주세요." }, { status: 400 });
  }

  if (!ids) {
    const result = await db
      .prepare("UPDATE posts SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE status = 'draft'")
      .run();
    return Response.json({ success: true, count: result.meta.changes || 0 });
  }

  const placeholders = ids.map(() => "?").join(", ");
  const result = await db
    .prepare(`UPDATE posts SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE status = 'draft' AND id IN (${placeholders})`)
    .bind(...ids)
    .run();

  return Response.json({ success: true, count: result.meta.changes || 0 });
};
