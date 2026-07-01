// Batch #108 — BRUTAL REASONING, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1", SEC = "reasoning", SUBJ = "General Intelligence & Reasoning";
const ITEMS = [
  { t: "Number Series", q: "Find the next term: 100, 50, 52, 26, 28, ?", o: ["14", "16", "13", "15"], c: 0, e: "Alternately ÷2 and +2: 28÷2 = 14." },
  { t: "Number Series", q: "Find the next term: 5, 7, 11, 19, 35, ?", o: ["67", "65", "69", "63"], c: 0, e: "×2−3: 35×2−3 = 67." },
  { t: "Coding-Decoding", q: "If in a certain code TIGER is written by reversing the word and then moving each letter one step forward, then the code for TIGER is:", o: ["SFHJU", "SFHUJ", "SGHJU", "RFHJU"], c: 0, e: "Reverse TIGER = REGIT; +1 each: R→S,E→F,G→H,I→J,T→U → SFHJU." },
  { t: "Blood Relations", q: "Pointing to a man, a lady said, 'His mother is the only daughter of my father.' How is the lady related to the man?", o: ["Mother", "Sister", "Aunt", "Grandmother"], c: 0, e: "Only daughter of her father = the lady herself → his mother → Mother." },
  { t: "Syllogism", q: "Statements: No stone is soft. All chalks are soft. Some chalks are white. Conclusions: I. No chalk is stone. II. Some white things are not stone. Which conclusion(s) follow?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "Chalks are soft, no stone soft → no chalk stone (I). White chalks are soft, not stone → some white not stone (II)." },
  { t: "Direction Sense", q: "A cyclist rides 9 km North, then 12 km West. His shortest distance back to the start is:", o: ["15 km", "21 km", "11 km", "3 km"], c: 0, e: "√(9²+12²) = 15 km." },
  { t: "Ranking", q: "In a class, Priya is 12th from the top and 28th from the bottom. The total number of students in the class is:", o: ["39", "40", "38", "41"], c: 0, e: "12+28−1 = 39." },
  { t: "Clock", q: "How many times in 24 hours do the hands of a clock coincide (overlap)?", o: ["22", "24", "11", "20"], c: 0, e: "11 times in 12 hours → 22 times in 24 hours." },
  { t: "Number Analogy", q: "4 is related to 18 and 6 is related to 38 in the same way as 8 is related to:", o: ["66", "64", "62", "68"], c: 0, e: "n²+2: 8²+2 = 66." },
  { t: "Odd One Out", q: "Find the odd one out: 15, 24, 35, 48, 62", o: ["62", "15", "24", "48"], c: 0, e: "15=3×5,24=4×6,35=5×7,48=6×8 (n(n+2)); 62 breaks the pattern (should be 63=7×9)." },
  { t: "Order & Ranking", q: "Five boxes P, Q, R, S, T have different weights. Q is heavier than R but lighter than S. T is heavier than S. P is the lightest. The heaviest box is:", o: ["T", "S", "Q", "R"], c: 0, e: "T > S > Q > R > P → T is heaviest." },
  { t: "Letter Series", q: "Find the next term: Z, X, V, T, R, ?", o: ["P", "Q", "O", "N"], c: 0, e: "−2 each: Z,X,V,T,R,P." },
];
function hash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffle(o, ci) { const a = o.map((t, i) => ({ t, c: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const I = ITEMS.filter((x) => !x.skip);
  if (process.argv.includes("--verify")) { I.forEach((q, i) => console.log(`${i + 1}. [${q.t}] ${q.o[q.c]}`)); console.log(`Total: ${I.length}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const q of I) { const id = crypto.randomUUID(); qRows.push({ id, examCode: EXAM, sectionCode: SEC, subject: SUBJ, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: hash(q.q, q.o[q.c]), isActive: true }); shuffle(q.o, q.c).forEach((o, i) => oRows.push({ questionId: id, text: o.t, isCorrect: o.c, displayOrder: i })); }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 108 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
