// One-off migration: copy AI/MANUAL questions (+ their options) from the local
// SQLite dev.db into the live Neon Postgres DB. Idempotent — re-running skips
// questions/options already present (unique on [examCode,sectionCode,contentHash]).
//
//   node scripts/migrate-ai-to-neon.cjs [path-to-sqlite.db]
//
// DATABASE_URL must point at Neon when this runs.
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SOURCES = ["AI", "MANUAL"];

async function chunked(rows, size, fn) {
  for (let i = 0; i < rows.length; i += size) await fn(rows.slice(i, i + size));
}

(async () => {
  const SQL = await initSqlJs({
    locateFile: (f) => path.join(__dirname, "..", "node_modules", "sql.js", "dist", f),
  });
  const dbPath = process.argv[2] || path.join(__dirname, "..", "prisma", "dev.db");
  const db = new SQL.Database(fs.readFileSync(dbPath));

  // --- Read questions ---
  const qRes = db.exec(
    `SELECT id, examCode, sectionCode, subject, topic, difficulty, stem, explanation, source, contentHash, isActive
     FROM Question WHERE source IN ('AI','MANUAL')`
  );
  const qCols = qRes[0].columns;
  const questions = qRes[0].values.map((row) => {
    const o = {};
    qCols.forEach((c, i) => (o[c] = row[i]));
    return {
      id: o.id,
      examCode: o.examCode,
      sectionCode: o.sectionCode,
      subject: o.subject,
      topic: o.topic,
      difficulty: o.difficulty,
      stem: o.stem,
      explanation: o.explanation,
      source: o.source,
      contentHash: o.contentHash,
      isActive: !!o.isActive,
    };
  });
  console.log(`Read ${questions.length} AI/MANUAL questions from SQLite.`);

  // --- Read their options ---
  const oRes = db.exec(
    `SELECT o.id, o.questionId, o.text, o.isCorrect, o.displayOrder
     FROM Option o JOIN Question q ON o.questionId = q.id
     WHERE q.source IN ('AI','MANUAL')`
  );
  const options = oRes[0]
    ? oRes[0].values.map((r) => ({
        id: r[0],
        questionId: r[1],
        text: r[2],
        isCorrect: !!r[3],
        displayOrder: r[4],
      }))
    : [];
  console.log(`Read ${options.length} options from SQLite.`);
  db.close();

  // --- Insert questions into Neon (skip duplicates) ---
  let qInserted = 0;
  await chunked(questions, 1000, async (batch) => {
    const res = await prisma.question.createMany({ data: batch, skipDuplicates: true });
    qInserted += res.count;
    process.stdout.write(`  questions inserted: ${qInserted}\r`);
  });
  console.log(`\nQuestions inserted (new): ${qInserted}`);

  // --- Figure out which question ids actually exist in Neon now ---
  const allIds = questions.map((q) => q.id);
  const present = new Set();
  await chunked(allIds, 5000, async (batch) => {
    const found = await prisma.question.findMany({
      where: { id: { in: batch } },
      select: { id: true },
    });
    found.forEach((f) => present.add(f.id));
  });

  // --- Insert options only for present questions (skip duplicates) ---
  const optsToInsert = options.filter((o) => present.has(o.questionId));
  let oInserted = 0;
  await chunked(optsToInsert, 2000, async (batch) => {
    const res = await prisma.option.createMany({ data: batch, skipDuplicates: true });
    oInserted += res.count;
    process.stdout.write(`  options inserted: ${oInserted}\r`);
  });
  console.log(`\nOptions inserted (new): ${oInserted}`);

  const total = await prisma.question.count();
  const aiTotal = await prisma.question.count({ where: { source: { in: SOURCES } } });
  console.log(`\nNeon now has ${total} questions total (${aiTotal} AI/MANUAL).`);

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
