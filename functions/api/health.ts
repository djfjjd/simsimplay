export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const result = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();

  return Response.json({
    ok: result?.ok === 1,
    runtime: "edge",
    database: "d1",
  });
};

