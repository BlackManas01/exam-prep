// Cleanup: deactivate single-step "easy" MANUAL questions that slipped into the
// brutal batches. Keeps genuine multi-step traps. Run: node scripts/clean-easy.cjs
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// Stems that are single-step / not brutal — match by simple signatures.
const EASY = [
  /^find the next: [a-z], [a-z], [a-z]/i,        // simple single-letter series
  /^find the next: [a-z][a-z], [a-z][a-z]/i,     // simple pair series
  /^\d+% of \d+ = \?$/i, /^\d+(\.\d+)?% of \d+:?$/i, // plain "x% of y"
  /^√\d+ = \?$|^∛\d+ = \?$|^√\(\d+×\d+\) = \?$/i,  // plain roots
  /^average of [\d,\s]+:?$|^avg of [\d,\s]+:?$/i,  // plain comma-list average
  /^cube root of \d+:?$/i,
  /^volume of cube side|^total surface area of a cube of side|^area of rectangle|^volume of cuboid|^circumference of a circle radius|^diagonal of a square of side/i,
  /^convert \d+ km\/h|^\d+ km in [\d.]+ h/i,
  /^sin45° = |^cot45° = |^tan45° \+ cot45|^cos0° \+ sin0|^cos60° \+ sin30|^sin30° \+ cos60|^sin90° − cos90|^sec60° = /i,
  /^log[₂₅₁₀]+\d+ = \?$|^log₁₀1000/i,
  /^\d+ × \d+ = \?$|^999 × 7|^13 × 13/i,
  /^lcm of [\d,\s]+:?$|^fourth proportional to/i,
];
(async () => {
  const rows = await prisma.question.findMany({ where: { source: "MANUAL", difficulty: "EXPERT" }, select: { id: true, stem: true } });
  const ids = rows.filter((r) => EASY.some((re) => re.test(r.stem))).map((r) => r.id);
  if (process.argv.includes("--dry")) { console.log(`Would deactivate ${ids.length} of ${rows.length} MANUAL EXPERT.`); rows.filter((r)=>EASY.some(re=>re.test(r.stem))).slice(0,20).forEach(r=>console.log(" -",r.stem)); await prisma.$disconnect(); return; }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(ids, 500, (b) => prisma.question.updateMany({ where: { id: { in: b } }, data: { isActive: false } }));
  console.log(`Deactivated ${ids.length} easy questions (of ${rows.length} MANUAL EXPERT).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
