export const runtime = "edge";

export async function POST() {
  return Response.json(
    {
      error:
        "This project deploys /api/analyze through Cloudflare Pages Functions. Use functions/api/analyze.ts in production.",
    },
    { status: 501 },
  );
}

