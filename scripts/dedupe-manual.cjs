// Report + dedupe identical MANUAL questions (same stem+answer across exams).
// contentHash is identical for the same stem+correct answer, so we group by it.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const rows = await prisma.question.findMany({ where: { source: "MANUAL" }, select: { id: true, contentHash: true, examCode: true, stem: true, createdAt: true } });
  const byHash = new Map();
  for (const r of rows) { if (!byHash.has(r.contentHash)) byHash.set(r.contentHash, []); byHash.get(r.contentHash).push(r); }
  const uniqueStems = byHash.size;
  const totalRows = rows.length;
  const dupGroups = [...byHash.values()].filter((g) => g.length > 1);
  const dupRows = dupGroups.reduce((s, g) => s + (g.length - 1), 0);
  console.log(`MANUAL rows: ${totalRows}`);
  console.log(`Unique questions (by stem+answer): ${uniqueStems}`);
  console.log(`Groups with copies across exams: ${dupGroups.length}`);
  console.log(`Redundant duplicate rows (removable): ${dupRows}`);
  // distribution of copies-per-question
  const dist = {};
  for (const g of byHash.values()) dist[g.length] = (dist[g.length] || 0) + 1;
  console.log("copies-per-question -> count:", JSON.stringify(dist));
  if (process.argv.includes("--dry")) { await prisma.$disconnect(); return; }
  // Keep the earliest row per hash; delete the rest (+ their options).
  const toDelete = [];
  for (const g of byHash.values()) { if (g.length > 1) { g.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); toDelete.push(...g.slice(1).map((r) => r.id)); } }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(toDelete, 500, (b) => prisma.option.deleteMany({ where: { questionId: { in: b } } }));
  await chunk(toDelete, 500, (b) => prisma.question.deleteMany({ where: { id: { in: b } } }));
  console.log(`Deleted ${toDelete.length} duplicate rows; kept ${uniqueStems} unique.`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
