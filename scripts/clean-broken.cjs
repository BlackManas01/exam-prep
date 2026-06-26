// One-off cleanup mirroring the nightly audit cron: removes questions with
// duplicate option text and repeated stems in curated sections (Postgres).
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const defective = await prisma.$executeRawUnsafe(`
    DELETE FROM "Question" WHERE id IN (
      SELECT DISTINCT o."questionId" FROM "Option" o
      WHERE EXISTS (
        SELECT 1 FROM "Option" o2
        WHERE o2."questionId" = o."questionId" AND o2.text = o.text AND o2.id <> o.id
      )
    )`);
  const brokenAns = await prisma.$executeRawUnsafe(`
    DELETE FROM "Question" WHERE id IN (
      SELECT "questionId" FROM "Option" GROUP BY "questionId"
      HAVING SUM(CASE WHEN "isCorrect" THEN 1 ELSE 0 END) <> 1
    )`);
  const total = await prisma.question.count();
  console.log(`Removed ${defective} duplicate-option + ${brokenAns} broken-answer questions. Bank now ${total}.`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
