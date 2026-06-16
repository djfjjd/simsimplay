export const runtime = "edge";

const SITE_URL = "https://simsimplay.com";

type Env = {
  DB: D1Database;
};

type BlogPostRow = {
  slug: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET(request: Request, context: { env: Env }) {
  const now = new Date().toISOString();

  const staticRoutes = [
    "",
    "/psychology",
    "/fortune",
    "/music",
    "/diary",
    "/blog",
    "/privacy",
    "/terms",
    "/contact",
    "/about",
  ];

  let blogPosts: BlogPostRow[] = [];

  try {
    const result = await context.env.DB.prepare(
      `
      SELECT slug, created_at, updated_at
      FROM posts
      WHERE status = 'published'
      AND slug IS NOT NULL
      AND slug != ''
      ORDER BY created_at DESC
      LIMIT 5000
      `
    ).all<BlogPostRow>();

    blogPosts = result.results || [];
  } catch {
    try {
      const result = await context.env.DB.prepare(
        `
        SELECT slug, createdAt, updatedAt
        FROM posts
        WHERE status = 'published'
        AND slug IS NOT NULL
        AND slug != ''
        ORDER BY createdAt DESC
        LIMIT 5000
        `
      ).all<BlogPostRow>();

      blogPosts = result.results || [];
    } catch {
      blogPosts = [];
    }
  }

  const urls = [
    ...staticRoutes.map((route) => ({
      loc: `${SITE_URL}${route}`,
      lastmod: now,
      priority: route === "" ? "1.0" : "0.8",
      changefreq: route === "" ? "daily" : "weekly",
    })),
    ...blogPosts.map((post) => ({
      loc: `${SITE_URL}/blog/${post.slug}`,
      lastmod:
        post.updated_at ||
        post.updatedAt ||
        post.created_at ||
        post.createdAt ||
        now,
      priority: "0.7",
      changefreq: "monthly",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
