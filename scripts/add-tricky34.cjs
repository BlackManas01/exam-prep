// Tricky batch #34 — BRUTAL REASONING (teacher/topper level). Verified. EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 2, 5, 26, ?", o: ["677", "627", "576", "625"], c: 0, e: "Each term = previous² + 1: 1²+1=2, 2²+1=5, 5²+1=26, 26²+1 = 677." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 5, 12, 26, 54, ?", o: ["110", "108", "112", "106"], c: 0, e: "Each term ×2 + 2 → 54×2 + 2 = 110." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If A=26, B=25, …, Z=1 (reverse positions), then the code-sum of 'CAT' is:", o: ["57", "55", "59", "53"], c: 0, e: "C→24, A→26, T→7 → 24+26+7 = 57." },
  { t: "Analogy", d: "EXPERT", q: "Oasis : Desert :: Island : ?", o: ["Sea", "Land", "Beach", "Tree"], c: 0, e: "An oasis is surrounded by desert; an island is surrounded by sea." },
  { t: "Blood Relations", d: "EXPERT", q: "A is the father of B, but B is not the son of A. C is the father of A. How is C related to B?", o: ["Grandfather", "Father", "Uncle", "Brother"], c: 0, e: "B is A's daughter; C is A's father → C is B's grandfather." },
  { t: "Direction Sense", d: "EXPERT", q: "A man walks 8 m towards the North-East and then 8 m towards the South-East. What is his displacement and direction from the start?", o: ["8√2 m East", "16 m East", "8 m East", "8√2 m North"], c: 0, e: "The North and South components cancel; East components add → 8√2 m due East." },
  { t: "Ranking & Order", d: "EXPERT", q: "In a class of 50 students, six students have consecutive ranks beginning with A, who is 20th. What is the rank from the bottom of the sixth of these students?", o: ["26th", "25th", "30th", "31st"], c: 0, e: "The sixth student is 25th from the top → from bottom = 50 − 25 + 1 = 26th." },
  { t: "Calendar", d: "EXPERT", q: "How many leap years are there in 400 consecutive years (e.g., 1601–2000)?", o: ["97", "100", "96", "99"], c: 0, e: "100 − 4 (century non-leaps) + 1 (400th is leap) = 97." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A cube is painted on all faces and cut into 64 equal smaller cubes. How many cubes have at least two faces painted?", o: ["32", "24", "8", "26"], c: 0, e: "Two-face (edges) = 24; three-face (corners) = 8 → 24 + 8 = 32." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: ADG, BEH, CFI, ?", o: ["DGJ", "DGI", "DHJ", "EGJ"], c: 0, e: "Each letter shifts +1 → A→B→C→D, D→E→F→G, G→H→I→J → DGJ." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If a Δ b = a² − b and a ∇ b = b² − a, then the value of (4 Δ 3) ∇ (2 ∇ 5) is:", o: ["516", "510", "520", "504"], c: 0, e: "4Δ3 = 13; 2∇5 = 23; 13 ∇ 23 = 23² − 13 = 529 − 13 = 516." },
  { t: "Analogy", d: "EXPERT", q: "BEAK : TEAK :: BANK : ?", o: ["TANK", "RANK", "BARK", "TASK"], c: 0, e: "The first letter B is replaced by T → BANK becomes TANK." },
  { t: "Syllogism", d: "EXPERT", q: "Statements: All stars shine. Some shining things are planets. No planet is cold. Conclusions: I. Some stars are planets. II. Some shining things are not cold. Which conclusion(s) follow?", o: ["Only II follows", "Only I follows", "Both follow", "Neither follows"], c: 0, e: "Some shining things are planets and no planet is cold → those shining things are not cold (II)." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If 4 # 2 = 10, 6 # 3 = 21 and 8 # 4 = 36, then 10 # 5 = ?", o: ["55", "50", "60", "45"], c: 0, e: "Pattern a×b + b: 10×5 + 5 = 55." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: AZ, CY, EX, GW, ?", o: ["IV", "IW", "HV", "IU"], c: 0, e: "First letters A,C,E,G,I (+2); second letters Z,Y,X,W,V (−1) → IV." },
  { t: "Clocks", d: "EXPERT", q: "A clock is placed so that at 3 o'clock its hour hand points West. In which direction will the hour hand point at 6 o'clock?", o: ["North", "South", "East", "West"], c: 0, e: "The clock is rotated 180° from normal (3 = West instead of East); the 6-position (normally South) becomes North." },
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
    let n = 0; for (const q of REASONING) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    opts: ${q.o.join(" | ")}\n    ✓ ${q.o[q.c]}`); }
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
  console.log(`Batch 34 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
