const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const APPLY = process.argv.includes("--apply");

(async () => {
  const sec = { in: ["reasoning", "general-intelligence"] };
  const rows = await p.question.findMany({
    where: { sectionCode: sec, difficulty: "MEDIUM", source: "SEED" },
    select: { id: true, stem: true },
  });

  const isSingleStep = (s) => {
    // ages: father N times son, find son -> one division
    if (/times as old as (his|her)? ?son/i.test(s) && /present age/i.test(s)) return true;
    // single-turn direction: exactly one "then turns" (one Pythagorean leg)
    const turns = (s.match(/turns? and walks/gi) || []).length;
    if (/walks \d+\s?m towards/i.test(s) && turns <= 1) return true;
    // 2-person blood relation: single hop (only one "is the father/mother/son" chain link to grandfather)
    if (/^[A-Z] is the (father|mother) of [A-Z]\. [A-Z] is the (father|mother) of [A-Z]\./.test(s)) return true;
    return false;
  };

  const hit = rows.filter((r) => isSingleStep(r.stem));
  console.log("Reasoning SEED MEDIUM total:", rows.length, " single-step to demote:", hit.length);
  console.log("samples:");
  hit.slice(0, 8).forEach((r) => console.log("  " + r.stem.slice(0, 90)));

  if (!APPLY) { console.log("\nDRY RUN. add --apply"); await p.$disconnect(); return; }
  const ids = hit.map((r) => r.id);
  for (let i = 0; i < ids.length; i += 1000) {
    await p.question.updateMany({ where: { id: { in: ids.slice(i, i + 1000) } }, data: { difficulty: "EASY" } });
  }
  console.log("demoted:", ids.length);
  const byDiff = await p.question.groupBy({ by: ["difficulty"], where: { sectionCode: sec }, _count: true });
  console.log("New reasoning distribution:");
  for (const d of byDiff) console.log(" ", d.difficulty, d._count);
  await p.$disconnect();
})();
