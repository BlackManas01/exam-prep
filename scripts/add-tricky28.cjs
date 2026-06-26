// Tricky batch #28 — EXTREME-HARD REASONING only. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 4, 13, 40, 121, ?", o: ["364", "242", "363", "365"], c: 0, e: "Each term ×3 + 1 → 121×3 + 1 = 364." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1000, 200, 40, 8, ?", o: ["1.6", "2", "4", "1.5"], c: 0, e: "Each term ÷ 5 → 8 ÷ 5 = 1.6." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If the value of a word is the sum of its letter positions, and 'SUN' = 54, then 'STAR' = ?", o: ["58", "60", "56", "62"], c: 0, e: "S(19)+T(20)+A(1)+R(18) = 58." },
  { t: "Analogy", d: "EXPERT", q: "Hand : Wrist :: Foot : ?", o: ["Ankle", "Toe", "Leg", "Heel"], c: 0, e: "The wrist joins the hand to the arm; the ankle joins the foot to the leg." },
  { t: "Blood Relations", d: "EXPERT", q: "X is the wife of Y. Z is the daughter of X. W is the husband of Z. How is Y related to W?", o: ["Father-in-law", "Brother-in-law", "Son-in-law", "Uncle"], c: 0, e: "Z is Y's daughter; W is Z's husband → Y is W's father-in-law." },
  { t: "Direction Sense", d: "EXPERT", q: "P is 10 m East of Q. R is 10 m North of P. S is 10 m West of R. How far is S from Q?", o: ["10 m", "20 m", "10√2 m", "0 m"], c: 0, e: "Q(0,0), P(10,0), R(10,10), S(0,10) → S is 10 m due North of Q." },
  { t: "Ranking & Order", d: "EXPERT", q: "In a row, X is 11th from the left and Y is 11th from the right. If they interchange positions, X becomes 18th from the left. How many people are in the row?", o: ["28", "29", "27", "30"], c: 0, e: "After the swap X takes Y's place (18th from left = 11th from right) → total 18 + 11 − 1 = 28." },
  { t: "Calendar", d: "EXPERT", q: "What day of the week was 26 January 1950 (the day the Constitution of India came into effect)?", o: ["Thursday", "Friday", "Wednesday", "Saturday"], c: 0, e: "26 January 1950 was a Thursday." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A cube is painted on all faces and cut into 64 equal smaller cubes. How many of them have exactly two faces painted?", o: ["24", "8", "36", "12"], c: 0, e: "Edge cubes (excluding corners) = 12 × (4−2) = 24." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: B, F, K, Q, ?", o: ["X", "W", "Y", "V"], c: 0, e: "Gaps +4, +5, +6, +7 → Q(17) + 7 = 24 = X." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If P # Q = P² + Q² and P @ Q = P² − Q², then the value of (3 # 4) @ (5 # 0) is:", o: ["0", "25", "50", "625"], c: 0, e: "3#4 = 25; 5#0 = 25; 25@25 = 25² − 25² = 0." },
  { t: "Analogy", d: "EXPERT", q: "ABDE : FGIJ :: KLNO : ?", o: ["PQST", "PQRS", "PRST", "OQST"], c: 0, e: "Each group skips one letter (C, H, M, R) → after K,L,(M),N,O comes P,Q,(R),S,T = PQST." },
  { t: "Syllogism", d: "EXPERT", q: "Statements: No A is B. All B are C. Conclusions: I. Some C are not A. II. No A is C. Which conclusion(s) follow?", o: ["Only I follows", "Only II follows", "Both follow", "Neither follows"], c: 0, e: "B are C and no A is B → those C (which are B) are not A → some C are not A (I)." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 2, 9, 28, 65, ?", o: ["126", "120", "124", "130"], c: 0, e: "Pattern n³ + 1: 1+1, 8+1, 27+1, 64+1, 125+1 = 126." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: AZ, BY, CX, DW, ?", o: ["EV", "EU", "FV", "EW"], c: 0, e: "First letters A,B,C,D,E; second letters Z,Y,X,W,V → EV." },
  { t: "Direction Sense", d: "EXPERT", q: "A man walks 4 m North, then 3 m East, then 8 m South and finally 3 m West. How far is he from the starting point?", o: ["4 m", "5 m", "3 m", "7 m"], c: 0, e: "Net: North 4 − South 8 = 4 m South; East 3 − West 3 = 0 → 4 m." },
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
  console.log(`Batch 28 (extreme reasoning) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
