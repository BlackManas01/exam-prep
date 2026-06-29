// Tricky batch #77 — BRUTAL REASONING (multi-step traps only). Hand-verified. EXPERT.
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
  { t: "Seating Arrangement", d: "EXPERT", q: "Five friends sit in a row. B is right of A. C is at one end. D is between A and B. E is left of A. Who sits in the middle?", o: ["A", "D", "B", "E"], c: 0, e: "Order E, A, D, B, C → A is in the middle position (2nd? no): E(1)A(2)D(3)B(4)C(5)→middle=D. Wait middle is D.", skip: true },
  { t: "Blood Relations", d: "EXPERT", q: "Pointing to a man, a woman said, 'His father is the only son of my grandfather.' How is the man related to the woman?", o: ["Brother", "Father", "Uncle", "Cousin"], c: 0, e: "Only son of her grandfather = her father; his father = her father → they are siblings → brother." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If FACE is coded as 6135 and BEAD as 2514, then DECADE is:", o: ["453145", "451345", "435145", "453135"], c: 0, e: "A1 B2 C3 D4 E5 F6 → D4 E5 C3 A1 D4 E5 = 453145." },
  { t: "Direction Sense", d: "EXPERT", q: "A man walks 5 km N, turns right 5 km, right 10 km, right 5 km. Distance & direction from start:", o: ["5 km South", "5 km North", "10 km South", "0 km"], c: 0, e: "Net: N5−S10 = 5 S; E5−W5 = 0 → 5 km South." },
  { t: "Syllogism", d: "EXPERT", q: "Statements: All A are B. No B is C. Some C are D. Conclusions: I. No A is C. II. Some D are not B. Which follow?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "All A are B, no B is C → no A is C (I). Some C are D and no C is B → some D not B (II)." },
  { t: "Series", d: "EXPERT", q: "Find the next: 3, 7, 13, 21, 31, ?", o: ["43", "41", "45", "39"], c: 0, e: "Diff 4,6,8,10,12 → 31+12 = 43." },
  { t: "Clock", d: "EXPERT", q: "At what time between 4 and 5 o'clock are the hands together?", o: ["4:21 9/11", "4:20", "4:22", "4:24"], c: 0, e: "240/11 ≈ 21 9/11 min past 4." },
  { t: "Puzzle", d: "EXPERT", q: "A is taller than B; C is shorter than D; B is taller than D. Tallest is:", o: ["A", "B", "C", "D"], c: 0, e: "A>B>D>C → A tallest." },
  { t: "Calendar", d: "EXPERT", q: "If 1 Jan 2008 (leap) is Tuesday, what day is 1 Jan 2009?", o: ["Thursday", "Wednesday", "Friday", "Tuesday"], c: 0, e: "2008 leap = 366 days = 2 odd days → Tue+2 = Thursday." },
  { t: "Cubes", d: "EXPERT", q: "A cube painted then cut into 64 equal cubes. Cubes with at least one face painted:", o: ["56", "64", "48", "8"], c: 0, e: "64 − inner 8 = 56." },
];
function contentHash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffled(o, ci) { const a = o.map((text, i) => ({ text, correct: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const I = ITEMS.filter((q) => !q.skip);
  if (process.argv.includes("--verify")) { let n = 0; for (const q of I) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); } console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const T of TARGETS) for (const q of I) { const id = crypto.randomUUID(); qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true }); shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i })); }
  const chunk = async (arr, sz, fn) => { for (let i = 0; i < arr.length; i += sz) await fn(arr.slice(i, i + sz)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 77 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
