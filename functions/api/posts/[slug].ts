import { mapPost, PostRow } from "../admin/_schema";

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const db = env.DB;
  const slug = params.slug as string;

  const post = await db.prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published'").bind(slug).first<PostRow>();
  
  if (!post) {
    return Response.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  return Response.json({ post: mapPost(post) });
};
