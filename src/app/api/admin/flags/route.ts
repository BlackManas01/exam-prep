import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFlags, removeFlag } from "@/lib/flags";
import { isAdminRequest } from "@/lib/auth";

// List flagged questions with their full content so the admin can judge them.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flags = await readFlags();
  const ids = flags.map((f) => f.questionId);

  const questions = ids.length
    ? await prisma.question.findMany({
        where: { id: { in: ids } },
        include: { options: { orderBy: { displayOrder: "asc" } } },
      })
    : [];
  const qMap = new Map(questions.map((q) => [q.id, q]));

  const items = flags
    .map((f) => {
      const q = qMap.get(f.questionId);
      return {
        questionId: f.questionId,
        reason: f.reason ?? null,
        at: f.at,
        question: q
          ? {
              examCode: q.examCode,
              sectionCode: q.sectionCode,
              topic: q.topic,
              source: q.source,
              stem: q.stem,
              options: q.options.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect,
              })),
            }
          : null, // already deleted
      };
    })
    .sort((a, b) => (a.at < b.at ? 1 : -1));

  return NextResponse.json({ flags: items });
}

// Act on a flag: dismiss it (keep the question) or delete the bad question.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { questionId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { questionId, action } = body;
  if (!questionId || (action !== "dismiss" && action !== "delete")) {
    return NextResponse.json({ error: "questionId and action (dismiss|delete) required" }, { status: 400 });
  }

  if (action === "delete") {
    // Options cascade via the relation; ignore if it was already removed.
    await prisma.question.delete({ where: { id: questionId } }).catch(() => {});
  }
  await removeFlag(questionId);

  return NextResponse.json({ ok: true });
}
