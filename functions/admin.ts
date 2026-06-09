import { isAdminRequest } from "./api/auth/_session";

export const onRequest: PagesFunction<Env> = async ({ env, request, next }) => {
  if (!(await isAdminRequest(request, env))) {
    const url = new URL(request.url);
    url.pathname = "/login";
    url.searchParams.set("next", "/admin");
    return Response.redirect(url, 302);
  }

  return next();
};

