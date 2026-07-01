// Batch #106 — BRUTAL REASONING, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1", SEC = "reasoning", SUBJ = "General Intelligence & Reasoning";
const ITEMS = [
  { t: "Number Series", q: "Find the next term: 4, 5, 9, 18, 34, ?", o: ["59", "55", "60", "58"], c: 0, e: "Differences 1,4,9,16,25 (squares) → 34+25 = 59." },
  { t: "Number Series", q: "Find the next term: 2, 8, 18, 32, 50, ?", o: ["72", "68", "70", "74"], c: 0, e: "2×n²: 2×36 = 72." },
  { t: "Coding-Decoding", q: "In a code, each letter is replaced by the letter two places before it (C→A, D→B ...). Using this rule, the word FROST is coded as:", o: ["DPMQR", "DPMRQ", "DPNQR", "DQMQR"], c: 0, e: "−2 each: F→D,R→P,O→M,S→Q,T→R → DPMQR." },
  { t: "Blood Relations", q: "Ravi said, 'This girl is the wife of the grandson of my mother.' How is Ravi related to the girl?", o: ["Father-in-law", "Grandfather", "Father", "Husband"], c: 0, e: "Grandson of Ravi's mother = Ravi's son; the girl is his son's wife → Ravi is her father-in-law." },
  { t: "Syllogism", q: "Statements: Some actors are singers. All singers are dancers. No dancer is short. Conclusions: I. Some actors are dancers. II. Some actors are not short. Which conclusion(s) follow?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "Actor-singers are dancers → I; those dancers aren't short → some actors not short → II." },
  { t: "Direction Sense", q: "A person starts walking towards South, covers 6 m, turns left and covers 8 m, then turns left again and covers 6 m. His distance and direction from the start are:", o: ["8 m East", "8 m West", "6 m East", "2 m East"], c: 0, e: "S6,E8,N6 → S/N cancel, East 8 → 8 m East." },
  { t: "Ranking", q: "In a queue, Anil is 10th from the front and Sunil is 10th from the back. If there are 5 people between them, the minimum number of people in the queue is:", o: ["25", "24", "26", "20"], c: 0, e: "10 + 5 + 10 = 25 (non-overlapping minimum with 5 between)." },
  { t: "Clock", q: "At what time between 3 and 4 o'clock will the hands of a clock be at a right angle for the first time?", o: ["3:32 8/11", "3:30", "3:33", "3:00"], c: 0, e: "First right angle after 3:00 at (90+90)/... = 360/11 ≈ 32 8/11 min past 3." },
  { t: "Number Analogy", q: "If 6 : 35 :: 9 : ? follows a fixed rule, then the missing number is:", o: ["80", "81", "79", "82"], c: 0, e: "n²−1: 6²−1=35, 9²−1 = 80." },
  { t: "Odd One Out", q: "Find the odd one out: 121, 144, 169, 196, 200", o: ["200", "121", "169", "196"], c: 0, e: "121,144,169,196 are perfect squares; 200 is not." },
  { t: "Order & Ranking", q: "Six people A-F are of different weights. C is heavier than A and D but lighter than B. E is heavier than B. F is the lightest. Who is the second heaviest?", o: ["B", "E", "C", "A"], c: 0, e: "E > B > C > (A,D) > F → second heaviest is B." },
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
  console.log(`Batch 106 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
