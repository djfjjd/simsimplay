interface Env {
  DB: D1Database;
}

type PostRow = {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  tags: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function parseJsonArray(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function mapPost(row: PostRow) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    description: row.description,
    content: row.content,
    tags: parseJsonArray(row.tags),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function escapeScriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
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
    .prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published' LIMIT 1")
    .bind(slug)
    .first<PostRow>();

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const assetUrl = new URL(request.url);
  assetUrl.pathname = "/blog/__post__";
  assetUrl.search = "";

  const assetResponse = await env.ASSETS.fetch(new Request(assetUrl.toString(), request));
  if (!assetResponse.ok || request.method === "HEAD") {
    return assetResponse;
  }

  const html = await assetResponse.text();
  const script = `<script>window.__SIMSIMPLAY_POST__=${escapeScriptJson(mapPost(post))}</script>`;
  return new Response(html.replace("</body>", `${script}</body>`), {
    status: assetResponse.status,
    headers: assetResponse.headers,
  });
};
