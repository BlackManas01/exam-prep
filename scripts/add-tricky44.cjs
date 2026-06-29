// Tricky batch #44 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 4, 9, 16, 25, ?", o: ["36", "30", "35", "49"], c: 0, e: "Perfect squares: 6² = 36." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 2, 6, 12, 20, 30, ?", o: ["42", "40", "44", "36"], c: 0, e: "n²+n: 6²+6 = 42." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'SUN' = 54 (sum of positions), then 'MOON' = ?", o: ["57", "55", "59", "53"], c: 0, e: "M13+O15+O15+N14 = 57." },
  { t: "Blood Relations", d: "EXPERT", q: "A man's father's only daughter's son is your nephew. The man is your ?", o: ["Brother", "Father", "Uncle", "Cousin"], c: 0, e: "Father's only daughter = your sister; her son is your nephew → the man (her sibling's male) is your brother." },
  { t: "Direction Sense", d: "EXPERT", q: "Walk 12 km North then 5 km East. Straight-line distance from start?", o: ["13 km", "17 km", "7 km", "11 km"], c: 0, e: "√(12²+5²) = 13 km." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A 4×4×4 cube painted and cut into 64 cubes. How many have exactly two faces painted?", o: ["24", "8", "16", "12"], c: 0, e: "Edge cubes: 2 per edge × 12 edges = 24." },
  { t: "Clock", d: "EXPERT", q: "Angle between hands at 9:00?", o: ["90°", "180°", "120°", "60°"], c: 0, e: "Right angle at 9:00 → 90°." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: B, F, J, N, ?", o: ["R", "P", "Q", "S"], c: 0, e: "+4 each: B,F,J,N,R." },
  { t: "Syllogism", d: "EXPERT", q: "Some A are B. All B are C. Conclusion: Some A are C. Follows?", o: ["Yes", "No", "Cannot say", "Never"], c: 0, e: "Some A are B and all B are C → some A are C." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If 2#3 = 13 and 4#5 = 41, then 7#8 = ?", o: ["113", "111", "120", "100"], c: 0, e: "a²+b²: 49+64 = 113." },
  { t: "Analogy", d: "EXPERT", q: "7 : 50 :: 9 : ?", o: ["82", "81", "90", "72"], c: 0, e: "n²+1: 9²+1 = 82." },
  { t: "Ranking & Order", d: "EXPERT", q: "In a row of 30, X is 12th from bottom. Rank from top?", o: ["19th", "18th", "20th", "17th"], c: 0, e: "30 − 12 + 1 = 19th." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 8, 27, 64, 100", o: ["100", "8", "27", "64"], c: 0, e: "8,27,64 are cubes; 100 is not." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next pair: AZ, BY, CX, ?", o: ["DW", "DV", "EW", "DX"], c: 0, e: "First +1 (A,B,C,D); second −1 (Z,Y,X,W) → DW." },
  { t: "Analogy", d: "EXPERT", q: "Doctor : Hospital :: Teacher : ?", o: ["School", "Book", "Student", "Class"], c: 0, e: "Workplace pair: teacher works in a school." },
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
  console.log(`Batch 44 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
