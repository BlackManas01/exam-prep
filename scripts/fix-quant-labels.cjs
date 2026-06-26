// Fixes the broken difficulty labels: the procedural SEED generators are all
// single-step (EASY–MEDIUM by nature) but were mislabeled HARD/EXPERT by answer
// magnitude. Demote every SEED quant/math question tagged HARD or EXPERT to
// MEDIUM, so the HARD/EXPERT tiers contain only the verified multi-step PYQ set.
// (Does NOT touch MANUAL or AI questions.)
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const before = await prisma.question.groupBy({
    by: ["difficulty"],
    where: { sectionCode: { in: ["quant", "math", "maths"] }, source: "SEED" },
    _count: { _all: true },
  });
  console.log("Before:", before.map((b) => `${b.difficulty}:${b._count._all}`).join("  "));

  const res = await prisma.question.updateMany({
    where: {
      sectionCode: { in: ["quant", "math", "maths"] },
      source: "SEED",
      difficulty: { in: ["HARD", "EXPERT"] },
    },
    data: { difficulty: "MEDIUM" },
  });
  console.log(`Demoted ${res.count} mislabeled SEED quant questions HARD/EXPERT → MEDIUM.`);

  const after = await prisma.question.groupBy({
    by: ["difficulty", "source"],
    where: { sectionCode: { in: ["quant", "math", "maths"] } },
    _count: { _all: true },
  });
  console.log("\nAfter (quant/math/maths):");
  for (const a of after.sort((x, y) => (x.difficulty + x.source).localeCompare(y.difficulty + y.source)))
    console.log(`  ${a.difficulty}/${a.source}: ${a._count._all}`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
