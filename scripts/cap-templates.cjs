// Caps each repetitive procedural template to MAX copies, so no single template
// dominates a test. Keeps the verified procedural questions as a correct core
// while the varied AI questions become the bulk. Preview unless --apply.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const MAX = Number(process.env.MAX) || 200;

function template(stem) {
  return stem.replace(/₹?\d[\d.,/:]*/g, "#").replace(/[A-Z]{2,}/g, "@").replace(/\s+/g, " ").trim().slice(0, 80);
}

(async () => {
  const secs = ["quant", "math", "maths", "reasoning", "general-intelligence"];
  const all = await prisma.question.findMany({
    where: { sectionCode: { in: secs }, source: { in: ["SEED", "MANUAL"] } },
    select: { id: true, sectionCode: true, stem: true },
  });
  // group by section+template
  const groups = {};
  for (const q of all) {
    const key = q.sectionCode + "::" + template(q.stem);
    (groups[key] ??= []).push(q.id);
  }
  const toDelete = [];
  let capped = 0;
  for (const [key, ids] of Object.entries(groups)) {
    if (ids.length > MAX) {
      // keep the first MAX, delete the rest
      const excess = ids.slice(MAX);
      toDelete.push(...excess);
      capped++;
    }
  }
  console.log(`Templates over ${MAX} copies: ${capped}. Questions to remove: ${toDelete.length}.`);
  if (!APPLY) { console.log("(PREVIEW — re-run with --apply.)"); await prisma.$disconnect(); return; }
  let del = 0;
  for (let i = 0; i < toDelete.length; i += 2000) {
    const r = await prisma.question.deleteMany({ where: { id: { in: toDelete.slice(i, i + 2000) } } });
    del += r.count; process.stdout.write(`  deleted ${del}\r`);
  }
  const total = await prisma.question.count();
  console.log(`\nCapped templates. Removed ${del}. Bank now ${total}.`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
