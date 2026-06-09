import { clearAdminCookie } from "./_session";

export const onRequestPost: PagesFunction<Env> = async () => {
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": clearAdminCookie(),
      },
    },
  );
};

