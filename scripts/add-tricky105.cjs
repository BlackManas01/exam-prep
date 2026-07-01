// Batch #105 — BRUTAL REASONING, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1", SEC = "reasoning", SUBJ = "General Intelligence & Reasoning";
const ITEMS = [
  { t: "Number Series", q: "Find the next term: 5, 6, 9, 14, 21, ?", o: ["30", "28", "32", "29"], c: 0, e: "Differences 1,3,5,7,9 → 21+9 = 30." },
  { t: "Number Series", q: "Find the next term: 1, 2, 6, 15, 31, ?", o: ["56", "52", "60", "50"], c: 0, e: "Differences 1,4,9,16 (squares) → 31+25 = 56." },
  { t: "Coding-Decoding", q: "If in a code ROSE is written as 6821 (R=6, O=8, S=2, E=1), then the word SORE in the same code is:", o: ["2861", "2816", "8261", "2681"], c: 0, e: "S=2, O=8, R=6, E=1 → 2861." },
  { t: "Blood Relations", q: "If 'P $ Q' means P is the mother of Q and 'P # Q' means P is the father of Q, then in the expression A # B $ C, how is A related to C?", o: ["Grandfather", "Father", "Uncle", "Grandmother"], c: 0, e: "A father of B; B mother of C → A is C's grandfather." },
  { t: "Syllogism", q: "Statements: No teacher is rich. All rich people are happy. Some happy people are wise. Conclusions: I. No teacher is happy. II. Some wise people are rich. Which conclusion(s) follow?", o: ["Neither", "Only I", "Only II", "Both"], c: 0, e: "Neither follows: I overreaches, II not certain." },
  { t: "Direction Sense", q: "A boy walks 3 km East, turns North and walks 4 km, turns West and walks 3 km, then turns North and walks 4 km. His straight-line distance from the start is:", o: ["8 km", "10 km", "6 km", "5 km"], c: 0, e: "East 3−3=0; North 4+4=8 → 8 km." },
  { t: "Ranking", q: "In a class, a student is ranked 15th from the top and 20th from the bottom. The total number of students in the class is:", o: ["34", "35", "33", "36"], c: 0, e: "15+20−1 = 34." },
  { t: "Clock", q: "The reflex angle between the hands of a clock at 3:00 is:", o: ["270°", "90°", "180°", "300°"], c: 0, e: "Acute angle 90° → reflex = 360−90 = 270°." },
  { t: "Number Analogy", q: "2 is related to 8 and 3 is related to 27 in the same way as 4 is related to:", o: ["64", "48", "16", "81"], c: 0, e: "Cubes: 4³ = 64." },
  { t: "Odd One Out", q: "Find the odd one out: 13, 17, 19, 25", o: ["25", "13", "17", "19"], c: 0, e: "25 = 5² is not prime; the rest are prime." },
  { t: "Seating", q: "Five friends P, Q, R, S, T sit in a row. Q is to the immediate right of P. R is at one end. S is between Q and T. If P is not at any end, then who sits at the other end (opposite R)?", o: ["T", "S", "Q", "P"], c: 0, e: "R,P,Q,S,T → other end is T." },
  { t: "Letter Series", q: "Find the next term in the series: B, D, G, K, P, ?", o: ["V", "U", "W", "T"], c: 0, e: "+2,+3,+4,+5,+6: P+6 = V." },
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
  console.log(`Batch 105 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
