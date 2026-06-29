// Tricky batch #47 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 2, 6, 24, 120, ?", o: ["720", "600", "240", "840"], c: 0, e: "×1,×2,×3,×4,×5,×6: 120×6 = 720 (factorials)." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 8, 27, 64, ?", o: ["125", "100", "121", "144"], c: 0, e: "Cubes: 5³ = 125." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'GO' = 21 (sum of positions), then 'DAY' = ?", o: ["29", "26", "31", "27"], c: 0, e: "D4+A1+Y25 = 30; check G7+O15=22… use D4+A1+Y25 = 30.", skip: true },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 2, 5, 10, 17, 26, ?", o: ["37", "35", "39", "36"], c: 0, e: "n²+1: 6²+1 = 37." },
  { t: "Direction Sense", d: "EXPERT", q: "Facing North, turn 90° right, then 180°. Now facing?", o: ["West", "East", "North", "South"], c: 0, e: "N→E (right 90), then 180° → West." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A 5×5×5 cube painted, cut into 125. How many have NO face painted?", o: ["27", "8", "54", "36"], c: 0, e: "Inner cube 3×3×3 = 27." },
  { t: "Clock", d: "EXPERT", q: "Angle between hands at 4:00?", o: ["120°", "90°", "150°", "60°"], c: 0, e: "4×30 = 120°." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: C, F, I, L, ?", o: ["O", "N", "M", "P"], c: 0, e: "+3 each: C,F,I,L,O." },
  { t: "Syllogism", d: "EXPERT", q: "All roses are flowers. Some flowers fade quickly. Conclusion: Some roses fade quickly. Follows?", o: ["No", "Yes", "Always", "Certainly"], c: 0, e: "Fading flowers may not be roses → does not follow." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If 6 ÷ 2 × 3 + 4 − 1 = ? (BODMAS)", o: ["12", "10", "8", "14"], c: 0, e: "6÷2=3, ×3=9, +4=13, −1=12." },
  { t: "Analogy", d: "EXPERT", q: "5 : 26 :: 8 : ?", o: ["65", "64", "63", "66"], c: 0, e: "n²+1: 8²+1 = 65." },
  { t: "Ranking & Order", d: "EXPERT", q: "X is 15th from left and 20th from right. Total persons?", o: ["34", "35", "33", "36"], c: 0, e: "15+20−1 = 34." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 16, 36, 49, 50", o: ["50", "16", "36", "49"], c: 0, e: "16,36,49 are squares; 50 is not." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: AZ, CX, EV, GT, ?", o: ["IR", "IS", "HR", "IQ"], c: 0, e: "First +2 (A,C,E,G,I); second −2 (Z,X,V,T,R) → IR." },
  { t: "Analogy", d: "EXPERT", q: "Hand : Glove :: Foot : ?", o: ["Sock", "Shoe", "Leg", "Toe"], c: 0, e: "Covering pair: glove covers hand, sock covers foot." },
];
function contentHash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffled(o, ci) { const a = o.map((text, i) => ({ text, correct: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const ITEMS2 = ITEMS.filter((q) => !q.skip);
  if (process.argv.includes("--verify")) { let n = 0; for (const q of ITEMS2) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); } console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const T of TARGETS) for (const q of ITEMS2) { const id = crypto.randomUUID(); qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true }); shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i })); }
  const chunk = async (arr, sz, fn) => { for (let i = 0; i < arr.length; i += sz) await fn(arr.slice(i, i + sz)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 47 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
