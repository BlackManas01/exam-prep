import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { EXAM_BLUEPRINTS } from "../src/lib/examConfig";
import { generateQuestionPool, resetSeed } from "../src/lib/generators";
import { questionContentHash } from "../src/lib/hash";

const prisma = new PrismaClient();

// Scale control:
//   npm run db:seed         -> demo bank (~1k questions, fast)
//   npm run db:seed:large   -> large bank (~50k questions)
// Tune per-section size with QPS env, e.g. QPS=10000.
const SCALE =
  process.argv.includes("large") || process.env.SEED_SCALE === "large" ? "large" : "demo";
const LARGE_TARGET = Number(process.env.QPS) || 6500;
const PROCEDURAL_SUBJECTS = new Set(["Quantitative Aptitude", "Reasoning"]);

type Row = {
  id: string;
  examCode: string;
  sectionCode: string;
  subject: string;
  topic: string;
  difficulty: string;
  stem: string;
  explanation: string;
  source: string;
  contentHash: string;
};
type OptRow = {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  displayOrder: number;
};

async function createManyChunked<T>(
  fn: (data: T[]) => Promise<unknown>,
  rows: T[],
  chunk = 2000
) {
  for (let i = 0; i < rows.length; i += chunk) {
    await fn(rows.slice(i, i + chunk));
  }
}

async function main() {
  console.log(`Seeding exam-prep platform (scale=${SCALE})...`);
  resetSeed(987654);

  // Refresh built-in (SEED) content but KEEP AI / MANUAL questions so that
  // generated GK/English questions survive a reseed (e.g. when adding an exam).
  await prisma.attemptItem.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.option.deleteMany({ where: { question: { source: "SEED" } } });
  await prisma.question.deleteMany({ where: { source: "SEED" } });
  await prisma.section.deleteMany();
  await prisma.exam.deleteMany();

  let totalQuestions = 0;

  for (const exam of EXAM_BLUEPRINTS) {
    const totalQ = exam.sections.reduce((s, sec) => s + sec.questionCount, 0);
    const totalM = totalQ * exam.marksPerCorrect;

    await prisma.exam.create({
      data: {
        code: exam.code,
        name: exam.name,
        shortName: exam.shortName,
        description: exam.description,
        category: exam.category,
        totalQuestions: totalQ,
        totalMarks: totalM,
        durationSeconds: exam.totalDurationSeconds,
        marksPerCorrect: exam.marksPerCorrect,
        negativeMarkPerWrong: exam.negativeMarkPerWrong,
        hasSectionalTiming: exam.hasSectionalTiming,
        optionsPerQuestion: exam.optionsPerQuestion,
        displayOrder: exam.displayOrder,
        sections: {
          create: exam.sections.map((s) => ({
            code: s.code,
            name: s.name,
            displayOrder: exam.sections.indexOf(s),
            questionCount: s.questionCount,
            sectionDurationSeconds: s.sectionDurationSeconds ?? null,
          })),
        },
      },
    });

    for (const section of exam.sections) {
      const procedural = PROCEDURAL_SUBJECTS.has(section.subject);
      const target = procedural
        ? SCALE === "large"
          ? LARGE_TARGET
          : Math.max(section.questionCount * 4, 80)
        : Number.MAX_SAFE_INTEGER; // curated: take all unique available

      // Generate a bit more than needed; dedup absorbs collisions.
      const genCount = procedural ? Math.ceil(target * 1.6) : 0;
      const generated = generateQuestionPool(section.subject, genCount, exam.optionsPerQuestion);

      // Preload existing question hashes (AI/MANUAL kept from before) so SEED
      // questions never collide with them.
      const existing = await prisma.question.findMany({
        where: { examCode: exam.code, sectionCode: section.code },
        select: { contentHash: true },
      });
      const seen = new Set<string>(existing.map((e) => e.contentHash));
      const questionRows: Row[] = [];
      const optionRows: OptRow[] = [];
      for (const q of generated) {
        const hash = questionContentHash(q.stem, q.options[q.correctIndex]);
        if (seen.has(hash)) continue;
        seen.add(hash);
        const qid = randomUUID();
        questionRows.push({
          id: qid,
          examCode: exam.code,
          sectionCode: section.code,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          stem: q.stem,
          explanation: q.explanation,
          source: "SEED",
          contentHash: hash,
        });
        q.options.forEach((text, idx) =>
          optionRows.push({
            id: randomUUID(),
            questionId: qid,
            text,
            isCorrect: idx === q.correctIndex,
            displayOrder: idx,
          })
        );
        if (questionRows.length >= target) break;
      }

      await createManyChunked((data) => prisma.question.createMany({ data }), questionRows);
      await createManyChunked((data) => prisma.option.createMany({ data }), optionRows);

      totalQuestions += questionRows.length;
      console.log(`  ${exam.shortName} / ${section.name}: ${questionRows.length} questions`);
    }
  }

  console.log(`\nDone. ${EXAM_BLUEPRINTS.length} exams, ${totalQuestions} questions seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
