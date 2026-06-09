import { createAdminCookie, getAdminPassword } from "./_session";

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const adminPassword = getAdminPassword(env);

  if (!adminPassword) {
    return Response.json(
      { error: "ADMIN_PASSWORD is not configured" },
      { status: 500 },
    );
  }

  const payload = await request
    .json<{ username?: unknown; password?: unknown }>()
    .catch(() => null);
  const username = typeof payload?.username === "string" ? payload.username : "";
  const password = typeof payload?.password === "string" ? payload.password : "";

  if (username !== "admin" || password !== adminPassword) {
    return Response.json({ error: "invalid credentials" }, { status: 401 });
  }

  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": await createAdminCookie(env),
      },
    },
  );
};

