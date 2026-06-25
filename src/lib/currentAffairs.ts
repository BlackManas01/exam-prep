import { XMLParser } from "fast-xml-parser";
import { prisma } from "./prisma";

function stripHtml(s: string): string {
  return s
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function toDate(pubDate?: string): string {
  const d = pubDate ? new Date(pubDate) : new Date();
  return (isNaN(d.getTime()) ? new Date() : d).toISOString().slice(0, 10);
}

export interface ImportResult {
  imported: number;
  skipped: number;
  sample: string[];
  error?: string;
}

// Fetch an RSS/Atom feed and insert its items as current-affairs entries.
// Dedupes by exact title so re-running never creates duplicates.
export async function importFeed(url: string, category: string, limit = 15): Promise<ImportResult> {
  let xml: string;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "ExamPrep/1.0 (+current-affairs sync)" },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`Feed returned ${res.status}`);
    xml = await res.text();
  } catch (e) {
    return { imported: 0, skipped: 0, sample: [], error: `Could not fetch the feed: ${e instanceof Error ? e.message : "unknown"}` };
  }

  let entries: { title: string; content: string; date: string; link?: string }[] = [];
  try {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const doc = parser.parse(xml);
    const raw = doc?.rss?.channel?.item ?? doc?.feed?.entry ?? [];
    const arr = Array.isArray(raw) ? raw : [raw];
    entries = arr
      .filter(Boolean)
      .map((it: Record<string, unknown>) => {
        const title = stripHtml(String(it.title ?? "")).slice(0, 280);
        const desc = it.description ?? it.summary ?? it["content:encoded"] ?? it.content ?? "";
        const content = stripHtml(String(typeof desc === "object" ? JSON.stringify(desc) : desc)).slice(0, 1500);
        const link = typeof it.link === "string" ? it.link : (it.link as { "@_href"?: string })?.["@_href"];
        const date = toDate(String(it.pubDate ?? it.published ?? it.updated ?? ""));
        return { title, content, date, link };
      })
      .filter((e) => e.title.length > 3 && e.content.length > 3);
  } catch {
    return { imported: 0, skipped: 0, sample: [], error: "Could not parse the feed (valid RSS/Atom?)." };
  }

  let imported = 0;
  let skipped = 0;
  const sample: string[] = [];
  for (const e of entries.slice(0, limit)) {
    const exists = await prisma.currentAffair.findFirst({ where: { title: e.title } });
    if (exists) {
      skipped++;
      continue;
    }
    await prisma.currentAffair.create({
      data: {
        date: e.date,
        category,
        title: e.title,
        content: e.content,
        source: e.link ? e.link.slice(0, 200) : "Imported from feed",
      },
    });
    imported++;
    if (sample.length < 5) sample.push(e.title);
  }

  return { imported, skipped, sample };
}

// The default set of feeds the daily auto-sync pulls from.
export const DEFAULT_FEEDS: { url: string; category: string }[] = [
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", category: "National" },
  { url: "https://www.thehindu.com/news/international/feeder/default.rss", category: "International" },
  { url: "https://www.thehindu.com/business/feeder/default.rss", category: "Economy" },
  { url: "https://www.thehindu.com/sport/feeder/default.rss", category: "Sports" },
  { url: "https://www.thehindu.com/sci-tech/feeder/default.rss", category: "Science & Tech" },
];
