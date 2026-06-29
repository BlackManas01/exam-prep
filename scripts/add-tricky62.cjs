// Tricky batch #62 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next: 3, 4, 8, 17, 33, ?", o: ["58", "56", "60", "54"], c: 0, e: "+1,+4,+9,+16,+25: 33+25 = 58." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 2, 12, 36, 80, ?", o: ["150", "120", "144", "160"], c: 0, e: "n³+n²: 5³+5² = 150." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'FISH'→'EHRG' (−1 each), 'BIRD'→ ?", o: ["AHQC", "AHQD", "BHQC", "AGQC"], c: 0, e: "−1: B→A, I→H, R→Q, D→C → AHQC." },
  { t: "Direction Sense", d: "EXPERT", q: "Walk 7 N, 24 E. Distance from start:", o: ["25 km", "31 km", "17 km", "23 km"], c: 0, e: "√(49+576) = 25." },
  { t: "Clock", d: "EXPERT", q: "How many times do clock hands overlap in 12 hours?", o: ["11", "12", "10", "13"], c: 0, e: "Hands coincide 11 times in 12 hours." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: Z, X, U, Q, ?", o: ["L", "M", "N", "K"], c: 0, e: "−2,−3,−4,−5: Q−5 = L." },
  { t: "Syllogism", d: "EXPERT", q: "All books are pens. Some pens are red. Conclusion: Some books are red. Follows?", o: ["No", "Yes", "Definitely", "Always"], c: 0, e: "Red pens need not be books → does not follow." },
  { t: "Analogy", d: "EXPERT", q: "1 : 1 :: 2 : 8 :: 3 : ?", o: ["27", "9", "18", "12"], c: 0, e: "n³: 3³ = 27." },
  { t: "Ranking & Order", d: "EXPERT", q: "Among 5, P>Q, Q>R, S<R, T>P. Tallest:", o: ["T", "P", "Q", "R"], c: 0, e: "T>P>Q>R>S → T tallest." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If + means ×, × means −, then 6 + 2 × 3 = ?", o: ["9", "15", "12", "10"], c: 0, e: "6×2−3 = 12−3 = 9." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 343, 512, 729, 1000", o: ["None — all are cubes", "343", "512", "729"], c: 0, e: "7³,8³,9³,10³ → all cubes." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: BC, EF, HI, ?", o: ["KL", "JK", "LM", "KM"], c: 0, e: "+3 starts (B,E,H,K) → KL." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 4, 9, 19, 39, 79, ?", o: ["159", "158", "160", "155"], c: 0, e: "×2+1: 79×2+1 = 159." },
  { t: "Blood Relations", d: "EXPERT", q: "X's mother is Y's father's wife. X and Y are:", o: ["Siblings", "Cousins", "Unrelated", "Spouses"], c: 0, e: "Same parents → siblings." },
  { t: "Analogy", d: "EXPERT", q: "Pen : Write :: Knife : ?", o: ["Cut", "Sharp", "Steel", "Kitchen"], c: 0, e: "Tool-function: a knife is used to cut." },
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
  console.log(`Batch 62 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
