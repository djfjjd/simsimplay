import { ensureAdminSchema, ensureUniquePostSlug, mapPost, PostRow } from "../_schema";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const db = env.DB;
  const id = params.id as string;

  await ensureAdminSchema(db);

  if (request.method === "GET") {
    const post = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first<PostRow>();
    if (!post) {
      return Response.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }
    return Response.json({ post: mapPost(post) });
  }

  if (request.method === "PUT") {
    const data = await request.json() as any;
    const { title, slug, category, description, content, tags, status } = data;

    if (!title || !category || !content) {
      return Response.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    try {
      const safeSlug = await ensureUniquePostSlug(db, slug || title, id);
      await db.prepare(`
        UPDATE posts
        SET title = ?, slug = ?, category = ?, description = ?, content = ?, tags = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        title,
        safeSlug,
        category,
        description || "",
        content,
        JSON.stringify(tags || []),
        status || "draft",
        id
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
    await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
};
