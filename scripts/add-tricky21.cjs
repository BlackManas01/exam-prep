// Tricky batch #21 — EXTREME-HARD REASONING only. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 11, 35, 79, 149, ?", o: ["251", "241", "245", "255"], c: 0, e: "Differences 10,24,44,70 (second differences 14,20,26, +6 each); next difference 102 → 149+102 = 251." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If A=2, B=4, C=8, D=16 (each letter = 2 raised to its position), then the value of the word 'BAD' (sum) is:", o: ["22", "20", "24", "18"], c: 0, e: "B=4, A=2, D=16 → 4+2+16 = 22." },
  { t: "Blood Relations", d: "EXPERT", q: "Pointing to a photograph, a woman said, 'The lady in the photo is the mother-in-law of the wife of the only son of my grandmother.' Whose photograph is it?", o: ["Her grandmother", "Her mother", "Her aunt", "Her sister"], c: 0, e: "Only son of grandmother = her father; his wife = her mother; mother-in-law of her mother = her father's mother = her grandmother." },
  { t: "Direction Sense", d: "EXPERT", q: "A man walks 10 m North, turns 45° to his right and walks 10√2 m, then turns 45° to his right and walks 10 m. What is his straight-line distance from the start?", o: ["20√2 m", "20 m", "30 m", "10√5 m"], c: 0, e: "Net displacement: 20 m North and 20 m East → √(20²+20²) = 20√2 m." },
  { t: "Ranking & Order", d: "EXPERT", q: "In a class of 45 students, A is 13th from the top. B is 8 ranks below A. C is exactly midway between A and B. What is C's rank from the bottom?", o: ["29th", "28th", "30th", "27th"], c: 0, e: "A=13, B=21, C=17 from top → from bottom = 45 − 17 + 1 = 29th." },
  { t: "Clocks", d: "EXPERT", q: "How many times in a 24-hour day are the two hands of a clock at right angles?", o: ["44", "22", "48", "24"], c: 0, e: "The hands are at right angles 44 times in 24 hours." },
  { t: "Calendar", d: "EXPERT", q: "If 29 February 2020 was a Saturday, what day of the week was 28 February 2021?", o: ["Sunday", "Saturday", "Monday", "Friday"], c: 0, e: "From 29 Feb 2020 to 28 Feb 2021 is 365 days → 1 odd day → Saturday + 1 = Sunday." },
  { t: "Syllogism", d: "EXPERT", q: "Statements: All A are B. All B are C. No C is D. Conclusions: I. No A is D. II. Some C are A. Which conclusion(s) follow?", o: ["Both I and II follow", "Only I follows", "Only II follows", "Neither follows"], c: 0, e: "A→B→C and no C is D → no A is D (I); A are C, so some C are A (II)." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A cube is painted and cut into 125 equal smaller cubes. How many smaller cubes have exactly three faces painted?", o: ["8", "12", "6", "24"], c: 0, e: "Only the corner cubes have 3 painted faces → 8." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: A1Z, B4Y, C9X, D16W, ?", o: ["E25V", "E25U", "F25V", "E24V"], c: 0, e: "Letters A–E; numbers 1,4,9,16,25 (squares); letters Z,Y,X,W,V → E25V." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If a * b = (a + b)/(a − b), then the value of (6 * 2) * (4 * 1) is:", o: ["11", "9", "7", "13"], c: 0, e: "6*2 = 8/4 = 2; 4*1 = 5/3; 2*(5/3) = (2+5/3)/(2−5/3) = (11/3)/(1/3) = 11." },
  { t: "Analogy", d: "EXPERT", q: "AYBZ : CWDX :: EUFV : ?", o: ["GSHT", "GTHS", "HSGT", "GSTH"], c: 0, e: "Positions: (1,25,2,26),(3,23,4,24),(5,21,6,22) → (7,19,8,20) = GSHT." },
  { t: "Statement & Assumption", d: "EXPERT", q: "Statement: 'Please switch off the lights when not in use.' Assumptions: I. Lights consume electricity. II. People sometimes forget to switch them off. Which assumption(s) is/are implicit?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "Both are implicit — the notice presumes lights use power and that people forget." },
  { t: "Classification", d: "EXPERT", q: "Find the odd pair: 3-9, 4-16, 5-25, 6-30", o: ["6-30", "3-9", "4-16", "5-25"], c: 0, e: "9=3², 16=4², 25=5² are squares; 30 ≠ 6² = 36." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If each letter of a word is shifted forward by its position (1st by 1, 2nd by 2, …), then 'CAT' becomes:", o: ["DCW", "DBW", "DCV", "ECW"], c: 0, e: "C+1=D, A+2=C, T+3=W → DCW." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If '+' means '×', '−' means '+', '×' means '−' and '÷' means '+', then 15 − 3 + 2 × 4 ÷ 6 = ?", o: ["23", "21", "19", "25"], c: 0, e: "Translate: 15 + 3 × 2 − 4 + 6 = 15 + 6 − 4 + 6 = 23." },
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
  console.log(`Batch 21 (extreme reasoning) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
