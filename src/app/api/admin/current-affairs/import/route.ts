import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { importFeed } from "@/lib/currentAffairs";
import { isAdminRequest } from "@/lib/auth";

const schema = z.object({
  url: z.string().url(),
  category: z.string().trim().min(1).max(40).default("National"),
  limit: z.number().int().min(1).max(30).default(15),
});

// Import current affairs from a news/RSS feed (admin only). NOTE: a raw news
// feed is not exam-curated — the admin should review and prune what's imported.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid feed URL is required." }, { status: 400 });
  }
  const { url, category, limit } = parsed.data;
  const result = await importFeed(url, category, limit);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json(result);
}
