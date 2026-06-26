// Tricky batch #37 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 2, 3, 10, 15, 26, ?", o: ["35", "37", "33", "39"], c: 0, e: "Odd positions: 1²+1, 3²+1, 5²+1 = 2,10,26; even positions: 2²−1, 4²−1, 6²−1 = 3,15,35 → next is 35." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 3, 6, 11, 18, 29, ?", o: ["42", "40", "44", "38"], c: 0, e: "Differences are primes 2,3,5,7,11 → next 13 → 29 + 13 = 42." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'TEN' = 39 (sum of letter positions), then 'NINE' = ?", o: ["42", "40", "44", "38"], c: 0, e: "N(14)+I(9)+N(14)+E(5) = 42." },
  { t: "Analogy", d: "EXPERT", q: "Pride : Lions :: School : ?", o: ["Fish", "Children", "Books", "Teachers"], c: 0, e: "A group of lions is a 'pride'; a group of fish is a 'school' (collective nouns)." },
  { t: "Blood Relations", d: "EXPERT", q: "Q's father's only daughter is P's mother. How is Q (a male) related to P?", o: ["Maternal uncle", "Father", "Brother", "Cousin"], c: 0, e: "P's mother and Q share the same father → they are siblings → Q is P's mother's brother → maternal uncle." },
  { t: "Direction Sense", d: "EXPERT", q: "A man walks 1 km North, 2 km East, 3 km South, 4 km West and 5 km North. How far is he from the start?", o: ["√13 km", "5 km", "3 km", "√5 km"], c: 0, e: "Net North = 1−3+5 = 3; net West = 4−2 = 2 → √(3²+2²) = √13 km." },
  { t: "Ranking & Order", d: "EXPERT", q: "In a row of 25 people, A is 5th from the left and B is 7th from the right. If A and B interchange positions, what is A's new position from the left?", o: ["19th", "18th", "20th", "7th"], c: 0, e: "A takes B's place = 25 − 7 + 1 = 19th from the left." },
  { t: "Calendar", d: "EXPERT", q: "If 15 August 1947 was a Friday, what day of the week was 15 August 1948?", o: ["Sunday", "Saturday", "Monday", "Friday"], c: 0, e: "The interval includes 29 Feb 1948 → 366 days → 2 odd days → Friday + 2 = Sunday." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A 4 × 4 × 4 cube is painted on all faces and cut into 64 unit cubes. How many have exactly three faces painted?", o: ["8", "24", "16", "12"], c: 0, e: "Only the corner cubes have three painted faces → 8." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: ZYX, WVU, TSR, ?", o: ["QPO", "QRS", "PON", "RQP"], c: 0, e: "Groups of three consecutive letters going backwards → after T,S,R comes Q,P,O." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If a © b = (a + b)² and a ★ b = (a − b)², then the value of (3 © 2) − (3 ★ 2) is:", o: ["24", "20", "26", "16"], c: 0, e: "(3+2)² − (3−2)² = 25 − 1 = 24." },
  { t: "Analogy", d: "EXPERT", q: "ACE : BDF :: GIK : ?", o: ["HJL", "HJK", "HIL", "GJL"], c: 0, e: "Each letter shifts +1 → G→H, I→J, K→L → HJL." },
  { t: "Syllogism", d: "EXPERT", q: "Statements: Some A are B. All B are C. No C is D. Conclusions: I. Some A are not D. II. No B is D. Which conclusion(s) follow?", o: ["Both I and II follow", "Only I follows", "Only II follows", "Neither follows"], c: 0, e: "All B are C and no C is D → no B is D (II); the A that are B are C and not D → some A are not D (I)." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If 2 ∘ 3 = 13, 4 ∘ 5 = 41 and 5 ∘ 6 = 61, then 7 ∘ 8 = ?", o: ["113", "111", "115", "105"], c: 0, e: "Pattern a² + b²: 7² + 8² = 49 + 64 = 113." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: B2, D4, F6, H8, ?", o: ["J10", "I10", "J9", "K10"], c: 0, e: "Letters B,D,F,H,J (+2) and numbers 2,4,6,8,10 → J10." },
  { t: "Direction Sense", d: "EXPERT", q: "A man facing East turns 135° in the anticlockwise direction. Which direction is he facing now?", o: ["North-West", "South-East", "North-East", "South-West"], c: 0, e: "East − 135° (anticlockwise) lands at North-West." },
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
  console.log(`Batch 37 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
