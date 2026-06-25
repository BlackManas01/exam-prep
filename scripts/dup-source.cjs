const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const rows = await p.$queryRawUnsafe(
    `SELECT q.source, q.sectionCode, q.topic, q.stem
       FROM Question q
       JOIN (SELECT questionId FROM "Option" GROUP BY questionId, text HAVING COUNT(*) > 1) d
         ON d.questionId = q.id
       GROUP BY q.id`
  );
  const bySource = {};
  for (const r of rows) bySource[r.source] = (bySource[r.source] || 0) + 1;
  console.log("Duplicate-option questions by source:", bySource);
  // show any non-AI ones (would indicate a generator bug)
  const nonAI = rows.filter((r) => r.source !== "AI");
  if (nonAI.length) {
    console.log("\n⚠ NON-AI (generator/curated) duplicate-option questions:");
    nonAI.forEach((r) => console.log(`  [${r.source}] ${r.sectionCode}/${r.topic}: ${r.stem.slice(0, 70)}`));
  } else {
    console.log("✓ All duplicate-option questions are AI-generated (generators clean).");
  }
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
