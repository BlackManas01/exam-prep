// Tricky batch #24 — EXTREME-HARD REASONING only. Hand-verified. All EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const REASONING_TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-chsl-tier1", sectionCode: "general-intelligence", subject: "General Intelligence" },
  { examCode: "ibps-po-prelims", sectionCode: "reasoning", subject: "Reasoning Ability" },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-cgl-tier2", sectionCode: "reasoning", subject: "Reasoning" },
];
const REASONING = [
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 5, 6, 9, 14, 21, ?", o: ["30", "28", "32", "29"], c: 0, e: "Differences 1, 3, 5, 7, 9 → 21 + 9 = 30." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 240, 120, 40, 10, 2, ?", o: ["1/3", "1", "0", "0.5"], c: 0, e: "Divided by 2, 3, 4, 5, 6 → 2 ÷ 6 = 1/3." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'CAT' = 24 and 'DOG' = 26 (sum of letter positions), then 'PIG' = ?", o: ["32", "30", "34", "28"], c: 0, e: "P(16)+I(9)+G(7) = 32." },
  { t: "Analogy", d: "EXPERT", q: "Soldier : Rifle :: Painter : ?", o: ["Brush", "Canvas", "Colour", "Easel"], c: 0, e: "A soldier's tool is a rifle; a painter's tool is a brush." },
  { t: "Blood Relations", d: "EXPERT", q: "A is B's father. B is C's mother. D is A's father. How is C related to D?", o: ["Great-grandchild", "Grandchild", "Child", "Nephew"], c: 0, e: "A is C's grandfather; D is A's father → D is C's great-grandfather → C is D's great-grandchild." },
  { t: "Direction Sense", d: "EXPERT", q: "A man walks 3 km East, 4 km North, 3 km West, 4 km South and finally 5 km East. Where is he relative to the start?", o: ["5 km East", "5 km West", "8 km East", "At the start"], c: 0, e: "East legs: 3 − 3 + 5 = 5; North legs cancel → 5 km East." },
  { t: "Ranking & Order", d: "EXPERT", q: "Among five boys, A is taller than C but shorter than B; D is shorter than E but taller than B. Who is the tallest?", o: ["E", "B", "D", "A"], c: 0, e: "E > D > B > A > C → E is the tallest." },
  { t: "Calendar", d: "EXPERT", q: "If 1 January 2021 was a Friday, what day of the week was 1 January 2022?", o: ["Saturday", "Sunday", "Friday", "Thursday"], c: 0, e: "2021 is a non-leap year (365 days → 1 odd day) → Friday + 1 = Saturday." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A cuboid measuring 4 cm × 3 cm × 2 cm is painted and then cut into 1 cm cubes. How many of the small cubes have no face painted?", o: ["0", "2", "4", "6"], c: 0, e: "Inner cubes = (4−2)(3−2)(2−2) = 2×1×0 = 0." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: Z26, Y25, X24, W23, ?", o: ["V22", "U22", "V21", "W22"], c: 0, e: "Letters Z,Y,X,W,V and numbers 26,25,24,23,22 → V22." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If the value of a word equals the product of the positions of its first and last letters, then the value of 'MATH' is:", o: ["104", "96", "112", "88"], c: 0, e: "M(13) × H(8) = 104." },
  { t: "Syllogism", d: "EXPERT", q: "Statements: Some X are Y. All Y are Z. Conclusions: I. Some X are Z. II. All Z are X. Which conclusion(s) follow?", o: ["Only I follows", "Only II follows", "Both follow", "Neither follows"], c: 0, e: "The X that are Y are also Z → some X are Z (I). 'All Z are X' is not established." },
  { t: "Counting Figures", d: "EXPERT", q: "How many squares (of all sizes) are there in a 3 × 3 grid of unit squares?", o: ["14", "9", "13", "10"], c: 0, e: "1×1: 9, 2×2: 4, 3×3: 1 → 9 + 4 + 1 = 14." },
  { t: "Number Series", d: "EXPERT", q: "Find the missing term: 6, 12, 21, 33, ?", o: ["48", "45", "50", "46"], c: 0, e: "Differences 6, 9, 12, 15 → 33 + 15 = 48." },
  { t: "Clocks", d: "EXPERT", q: "What is the angle between the hour and minute hands of a clock at 4:20?", o: ["10°", "20°", "15°", "5°"], c: 0, e: "|30×4 − 5.5×20| = |120 − 110| = 10°." },
  { t: "Logical Sequence", d: "EXPERT", q: "Arrange in a logical sequence: 1. Infant  2. Child  3. Adult  4. Old  5. Adolescent", o: ["1, 2, 5, 3, 4", "1, 2, 3, 5, 4", "1, 5, 2, 3, 4", "2, 1, 5, 3, 4"], c: 0, e: "Infant → Child → Adolescent → Adult → Old = 1, 2, 5, 3, 4." },
];
function contentHash(stem, correct) {
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
  return crypto.createHash("sha256").update(`${norm(stem)}::${norm(correct)}`).digest("hex");
}
function shuffled(opts, correctIdx) {
  const arr = opts.map((text, i) => ({ text, correct: i === correctIdx }));
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
(async () => {
  if (process.argv.includes("--verify")) {
    let n = 0; for (const q of REASONING) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); }
    console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return;
  }
  const qRows = [], oRows = [];
  for (const t of REASONING_TARGETS) for (const q of REASONING) {
    const id = crypto.randomUUID();
    qRows.push({ id, examCode: t.examCode, sectionCode: t.sectionCode, subject: t.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true });
    shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i }));
  }
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 24 (extreme reasoning) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
