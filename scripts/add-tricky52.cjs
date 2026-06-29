// Tricky batch #52 — BRUTAL REASONING. Hand-verified. All EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-chsl-tier1", sectionCode: "general-intelligence", subject: "General Intelligence" },
  { examCode: "ibps-po-prelims", sectionCode: "reasoning", subject: "Reasoning Ability" },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-cgl-tier2", sectionCode: "reasoning", subject: "Reasoning" },
];
const ITEMS = [
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 100, 96, 88, 76, ?", o: ["60", "64", "58", "62"], c: 0, e: "−4,−8,−12,−16 → 76−16 = 60." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 7, 14, 28, 56, ?", o: ["112", "98", "104", "120"], c: 0, e: "×2 each: 56×2 = 112." },
  { t: "Number Series", d: "EXPERT", q: "Fibonacci: 1, 1, 2, 3, 5, 8, ?", o: ["13", "11", "12", "14"], c: 0, e: "8+5 = 13." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A 6×6×6 cube painted, cut into 216. How many have exactly one face painted?", o: ["96", "64", "48", "100"], c: 0, e: "4×4 per face × 6 = 96." },
  { t: "Clock", d: "EXPERT", q: "Angle between hands at 1:00?", o: ["30°", "60°", "90°", "45°"], c: 0, e: "1×30 = 30°." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: E, J, O, T, ?", o: ["Y", "X", "Z", "W"], c: 0, e: "+5 each: E,J,O,T,Y." },
  { t: "Analogy", d: "EXPERT", q: "6 : 42 :: 9 : ?", o: ["90", "81", "72", "99"], c: 0, e: "n(n+1): 6×7=42, 9×10 = 90." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 11, 13, 17, 21", o: ["21", "11", "13", "17"], c: 0, e: "21 = 3×7, others prime." },
  { t: "Direction Sense", d: "EXPERT", q: "Walk 8 N, 6 W, 8 S. Distance from start:", o: ["6 km", "8 km", "10 km", "14 km"], c: 0, e: "N/S cancel → 6 km West." },
  { t: "Syllogism", d: "EXPERT", q: "All dogs are mammals. All mammals are animals. Conclusion: All dogs are animals. Follows?", o: ["Yes", "No", "Cannot say", "Rarely"], c: 0, e: "Transitive → all dogs are animals." },
  { t: "Mathematical Operations", d: "EXPERT", q: "20 ÷ 4 + 3 × 2 − 1 (BODMAS):", o: ["10", "12", "9", "11"], c: 0, e: "5 + 6 − 1 = 10." },
  { t: "Ranking & Order", d: "EXPERT", q: "A is 7th from left, B 9th from right in 25. Their ranks from left differ by:", o: ["10", "9", "7", "8"], c: 0, e: "A=7, B=25−9+1=17 → 17−7 = 10." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: AC, EG, IK, ?", o: ["MO", "MN", "NP", "LM"], c: 0, e: "+4 to start (A,E,I,M); +2 inside → MO." },
  { t: "Analogy", d: "EXPERT", q: "Triangle : 3 :: Hexagon : ?", o: ["6", "5", "8", "7"], c: 0, e: "Sides: hexagon has 6." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 2, 3, 5, 7, 11, 13, ?", o: ["17", "15", "19", "14"], c: 0, e: "Primes → 17." },
];
function contentHash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffled(o, ci) { const a = o.map((text, i) => ({ text, correct: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  if (process.argv.includes("--verify")) { let n = 0; for (const q of ITEMS) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); } console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const T of TARGETS) for (const q of ITEMS) { const id = crypto.randomUUID(); qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true }); shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i })); }
  const chunk = async (arr, sz, fn) => { for (let i = 0; i < arr.length; i += sz) await fn(arr.slice(i, i + sz)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 52 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
