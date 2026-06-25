import { prisma } from "@/lib/prisma";

// Database-backed store for "report wrong answer" flags. Stored in Postgres so
// it works on serverless hosts (Vercel) — a file-based store would be lost.

export interface Flag {
  questionId: string;
  reason?: string;
  at: string;
}

export async function readFlags(): Promise<Flag[]> {
  const rows = await prisma.questionFlag.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((f) => ({
    questionId: f.questionId,
    reason: f.reason ?? undefined,
    at: f.createdAt.toISOString(),
  }));
}

export async function addFlag(questionId: string, reason?: string): Promise<void> {
  await prisma.questionFlag.upsert({
    where: { questionId },
    create: { questionId, reason },
    update: {
      count: { increment: 1 },
      ...(reason ? { reason } : {}),
    },
  });
}

export async function removeFlag(questionId: string): Promise<void> {
  await prisma.questionFlag.deleteMany({ where: { questionId } });
}
