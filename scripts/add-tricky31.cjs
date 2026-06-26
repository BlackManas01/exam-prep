// Tricky batch #31 — EXTREME-HARD REASONING only. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 3, 8, 15, 24, 35, ?", o: ["48", "46", "50", "44"], c: 0, e: "Differences 5, 7, 9, 11, 13 → 35 + 13 = 48." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 7, 9, 13, 21, 37, ?", o: ["69", "65", "73", "67"], c: 0, e: "Differences 2, 4, 8, 16, 32 → 37 + 32 = 69." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'RANK' = 44 (sum of letter positions), then 'FILE' = ?", o: ["32", "30", "34", "28"], c: 0, e: "F(6)+I(9)+L(12)+E(5) = 32." },
  { t: "Analogy", d: "EXPERT", q: "Triangle : Prism :: Circle : ?", o: ["Cylinder", "Square", "Sphere", "Cone"], c: 0, e: "A triangle is the cross-section of a prism; a circle is the cross-section of a cylinder." },
  { t: "Blood Relations", d: "EXPERT", q: "If 'A @ B' means A is the mother of B, and 'A # B' means A is the brother of B, then 'P @ Q # R' means P is R's:", o: ["Mother", "Aunt", "Sister", "Grandmother"], c: 0, e: "P is mother of Q, Q is brother of R → P is the mother of R." },
  { t: "Direction Sense", d: "EXPERT", q: "A man walks 6 km South from A to B, then 8 km East to C. What is the straight-line distance from C back to A?", o: ["10 km", "14 km", "7 km", "12 km"], c: 0, e: "√(6² + 8²) = √100 = 10 km." },
  { t: "Ranking & Order", d: "EXPERT", q: "A scored more than B but less than C. D scored more than C, and E scored less than B. Who scored the highest?", o: ["D", "C", "A", "E"], c: 0, e: "D > C > A > B > E → D is the highest." },
  { t: "Calendar", d: "EXPERT", q: "If the month of February in a particular year has five Sundays, then that year must be a:", o: ["Leap year", "Non-leap year", "Century year", "Cannot be determined"], c: 0, e: "Five Sundays need 29 days in February → a leap year." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A cube of side 5 cm is painted on all faces and cut into 125 unit cubes. How many have exactly one face painted?", o: ["54", "27", "36", "48"], c: 0, e: "Face-centre cubes = 6 × (5−2)² = 6 × 9 = 54." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: AC, FH, KM, ?", o: ["PR", "PQ", "OQ", "QS"], c: 0, e: "First letters A,F,K,P (+5); each second letter is +2 → PR." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If '−' means '+', '+' means '×', '×' means '÷' and '÷' means '−', then 6 + 4 − 2 × 1 ÷ 3 = ?", o: ["23", "21", "25", "19"], c: 0, e: "Translate: 6 × 4 + 2 ÷ 1 − 3 = 24 + 2 − 3 = 23." },
  { t: "Analogy", d: "EXPERT", q: "MAD : NBE :: RUN : ?", o: ["SVO", "SVP", "TVO", "SWO"], c: 0, e: "Each letter +1: R→S, U→V, N→O → SVO." },
  { t: "Syllogism", d: "EXPERT", q: "Statements: All cups are mugs. Some mugs are glasses. No glass is plastic. Conclusions: I. Some mugs are not plastic. II. Some cups are glasses. Which conclusion(s) follow?", o: ["Only I follows", "Only II follows", "Both follow", "Neither follows"], c: 0, e: "Some mugs are glasses and no glass is plastic → those mugs are not plastic (I). II is not established." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If 3 * 5 = 16, 4 * 6 = 20 and 5 * 7 = 24, then 6 * 8 = ?", o: ["28", "26", "30", "24"], c: 0, e: "Pattern a*b = 2(a+b): 2×(6+8) = 28." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: ZA, YB, XC, ?", o: ["WD", "WC", "VD", "WE"], c: 0, e: "First letters Z,Y,X,W (backwards); second letters A,B,C,D → WD." },
  { t: "Direction Sense", d: "EXPERT", q: "The sun rises in the East. At 7 a.m., towards which direction does the shadow of a vertical pole fall?", o: ["West", "East", "North", "South"], c: 0, e: "The shadow falls opposite to the sun → towards the West." },
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
  console.log(`Batch 31 (extreme reasoning) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
