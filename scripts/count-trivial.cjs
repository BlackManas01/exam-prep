// Counts genuinely-trivial questions (below real-exam standard) by stem pattern,
// so we can see the scale before deleting. REPORT ONLY.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Patterns that are below SSC standard (pure single-operation / direct recall).
const TRIVIAL = [
  { name: "bare arithmetic (Solve: a×b / a÷b / a+b)", re: /^solve:\s*\d[\d\s.,]*[×x*÷/+\-]\s*\d/i },
  { name: "what is X% of Y", re: /^what is \d+(\.\d+)?% of \d+/i },
  { name: "simple 'increased by X%'", re: /increased by \d+%\.\s*what is the new value/i },
  { name: "find the average of the numbers", re: /^find the average of the numbers/i },
  { name: "single-step simple interest", re: /^find the simple interest on/i },
];

(async () => {
  const secs = ["quant", "math", "maths", "reasoning", "general-intelligence"];
  const all = await prisma.question.findMany({
    where: { sectionCode: { in: secs } },
    select: { id: true, sectionCode: true, stem: true, difficulty: true },
  });
  const counts = {};
  let totalTrivial = 0;
  for (const q of all) {
    for (const p of TRIVIAL) {
      if (p.re.test(q.stem.trim())) {
        counts[p.name] = (counts[p.name] || 0) + 1;
        totalTrivial++;
        break;
      }
    }
  }
  console.log(`Scanned ${all.length} quant+reasoning questions.`);
  console.log(`Trivial (below exam standard): ${totalTrivial}\n`);
  for (const [n, c] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${n}: ${c}`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
