// Deletes genuinely-trivial, below-exam-standard questions by STRICT stem
// patterns. Run with --apply to delete; without it, previews samples + counts.
// Neon keeps automatic backups, and these patterns are pure single-step filler.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const PATTERNS = [
  // "Solve: 61 × 42 = ?"  — exactly ONE operator between two numbers (not BODMAS).
  { name: "bare single-operation arithmetic", re: /^solve:\s*\d[\d.,]*\s*[×x*÷/+\-]\s*\d[\d.,]*\s*(=\s*)?\??$/i },
  { name: "what is X% of Y", re: /^what is \d+(\.\d+)?% of \d+\s*\??$/i },
  { name: "increased by X% → new value", re: /increased by \d+%\.\s*what is the new value\s*\??$/i },
  { name: "average of a bare list", re: /^find the average of the numbers:/i },
  { name: "single-step simple interest", re: /^find the simple interest on ₹?\d/i },
];

(async () => {
  const secs = ["quant", "math", "maths", "reasoning", "general-intelligence"];
  const all = await prisma.question.findMany({
    where: { sectionCode: { in: secs } },
    select: { id: true, stem: true },
  });
  const ids = [];
  const samples = {};
  for (const q of all) {
    for (const p of PATTERNS) {
      if (p.re.test(q.stem.trim())) {
        ids.push(q.id);
        (samples[p.name] ??= []).push(q.stem.trim().slice(0, 70));
        break;
      }
    }
  }
  console.log(`Matched ${ids.length} trivial questions.\n`);
  for (const [n, arr] of Object.entries(samples)) {
    console.log(`• ${n}: ${arr.length}`);
    for (const s of arr.slice(0, 2)) console.log(`     e.g. ${s}`);
  }

  if (!APPLY) {
    console.log("\n(PREVIEW ONLY — re-run with --apply to delete.)");
    await prisma.$disconnect();
    return;
  }
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 2000) {
    const batch = ids.slice(i, i + 2000);
    const r = await prisma.question.deleteMany({ where: { id: { in: batch } } });
    deleted += r.count;
    process.stdout.write(`  deleted ${deleted}\r`);
  }
  const remaining = await prisma.question.count();
  console.log(`\nDeleted ${deleted} trivial questions. Bank now ${remaining} total.`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
