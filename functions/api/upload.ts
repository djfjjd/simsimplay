import { jsonError } from "./admin/_schema";

const allowedKinds = new Set(["audio", "image"]);
const maxFileSize = 100 * 1024 * 1024;

function safeFileName(name: string) {
  const fallback = "upload";
  const normalized = name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return normalized || fallback;
}

function mediaUrl(key: string) {
  return `/api/media?key=${encodeURIComponent(key)}`;
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  if (!env.MEDIA) return jsonError("media storage is not configured", 500);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kindValue = form?.get("kind");
  const kind = typeof kindValue === "string" && allowedKinds.has(kindValue) ? kindValue : "audio";

  if (!(file instanceof File)) return jsonError("file is required");
  if (file.size <= 0) return jsonError("file is empty");
  if (file.size > maxFileSize) return jsonError("file is too large", 413);

  const contentType = file.type || "application/octet-stream";
  if (kind === "audio" && !contentType.startsWith("audio/")) {
    return jsonError("audio file is required");
  }
  if (kind === "image" && !contentType.startsWith("image/")) {
    return jsonError("image file is required");
  }

  const key = `${kind}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  await env.MEDIA.put(key, file, {
    httpMetadata: {
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      originalName: file.name,
    },
  });

  return Response.json({
    key,
    url: mediaUrl(key),
    contentType,
    size: file.size,
  });
};
