interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env, "slug"> = async (context) => {
  const { request, env, params } = context;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  const slug = decodeURIComponent(String(params.slug || "")).trim();
  if (!slug || slug === "__post__") {
    return context.next();
  }

  const post = await env.DB
    .prepare("SELECT id FROM posts WHERE slug = ? AND status = 'published' LIMIT 1")
    .bind(slug)
    .first<{ id: number }>();

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const assetUrl = new URL(request.url);
  assetUrl.pathname = "/blog/__post__.html";
  assetUrl.search = "";

  return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
};
