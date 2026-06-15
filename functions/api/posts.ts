import { mapPost, PostRow } from "./admin/_schema";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const db = env.DB;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  let query = "SELECT * FROM posts WHERE status = 'published'";
  const params: any[] = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  if (search) {
    query += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  query += " ORDER BY created_at DESC";

  const { results } = await db.prepare(query).bind(...params).all<PostRow>();
  return Response.json({ posts: (results || []).map(mapPost) });
};
