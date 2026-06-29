// Tricky batch #38 — BRUTAL REASONING. Hand-verified. All EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const REASONING_TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-chsl-tier1", sectionCode: "general-intelligence", subject: "General Intelligence" },
  { examCode: "ibps-po-prelims", sectionCode: "reasoning", subject: "Reasoning Ability" },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-cgl-tier2", sectionCode: "reasoning", subject: "Reasoning" },
];
const REASONING = [
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 7, 13, 25, 49, 97, ?", o: ["193", "189", "195", "191"], c: 0, e: "Each term = previous × 2 − 1: 7,13,25,49,97 → 97×2−1 = 193." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 4, 9, 25, 49, 121, 169, ?", o: ["289", "225", "256", "243"], c: 0, e: "Squares of primes: 2²,3²,5²,7²,11²,13² → next prime 17² = 289." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 120, 99, 80, 63, 48, ?", o: ["35", "33", "37", "39"], c: 0, e: "Differences are 21,19,17,15,13 → 48 − 13 = 35." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'CAT' = 24 and 'DOG' = 26 (sum of letter positions), then 'BIRD' = ?", o: ["33", "31", "35", "29"], c: 0, e: "B2+I9+R18+D4 = 33." },
  { t: "Blood Relations", d: "EXPERT", q: "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?", o: ["Mother", "Aunt", "Sister", "Grandmother"], c: 0, e: "Only daughter of woman's mother = the woman herself → his mother is the woman → Mother." },
  { t: "Direction Sense", d: "EXPERT", q: "A man walks 3 km North, 4 km East, then turns right and walks 3 km, then turns left and walks 4 km. How far is he from start (straight line)?", o: ["8 km", "10 km", "√34 km", "6 km"], c: 0, e: "North: 3−3 = 0; East: 4+4 = 8 → distance 8 km." },
  { t: "Calendar", d: "EXPERT", q: "If 26 January 1950 was a Thursday, what day was 26 January 1951?", o: ["Friday", "Thursday", "Saturday", "Sunday"], c: 0, e: "1950 is not a leap year → 365 days → 1 odd day → Thursday + 1 = Friday." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A 3 × 3 × 3 cube is painted on all faces and cut into 27 unit cubes. How many have exactly two faces painted?", o: ["12", "8", "6", "9"], c: 0, e: "Two-face cubes lie on edges (not corners): 12 edges × 1 = 12." },
  { t: "Clock", d: "EXPERT", q: "What is the angle between the hour and minute hands at 3:40?", o: ["130°", "120°", "140°", "125°"], c: 0, e: "Hour: 3×30 + 40×0.5 = 110°; minute: 240°; difference = 130°." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: AZ, CX, EV, ?", o: ["GT", "GU", "FT", "HT"], c: 0, e: "First letters +2 (A,C,E,G); second letters −2 (Z,X,V,T) → GT." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If 5 # 3 = 16, 8 # 6 = 28 and 9 # 4 = 26, then 7 # 5 = ?", o: ["24", "22", "26", "20"], c: 0, e: "Rule (a+b)×2: (7+5)×2 = 24." },
  { t: "Analogy", d: "EXPERT", q: "8 : 81 :: 64 : ?", o: ["4225", "4096", "3969", "4356"], c: 0, e: "Rule n → (n+1)²: 8→81; 64→65² = 4225." },
  { t: "Ranking & Order", d: "EXPERT", q: "In a row of 40 people, X is 12th from the left and Y is 22nd from the right. How many people are between X and Y?", o: ["6", "5", "7", "8"], c: 0, e: "40 − 12 − 22 = 6 between them." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 121, 144, 169, 180", o: ["180", "121", "144", "169"], c: 0, e: "121=11², 144=12², 169=13² are perfect squares; 180 is not." },
  { t: "Syllogism", d: "EXPERT", q: "Statements: All cats are dogs. Some dogs are pets. Conclusions: I. Some cats are pets. II. Some dogs are cats. Which follow?", o: ["Only II follows", "Only I follows", "Both follow", "Neither follows"], c: 0, e: "All cats are dogs → some dogs are cats (II). Pets link only to dogs, not necessarily cats → I does not follow." },
];
function contentHash(stem, correct) {
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
  return crypto.createHash("sha256").update(`${norm(stem)}::${norm(correct)}`).digest("hex");
}
function shuffled(opts, correctIdx) {
  const arr = opts.map((text, i) => ({ text, correct: i === correctIdx }));
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
(async () => {
  if (process.argv.includes("--verify")) {
    let n = 0; for (const q of REASONING) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); }
    console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return;
  }
  const qRows = [], oRows = [];
  for (const t of REASONING_TARGETS) for (const q of REASONING) {
    const id = crypto.randomUUID();
    qRows.push({ id, examCode: t.examCode, sectionCode: t.sectionCode, subject: t.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true });
    shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i }));
  }
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 38 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
