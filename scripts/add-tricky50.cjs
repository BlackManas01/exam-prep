// Tricky batch #50 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 4, 6, 9, 13, 18, ?", o: ["24", "23", "25", "22"], c: 0, e: "Differences 2,3,4,5,6 → 18+6 = 24." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 3, 6, 18, 72, ?", o: ["360", "288", "300", "216"], c: 0, e: "×2,×3,×4,×5: 72×5 = 360." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'CAB' = 6, 'BED' = 13, sum of letter positions, then 'ACE' = ?", o: ["9", "8", "10", "7"], c: 0, e: "A1+C3+E5 = 9." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 11, 13, 17, 19, 23, ?", o: ["29", "27", "25", "31"], c: 0, e: "Consecutive primes → 29." },
  { t: "Direction Sense", d: "EXPERT", q: "Facing South, turn left, then left again. Now facing?", o: ["North", "East", "West", "South"], c: 0, e: "S→E→N → North." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A 4×4×4 cube painted, cut into 64. How many have NO face painted?", o: ["8", "24", "16", "0"], c: 0, e: "Inner 2×2×2 = 8." },
  { t: "Clock", d: "EXPERT", q: "Angle between hands at 2:00?", o: ["60°", "90°", "120°", "30°"], c: 0, e: "2×30 = 60°." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: D, H, L, P, ?", o: ["T", "R", "S", "U"], c: 0, e: "+4 each: D,H,L,P,T." },
  { t: "Syllogism", d: "EXPERT", q: "No A is B. All C are A. Conclusion: No C is B. Follows?", o: ["Yes", "No", "Cannot say", "Sometimes"], c: 0, e: "All C are A and no A is B → no C is B." },
  { t: "Mathematical Operations", d: "EXPERT", q: "Solve: 12 − 4 × 2 + 6 ÷ 3 (BODMAS)", o: ["6", "8", "4", "10"], c: 0, e: "4×2=8, 6÷3=2 → 12−8+2 = 6." },
  { t: "Analogy", d: "EXPERT", q: "3 : 27 :: 4 : ?", o: ["64", "48", "16", "81"], c: 0, e: "n³: 4³ = 64." },
  { t: "Ranking & Order", d: "EXPERT", q: "In 50 people, A is 20th from left. Position from right?", o: ["31st", "30th", "29th", "32nd"], c: 0, e: "50−20+1 = 31st." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 24, 36, 48, 50", o: ["50", "24", "36", "48"], c: 0, e: "24,36,48 divisible by 12; 50 is not." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: ABD, EFH, IJL, ?", o: ["MNP", "MNO", "LMN", "MOP"], c: 0, e: "Each block: +4 to start (A,E,I,M); pattern +1,+2 → MNP." },
  { t: "Analogy", d: "EXPERT", q: "Author : Book :: Composer : ?", o: ["Symphony", "Piano", "Stage", "Song"], c: 0, e: "Creator-creation: composer creates a symphony." },
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
  console.log(`Batch 50 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
