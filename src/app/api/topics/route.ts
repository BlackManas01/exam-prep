import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Returns the list of topics (with counts) available for an exam section, so the
// practice page can offer topic-wise drilling. Only active questions are counted.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const examCode = searchParams.get("examCode") ?? undefined;
  const sectionCode = searchParams.get("sectionCode") ?? undefined;
  const verifiedOnly = searchParams.get("verifiedOnly") === "true";

  if (!examCode || !sectionCode) {
    return NextResponse.json({ error: "examCode and sectionCode required" }, { status: 400 });
  }

  const grouped = await prisma.question.groupBy({
    by: ["topic"],
    where: {
      examCode,
      sectionCode,
      isActive: true,
      ...(verifiedOnly ? { source: { in: ["SEED", "MANUAL"] } } : {}),
    },
    _count: { _all: true },
  });

  const topics = grouped
    .map((g) => ({ topic: g.topic, count: g._count._all }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ topics });
}
