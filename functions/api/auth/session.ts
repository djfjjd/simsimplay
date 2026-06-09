import { isAdminRequest } from "./_session";

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  return Response.json({ authenticated: await isAdminRequest(request, env) });
};

