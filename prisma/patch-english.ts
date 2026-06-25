import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { EXAM_BLUEPRINTS } from "../src/lib/examConfig";
import { generateQuestionPool, resetSeed } from "../src/lib/generators";
import { questionContentHash } from "../src/lib/hash";

// Surgical, non-disruptive English patch:
//   1. Removes the two previously-broken spelling questions (Calendar,
//      Perseverance) that had a duplicate distractor, so they re-insert with
//      corrected, distinct options.
//   2. Inserts any new curated English questions that aren't already in the DB.
// Existing Maths/Reasoning/GK/AI questions are never touched (hash dedup +
// English-only scope), so this is safe to run while generation jobs are live.

const prisma = new PrismaClient();

async function main() {
  resetSeed(987654);
  let fixed = 0;
  let inserted = 0;

  for (const exam of EXAM_BLUEPRINTS) {
    for (const section of exam.sections) {
      if (section.subject !== "English") continue;

      // 1. Drop the broken spelling questions (duplicate distractor) so they
      //    re-insert fresh below with corrected options.
      const broken = await prisma.question.findMany({
        where: {
          examCode: exam.code,
          sectionCode: section.code,
          stem: "Choose the correctly spelt word.",
          options: { some: { isCorrect: true, text: { in: ["Calendar", "Perseverance"] } } },
        },
        select: { id: true },
      });
      if (broken.length) {
        const ids = broken.map((b) => b.id);
        await prisma.option.deleteMany({ where: { questionId: { in: ids } } });
        await prisma.question.deleteMany({ where: { id: { in: ids } } });
        fixed += ids.length;
      }

      // 2. Insert English questions not already present (new bank items +
      //    corrected spelling). Dedup by content hash matches the seeder.
      const pool = generateQuestionPool("English", 0, exam.optionsPerQuestion);
      const existing = await prisma.question.findMany({
        where: { examCode: exam.code, sectionCode: section.code },
        select: { contentHash: true },
      });
      const seen = new Set<string>(existing.map((e) => e.contentHash));

      for (const q of pool) {
        const hash = questionContentHash(q.stem, q.options[q.correctIndex]);
        if (seen.has(hash)) continue;
        seen.add(hash);
        await prisma.question.create({
          data: {
            id: randomUUID(),
            examCode: exam.code,
            sectionCode: section.code,
            subject: q.subject,
            topic: q.topic,
            difficulty: q.difficulty,
            stem: q.stem,
            explanation: q.explanation,
            source: "SEED",
            contentHash: hash,
            isActive: true,
            options: {
              create: q.options.map((text, idx) => ({
                id: randomUUID(),
                text,
                isCorrect: idx === q.correctIndex,
                displayOrder: idx,
              })),
            },
          },
        });
        inserted++;
      }
    }
  }

  console.log(
    `English patch complete: ${fixed} broken spelling questions fixed, ${inserted} new questions inserted.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
