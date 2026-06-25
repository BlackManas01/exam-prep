import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { EXAM_BLUEPRINTS } from "../src/lib/examConfig";
import { generateQuestionPool, resetSeed } from "../src/lib/generators";
import { questionContentHash } from "../src/lib/hash";

// Surgical insert of any NEW curated questions (GK / English / GS / Computer)
// into every section that uses them, skipping anything already in the DB by
// content hash. Procedural subjects (count=0) generate nothing, so Maths /
// Reasoning are untouched. Safe to run while generation jobs are live.

const prisma = new PrismaClient();

async function main() {
  resetSeed(987654);
  let inserted = 0;
  const bySection: Record<string, number> = {};

  for (const exam of EXAM_BLUEPRINTS) {
    for (const section of exam.sections) {
      const pool = generateQuestionPool(section.subject, 0, exam.optionsPerQuestion);
      if (pool.length === 0) continue; // procedural subject

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
        const key = `${exam.code}/${section.code}`;
        bySection[key] = (bySection[key] || 0) + 1;
      }
    }
  }

  console.log(`Curated patch complete: ${inserted} new questions inserted.`);
  for (const [k, v] of Object.entries(bySection)) console.log(`  ${k}: +${v}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
