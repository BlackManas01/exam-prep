const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Source-aware stem dedup for GK + English (excluding the legitimate spelling
// stem, where each item is a different word). When several questions share a
// stem, keep ONE — preferring a verified SEED/MANUAL item over AI — and delete
// the rest. Improves variety AND trust (verified beats AI on ties).
const SECTIONS = ["general-awareness", "english", "general-studies", "computer"];
// Spelling questions legitimately share a stem (different word each), so any
// "...correctly spelt/spelled word" stem is excluded from dedup.
const rank = (s) => (s === "SEED" ? 0 : s === "MANUAL" ? 1 : 2); // lower = keep

(async () => {
  let removed = 0;
  for (const section of SECTIONS) {
    const groups = await p.$queryRawUnsafe(
      `SELECT examCode, stem, COUNT(*) AS c
         FROM Question
         WHERE sectionCode = ? AND LOWER(stem) NOT LIKE '%spel%'
         GROUP BY examCode, stem HAVING c > 1`,
      section
    );
    for (const g of groups) {
      const items = await p.question.findMany({
        where: { sectionCode: section, examCode: g.examCode, stem: g.stem },
        select: { id: true, source: true },
      });
      items.sort((a, b) => rank(a.source) - rank(b.source) || (a.id < b.id ? -1 : 1));
      const toDelete = items.slice(1).map((d) => d.id); // keep best-ranked first
      if (toDelete.length) {
        await p.option.deleteMany({ where: { questionId: { in: toDelete } } });
        await p.question.deleteMany({ where: { id: { in: toDelete } } });
        removed += toDelete.length;
      }
    }
  }
  console.log(`Source-aware stem dedup: removed ${removed} duplicate(s).`);
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
