// Exports all AI/MANUAL questions (+ options) from the current DB to a portable
// JSON file — a permanent, DB-independent backup of the curated GK/English/GS
// question bank.
//
//   node scripts/export-ai-json.cjs
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

(async () => {
  const questions = await prisma.question.findMany({
    where: { source: { in: ["AI", "MANUAL"] } },
    include: { options: { orderBy: { displayOrder: "asc" } } },
    orderBy: [{ subject: "asc" }, { id: "asc" }],
  });

  const out = {
    exportedAt: new Date().toISOString(),
    count: questions.length,
    questions: questions.map((q) => ({
      examCode: q.examCode,
      sectionCode: q.sectionCode,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      stem: q.stem,
      explanation: q.explanation,
      source: q.source,
      contentHash: q.contentHash,
      isActive: q.isActive,
      options: q.options.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
        displayOrder: o.displayOrder,
      })),
    })),
  };

  const dir = path.join(__dirname, "..", "backups");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "ai-questions-export.json");
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  const mb = (fs.statSync(file).size / 1024 / 1024).toFixed(1);
  console.log(`Exported ${out.count} AI/MANUAL questions → backups/ai-questions-export.json (${mb} MB)`);

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
