const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const APPLY = process.argv.includes("--apply");
(async () => {
  // Math is the highest-stakes section. Hide raw AI math questions (reversible)
  // so only hand-verified (MANUAL/SEED) math is served until AI is re-verified.
  const where = { sectionCode: { in: ["quant", "math", "maths"] }, source: "AI", isActive: true };
  const n = await p.question.count({ where });
  console.log(`Raw-AI math questions currently active: ${n}`);
  if (!APPLY) { console.log("DRY RUN — add --apply to deactivate (reversible)."); await p.$disconnect(); return; }
  const r = await p.question.updateMany({ where, data: { isActive: false } });
  console.log(`Deactivated ${r.count} raw-AI math questions (hidden from tests, not deleted).`);
  // Confirm what remains active for tier1 quant.
  const g = await p.question.groupBy({
    by: ["source"], where: { examCode: "ssc-cgl-tier1", sectionCode: "quant", isActive: true }, _count: true,
  });
  console.log("Tier1 quant now active:", g.map((x) => `${x.source} ${x._count}`).join("  "));
  await p.$disconnect();
})();
