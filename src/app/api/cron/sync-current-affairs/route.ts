import { NextRequest, NextResponse } from "next/server";
import { importFeed, DEFAULT_FEEDS } from "@/lib/currentAffairs";

// Daily auto-sync of current affairs. Pulls the latest items from the default
// feeds. Intended to be called by a scheduler (e.g. Vercel Cron) once a day, so
// the archive fills up with every date going forward.
//
// Security: requires CRON_SECRET via `Authorization: Bearer <secret>` or
// `?key=<secret>`. Vercel Cron sends the configured secret automatically.
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production"; // allow in dev only
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  return auth === `Bearer ${secret}` || key === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { category: string; imported: number; skipped: number; error?: string }[] = [];
  let totalImported = 0;
  for (const feed of DEFAULT_FEEDS) {
    const r = await importFeed(feed.url, feed.category, 12);
    results.push({ category: feed.category, imported: r.imported, skipped: r.skipped, error: r.error });
    totalImported += r.imported;
  }

  return NextResponse.json({ ok: true, totalImported, results, ranAt: new Date().toISOString() });
}
