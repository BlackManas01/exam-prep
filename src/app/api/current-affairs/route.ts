import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: list current-affairs entries (newest first), optionally filtered by
// month (YYYY-MM) or category. Used by the reading archive.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? undefined; // YYYY-MM
  const date = searchParams.get("date") ?? undefined; // YYYY-MM-DD (exact day)
  const category = searchParams.get("category") ?? undefined;
  const limit = Math.min(300, Math.max(1, Number(searchParams.get("limit") ?? "120")));

  const where = {
    ...(date ? { date } : month ? { date: { startsWith: month } } : {}),
    ...(category ? { category } : {}),
  };

  const [items, categoriesRaw, monthsRaw, datesRaw] = await Promise.all([
    prisma.currentAffair.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: limit,
    }),
    prisma.currentAffair.groupBy({ by: ["category"], _count: { _all: true } }),
    prisma.$queryRawUnsafe<{ month: string }[]>(
      `SELECT DISTINCT substr(date, 1, 7) AS month FROM "CurrentAffair" ORDER BY month DESC`
    ),
    prisma.$queryRawUnsafe<{ date: string }[]>(
      `SELECT DISTINCT date FROM "CurrentAffair" ORDER BY date DESC LIMIT 90`
    ),
  ]);

  const categories = categoriesRaw
    .map((c) => ({ category: c.category, count: c._count._all }))
    .sort((a, b) => b.count - a.count);
  const months = monthsRaw.map((m) => m.month);
  const dates = datesRaw.map((d) => d.date);

  return NextResponse.json({ items, categories, months, dates });
}
