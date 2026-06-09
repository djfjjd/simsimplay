type MessageRow = {
  id: number;
  body: string;
  created_at: string;
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT id, body, created_at FROM messages ORDER BY id DESC LIMIT 50",
  ).all<MessageRow>();

  return Response.json({ messages: results });
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const payload = await request.json<{ body?: unknown }>().catch(() => null);
  const body = typeof payload?.body === "string" ? payload.body.trim() : "";

  if (!body) {
    return Response.json({ error: "body is required" }, { status: 400 });
  }

  const result = await env.DB.prepare("INSERT INTO messages (body) VALUES (?)")
    .bind(body)
    .run();

  return Response.json({ id: result.meta.last_row_id, body }, { status: 201 });
};

