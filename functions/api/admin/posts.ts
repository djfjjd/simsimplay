import { ensureAdminSchema, ensureUniquePostSlug, mapPost, PostRow } from "./_schema";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const db = env.DB;

  await ensureAdminSchema(db);

  if (request.method === "GET") {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = "SELECT * FROM posts WHERE 1=1";
    const params: any[] = [];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    if (search) {
      query += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY created_at DESC";

    const { results } = await db.prepare(query).bind(...params).all<PostRow>();
    return Response.json({ posts: (results || []).map(mapPost) });
  }

  if (request.method === "POST") {
    const data = await request.json() as any;
    const { title, slug, category, description, content, tags, status } = data;

    if (!title || !category || !content) {
      return Response.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    try {
      const safeSlug = await ensureUniquePostSlug(db, slug || title);
      await db.prepare(`
        INSERT INTO posts (title, slug, category, description, content, tags, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        title,
        safeSlug,
        category,
        description || "",
        content,
        JSON.stringify(tags || []),
        status || "draft"
      ).run();

      return Response.json({ success: true });
    } catch (e: any) {
      if (e.message?.includes("UNIQUE constraint failed")) {
        return Response.json({ error: "이미 존재하는 슬러그(slug)입니다." }, { status: 400 });
      }
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  if (request.method === "DELETE") {
    const body = await request.json().catch(() => ({})) as { ids?: unknown };
    const ids = Array.isArray(body.ids)
      ? body.ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
      : [];

    if (ids.length === 0) {
      return Response.json({ error: "삭제할 글을 선택해 주세요." }, { status: 400 });
    }

    const placeholders = ids.map(() => "?").join(", ");
    const result = await db
      .prepare(`DELETE FROM posts WHERE id IN (${placeholders})`)
      .bind(...ids)
      .run();

    return Response.json({ success: true, count: result.meta.changes || 0 });
  }

  return new Response("Method not allowed", { status: 405 });
};
