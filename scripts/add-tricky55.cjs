// Tricky batch #55 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next: 5, 9, 17, 33, 65, ?", o: ["129", "127", "130", "131"], c: 0, e: "×2−1: 65×2−1 = 129." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 6, 11, 21, 36, 56, ?", o: ["81", "76", "78", "80"], c: 0, e: "+5,+10,+15,+20,+25 → 56+25 = 81." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'RED' = 27 (sum of positions), 'BLUE' = ?", o: ["40", "38", "42", "44"], c: 0, e: "B2+L12+U21+E5 = 40." },
  { t: "Direction Sense", d: "EXPERT", q: "Facing East, turn 180°, then right. Now facing?", o: ["North", "South", "West", "East"], c: 0, e: "E→W (180), then right → North." },
  { t: "Clock", d: "EXPERT", q: "Reflex angle between hands at 3:00?", o: ["270°", "90°", "180°", "300°"], c: 0, e: "Acute 90° → reflex = 360−90 = 270°." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: A, D, I, P, ?", o: ["Y", "W", "X", "Z"], c: 0, e: "Positions 1,4,9,16,25 (squares) → Y (25th)." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A 3×3×3 cube painted, cut into 27. Cubes with no paint:", o: ["1", "8", "0", "6"], c: 0, e: "Only the centre cube → 1." },
  { t: "Syllogism", d: "EXPERT", q: "All squares are rectangles. No rectangle is a circle. Conclusion: No square is a circle. Follows?", o: ["Yes", "No", "Cannot say", "Rarely"], c: 0, e: "All squares are rectangles, none of which is a circle → no square is a circle." },
  { t: "Analogy", d: "EXPERT", q: "2 : 8 :: 3 : ?", o: ["27", "18", "9", "12"], c: 0, e: "n³: 3³ = 27." },
  { t: "Ranking & Order", d: "EXPERT", q: "In 60, A 25th from top. Rank from bottom:", o: ["36th", "35th", "34th", "37th"], c: 0, e: "60−25+1 = 36th." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 64, 125, 216, 200", o: ["200", "64", "125", "216"], c: 0, e: "64,125,216 are cubes; 200 not." },
  { t: "Mathematical Operations", d: "EXPERT", q: "100 − 50 ÷ 5 + 2 × 3 (BODMAS):", o: ["96", "90", "100", "94"], c: 0, e: "50÷5=10, 2×3=6 → 100−10+6 = 96." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: ZA, YB, XC, ?", o: ["WD", "WC", "VD", "WE"], c: 0, e: "First −1 (Z,Y,X,W); second +1 (A,B,C,D) → WD." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 1, 4, 27, 256, ?", o: ["3125", "625", "1024", "729"], c: 0, e: "nⁿ: 1,2²,3³,4⁴,5⁵ = 3125." },
  { t: "Analogy", d: "EXPERT", q: "Bee : Hive :: Spider : ?", o: ["Web", "Net", "Hole", "Tree"], c: 0, e: "Home pair: spider lives in a web." },
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
  console.log(`Batch 55 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
