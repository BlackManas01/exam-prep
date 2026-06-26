// Reveals (a) how repetitive the bank is — groups questions by a normalized
// "template" (stem with numbers stripped) and shows the most-repeated templates,
// and (b) trivial single-step patterns still present. REPORT ONLY.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function template(stem) {
  return stem
    .replace(/₹?\d[\d.,/]*/g, "#")      // numbers → #
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 75);
}

(async () => {
  const secs = ["quant", "math", "maths"];
  const all = await prisma.question.findMany({
    where: { sectionCode: { in: secs } },
    select: { stem: true, difficulty: true, source: true },
  });
  console.log(`Total quant questions: ${all.length}\n`);

  // (a) Repetition — most common templates
  const tmpl = {};
  for (const q of all) {
    const t = template(q.stem);
    tmpl[t] ??= { n: 0, diff: q.difficulty };
    tmpl[t].n++;
  }
  const sorted = Object.entries(tmpl).sort((a, b) => b[1].n - a[1].n);
  console.log(`Distinct templates: ${sorted.length}`);
  console.log(`\n=== Top 25 most-REPEATED templates ===`);
  for (const [t, info] of sorted.slice(0, 25)) {
    console.log(`  ${String(info.n).padStart(6)} × [${info.diff}]  ${t}`);
  }
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
