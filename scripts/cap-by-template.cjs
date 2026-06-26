// Cap number-clone templates in QUANT & REASONING only (English/GA untouched —
// there the masked token is a real different word, not a clone). Keeps EVERY
// distinct template, at most MAX copies, preferring the trickiest & verified
// (EXPERT > HARD > MEDIUM, MANUAL > AI > SEED). Preview unless --apply.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const MAX = Number(process.env.MAX) || 2;
const SECTIONS = ["quant", "math", "maths", "reasoning", "general-intelligence"];

function tmpl(s) {
  return s.replace(/₹?\d[\d.,/:]*/g, "#").replace(/\b[A-Z]\b/g, "@").replace(/[A-Z]{2,}/g, "@").replace(/\s+/g, " ").trim().slice(0, 70);
}
const diffRank = { EXPERT: 0, HARD: 1, MEDIUM: 2, EASY: 3 };
const srcRank = { MANUAL: 0, AI: 1, SEED: 2 };

(async () => {
  const rows = await p.question.findMany({
    where: { sectionCode: { in: SECTIONS } },
    select: { id: true, examCode: true, sectionCode: true, stem: true, source: true, difficulty: true },
  });
  // group by exam+section+template
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.examCode}::${r.sectionCode}::${tmpl(r.stem)}`;
    (groups.get(key) || groups.set(key, []).get(key)).push(r);
  }
  const toDelete = [];
  let cappedTemplates = 0;
  for (const arr of groups.values()) {
    if (arr.length <= MAX) continue;
    cappedTemplates++;
    arr.sort((a, b) =>
      (diffRank[a.difficulty] - diffRank[b.difficulty]) ||
      ((srcRank[a.source] ?? 3) - (srcRank[b.source] ?? 3))
    );
    for (const r of arr.slice(MAX)) toDelete.push(r.id);
  }
  console.log(`Sections: ${SECTIONS.join(", ")}`);
  console.log(`Total questions scanned: ${rows.length}`);
  console.log(`Distinct templates: ${groups.size}`);
  console.log(`Templates over ${MAX} copies: ${cappedTemplates}`);
  console.log(`Questions to delete: ${toDelete.length}`);
  console.log(`Questions remaining after cap: ${rows.length - toDelete.length}`);
  if (!APPLY) { console.log("\nDRY RUN — add --apply to execute."); await p.$disconnect(); return; }
  for (let i = 0; i < toDelete.length; i += 1000) {
    const chunk = toDelete.slice(i, i + 1000);
    await p.option.deleteMany({ where: { questionId: { in: chunk } } });
    await p.question.deleteMany({ where: { id: { in: chunk } } });
    process.stdout.write(`  deleted ${Math.min(i + 1000, toDelete.length)}/${toDelete.length}\r`);
  }
  console.log("\nDone.");
  await p.$disconnect();
})().catch(async (e) => { console.error(e); await p.$disconnect(); process.exit(1); });
