import { jsonError } from "./admin/_schema";

function parseRange(rangeHeader: string | null, size: number) {
  if (!rangeHeader) return null;

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match) return null;

  const [, startValue, endValue] = match;
  if (!startValue && !endValue) return null;

  if (!startValue) {
    const suffix = Number(endValue);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    const length = Math.min(suffix, size);
    return { offset: size - length, length };
  }

  const start = Number(startValue);
  const end = endValue ? Number(endValue) : size - 1;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) {
    return null;
  }

  return {
    offset: start,
    length: Math.min(end, size - 1) - start + 1,
  };
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  if (!env.MEDIA) return jsonError("media storage is not configured", 500);

  const url = new URL(request.url);
  const key = url.searchParams.get("key")?.trim();
  if (!key) return jsonError("media key is required");

  const head = await env.MEDIA.head(key);
  if (!head) return jsonError("media not found", 404);

  const range = parseRange(request.headers.get("range"), head.size);
  const object = await env.MEDIA.get(key, range ? { range } : undefined);
  if (!object) return jsonError("media not found", 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", headers.get("cache-control") || "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);

  if (range) {
    headers.set("content-length", String(range.length));
    headers.set(
      "content-range",
      `bytes ${range.offset}-${range.offset + range.length - 1}/${head.size}`,
    );
    return new Response(object.body, { status: 206, headers });
  }

  headers.set("content-length", String(head.size));
  return new Response(object.body, { headers });
};
