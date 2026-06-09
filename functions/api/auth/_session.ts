const cookieName = "simsimplay_admin";
const maxAge = 60 * 60 * 24 * 7;

function base64Url(bytes: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("Cookie") ?? "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64Url(signature);
}

export function getAdminPassword(env: Env) {
  return env.ADMIN_PASSWORD?.trim() || "";
}

export async function createAdminCookie(env: Env) {
  const password = getAdminPassword(env);
  const expires = Math.floor(Date.now() / 1000) + maxAge;
  const payload = `admin.${expires}`;
  const signature = await sign(payload, password);

  return `${cookieName}=${payload}.${signature}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function clearAdminCookie() {
  return `${cookieName}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function isAdminRequest(request: Request, env: Env) {
  const password = getAdminPassword(env);
  if (!password) return false;

  const cookie = getCookie(request, cookieName);
  const [role, expires, signature] = cookie?.split(".") ?? [];

  if (role !== "admin" || !expires || !signature) return false;
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;

  const expected = await sign(`${role}.${expires}`, password);
  return signature === expected;
}

export async function requireAdmin(request: Request, env: Env) {
  if (await isAdminRequest(request, env)) return null;
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

