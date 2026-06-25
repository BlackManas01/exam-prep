const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Improve GK variety: when the AI produced several questions with the SAME stem
// (same concept reworded), keep one per (examCode, sectionCode, stem) and remove
// the rest. Scoped to AI general-awareness only, so legit spelling repeats
// (different words, in english) and procedural items are never touched.
(async () => {
  const groups = await p.$queryRawUnsafe(
    `SELECT examCode, sectionCode, stem, COUNT(*) AS c
       FROM Question
       WHERE source='AI' AND sectionCode='general-awareness'
       GROUP BY examCode, sectionCode, stem HAVING c > 1`
  );
  let removed = 0;
  for (const g of groups) {
    const dupes = await p.question.findMany({
      where: { source: "AI", sectionCode: "general-awareness", examCode: g.examCode, stem: g.stem },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    const toDelete = dupes.slice(1).map((d) => d.id); // keep first
    if (toDelete.length) {
      await p.option.deleteMany({ where: { questionId: { in: toDelete } } });
      await p.question.deleteMany({ where: { id: { in: toDelete } } });
      removed += toDelete.length;
    }
  }
  console.log(`Deduped AI GA by stem: removed ${removed} repeated near-duplicate(s) across ${groups.length} stem group(s).`);
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
