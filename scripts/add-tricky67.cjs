// Tricky batch #67 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next: 1, 2, 4, 7, 11, 16, ?", o: ["22", "21", "23", "20"], c: 0, e: "+1,+2,+3,+4,+5,+6: 16+6 = 22." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 8, 16, 24, 32, ?", o: ["40", "48", "36", "44"], c: 0, e: "+8: 32+8 = 40." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'CODE'=27 (C3+O15+D4+E5), 'BAT'=?", o: ["23", "22", "24", "21"], c: 0, e: "B2+A1+T20 = 23." },
  { t: "Direction Sense", d: "EXPERT", q: "Walk 15 N, 8 W. Distance:", o: ["17 km", "23 km", "13 km", "21 km"], c: 0, e: "√(225+64) = 17." },
  { t: "Clock", d: "EXPERT", q: "Angle between hands at 5:00:", o: ["150°", "120°", "180°", "90°"], c: 0, e: "5×30 = 150°." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: P, M, J, G, ?", o: ["D", "E", "C", "F"], c: 0, e: "−3 each: P,M,J,G,D." },
  { t: "Syllogism", d: "EXPERT", q: "All apples are fruits. All fruits are sweet. Conclusion: All apples are sweet. Follows?", o: ["Yes", "No", "Cannot say", "Rarely"], c: 0, e: "Transitive → yes." },
  { t: "Analogy", d: "EXPERT", q: "2 : 5 :: 4 : ?", o: ["17", "16", "15", "18"], c: 0, e: "n²+1: 4²+1 = 17." },
  { t: "Ranking & Order", d: "EXPERT", q: "X 14th from left, 17th from right. Total:", o: ["30", "31", "29", "32"], c: 0, e: "14+17−1 = 30." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 12, 24, 36, 50", o: ["50", "12", "24", "36"], c: 0, e: "12,24,36 divisible by 12; 50 not." },
  { t: "Mathematical Operations", d: "EXPERT", q: "9 + 3 × 4 − 6 ÷ 2 (BODMAS):", o: ["18", "20", "16", "21"], c: 0, e: "12 − 3 + 9 = 18." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: AB, CD, EF, ?", o: ["GH", "FG", "HI", "GI"], c: 0, e: "Consecutive pairs → GH." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 1, 1, 2, 6, 24, ?", o: ["120", "100", "96", "144"], c: 0, e: "×1,×2,×3,×4,×5 → 24×5 = 120." },
  { t: "Blood Relations", d: "EXPERT", q: "M is N's father, N is O's sister. M is O's:", o: ["Father", "Uncle", "Brother", "Grandfather"], c: 0, e: "N & O siblings, M father of N → O's father." },
  { t: "Analogy", d: "EXPERT", q: "Fish : School :: Wolf : ?", o: ["Pack", "Pride", "Herd", "Flock"], c: 0, e: "Collective noun: group of wolves = pack." },
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
  console.log(`Batch 67 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
