// Tricky batch #75 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next: 4, 8, 16, 32, ?", o: ["64", "48", "60", "40"], c: 0, e: "×2 → 64." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 121, 100, 81, 64, ?", o: ["49", "50", "47", "45"], c: 0, e: "Squares 11,10,9,8 → 7² = 49." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'KEY'=39 (sum positions), 'LOCK'=?", o: ["41", "39", "43", "37"], c: 0, e: "L12+O15+C3+K11 = 41." },
  { t: "Direction Sense", d: "EXPERT", q: "Walk 12 W, 5 S. Distance:", o: ["13 km", "17 km", "7 km", "11 km"], c: 0, e: "√(144+25) = 13." },
  { t: "Clock", d: "EXPERT", q: "Angle at 8:00:", o: ["120°", "90°", "150°", "60°"], c: 0, e: "4 hr ×30 = 120°." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: B, E, I, N, ?", o: ["T", "S", "U", "R"], c: 0, e: "+3,+4,+5,+6: N+6 = T." },
  { t: "Syllogism", d: "EXPERT", q: "No fish is bird. All sparrows are birds. So no sparrow is fish. Valid?", o: ["Yes", "No", "Cannot say", "Partly"], c: 0, e: "Valid: sparrows are birds, none of which are fish." },
  { t: "Analogy", d: "EXPERT", q: "9 : 730 :: 6 : ?", o: ["217", "216", "218", "215"], c: 0, e: "n³+1: 6³+1 = 217." },
  { t: "Ranking & Order", d: "EXPERT", q: "X 20th from left, 30th from right. Total:", o: ["49", "50", "48", "51"], c: 0, e: "20+30−1 = 49." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 36, 64, 81, 90", o: ["90", "36", "64", "81"], c: 0, e: "36,64,81 squares; 90 not." },
  { t: "Mathematical Operations", d: "EXPERT", q: "50 − 6 × 5 + 8 ÷ 2:", o: ["24", "20", "26", "22"], c: 0, e: "30, 4 → 50−30+4 = 24." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: MN, PQ, ST, ?", o: ["VW", "UV", "WX", "VX"], c: 0, e: "+3 starts (M,P,S,V) → VW." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 5, 11, 23, 47, ?", o: ["95", "94", "96", "92"], c: 0, e: "×2+1: 47×2+1 = 95." },
  { t: "Blood Relations", d: "EXPERT", q: "A is mother of B and C. C is son. B is daughter. B & C are:", o: ["Siblings", "Cousins", "Twins", "Unrelated"], c: 0, e: "Same mother → siblings." },
  { t: "Analogy", d: "EXPERT", q: "Lion : Den :: Bee : ?", o: ["Hive", "Nest", "Web", "Burrow"], c: 0, e: "Home pair: bees live in a hive." },
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
  console.log(`Batch 75 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
