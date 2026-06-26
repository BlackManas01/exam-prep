// Deletes below-CGL single-step question templates (8th-grade level). These are
// direct one-step formula/recall questions, not exam-standard. Preview by
// default; --apply to delete. Keeps the genuine multi-step problems.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const KILL = [
  { name: "third angle of triangle", re: /^Two angles of a triangle are/i },
  { name: "area of triangle (base×height)", re: /^Find the area of a triangle with base/i },
  { name: "area of rectangle", re: /^Find the area of a rectangle/i },
  { name: "perimeter (direct)", re: /^Find the perimeter of (a |the )/i },
  { name: "volume of cuboid", re: /^Find the volume of a cuboid/i },
  { name: "HCF (direct)", re: /^Find the HCF of/i },
  { name: "LCM (direct)", re: /^Find the LCM of/i },
  { name: "number decreased by %", re: /^A number \d+ is decreased by \d+%/i },
  { name: "single linear equation", re: /^Solve for x:/i },
  { name: "profit→SP (single step)", re: /sold at a profit of \d+%\.\s*Find the selling price/i },
  { name: "marked price→discount→SP (single)", re: /^The marked price of an article is .*discount of \d+% is given on it\.\s*Find/i },
  { name: "average speed (distance/time)", re: /^A car covers a distance of .*Find its average speed/i },
  { name: "time = distance/speed", re: /^A train travels \d+ km at a uniform speed.*How long does it take/i },
  { name: "ratio share (direct)", re: /is divided among A, B and C in the ratio.*What is [ABC]'s share/i },
  { name: "business profit ratio (no time)", re: /^A and B start a business investing .*At the end of the year/i },
  { name: "simple average of list", re: /^Find the average of/i },
];

(async () => {
  const all = await prisma.question.findMany({
    where: { sectionCode: { in: ["quant", "math", "maths"] } },
    select: { id: true, stem: true },
  });
  const ids = [];
  const counts = {};
  for (const q of all) {
    for (const k of KILL) {
      if (k.re.test(q.stem.trim())) { ids.push(q.id); counts[k.name] = (counts[k.name] || 0) + 1; break; }
    }
  }
  console.log(`Quant total: ${all.length}.  Below-CGL matches: ${ids.length}\n`);
  for (const [n, c] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(c).padStart(6)}  ${n}`);

  if (!APPLY) { console.log("\n(PREVIEW — re-run with --apply to delete.)"); await prisma.$disconnect(); return; }
  let del = 0;
  for (let i = 0; i < ids.length; i += 2000) {
    const r = await prisma.question.deleteMany({ where: { id: { in: ids.slice(i, i + 2000) } } });
    del += r.count; process.stdout.write(`  deleted ${del}\r`);
  }
  const total = await prisma.question.count();
  console.log(`\nDeleted ${del} below-CGL questions. Bank now ${total}.`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
