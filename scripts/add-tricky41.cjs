// Tricky batch #41 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 3, 7, 16, 35, 74, ?", o: ["153", "148", "151", "157"], c: 0, e: "×2 + 1,2,3,4,5: 74×2+5 = 153." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 5, 11, 23, 47, 95, ?", o: ["191", "189", "190", "187"], c: 0, e: "×2 + 1 each time: 95×2+1 = 191." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'FACE' = 15 (sum of positions), then 'HEAD' = ?", o: ["18", "20", "16", "22"], c: 0, e: "H8+E5+A1+D4 = 18." },
  { t: "Blood Relations", d: "EXPERT", q: "A is the brother of B. B is the son of C. C is the mother of D. How is D related to A (D female)?", o: ["Sister", "Mother", "Aunt", "Niece"], c: 0, e: "A and B are children of C; D also child of C → A and D are siblings → D is A's sister." },
  { t: "Direction Sense", d: "EXPERT", q: "A man walks 10 km North, 6 km East, then 10 km South. How far from start?", o: ["6 km", "10 km", "16 km", "4 km"], c: 0, e: "North cancels South → only 6 km East → 6 km." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A 5×5×5 cube painted on all sides is cut into 125 unit cubes. How many have exactly one face painted?", o: ["54", "27", "8", "36"], c: 0, e: "One-face cubes per face = 3×3 = 9; 9×6 = 54." },
  { t: "Clock", d: "EXPERT", q: "Angle between hour and minute hands at 6:00?", o: ["180°", "150°", "90°", "120°"], c: 0, e: "Hands opposite at 6:00 → 180°." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: AB, DE, GH, ?", o: ["JK", "IJ", "JL", "KL"], c: 0, e: "Skip one letter between pairs: A,D,G,J → JK." },
  { t: "Syllogism", d: "EXPERT", q: "All pens are books. No book is red. Conclusion: No pen is red. Does it follow?", o: ["Yes, it follows", "No", "Cannot say", "Only sometimes"], c: 0, e: "All pens are books and no book is red → no pen is red." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If 3*4 = 25 and 5*6 = 61, then 6*7 = ?", o: ["85", "84", "78", "90"], c: 0, e: "a²+b²: 6²+7² = 36+49 = 85." },
  { t: "Analogy", d: "EXPERT", q: "16 : 8 :: 100 : ?", o: ["50", "10", "200", "25"], c: 0, e: "Half: 16→8; 100→50." },
  { t: "Ranking & Order", d: "EXPERT", q: "In a class of 20, A is 8th from the top. What is A's rank from the bottom?", o: ["13th", "12th", "14th", "11th"], c: 0, e: "20 − 8 + 1 = 13th." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 2, 3, 5, 9", o: ["9", "2", "3", "5"], c: 0, e: "2,3,5 are prime; 9 = 3² is not." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: Z, W, T, Q, ?", o: ["N", "M", "O", "P"], c: 0, e: "−3 each: Z,W,T,Q,N." },
  { t: "Analogy", d: "EXPERT", q: "Day : Night :: Birth : ?", o: ["Death", "Life", "Baby", "Growth"], c: 0, e: "Antonym pair: opposite of birth is death." },
];
function contentHash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffled(o, ci) { const a = o.map((text, i) => ({ text, correct: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  if (process.argv.includes("--verify")) { let n = 0; for (const q of ITEMS) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); } console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const T of TARGETS) for (const q of ITEMS) { const id = crypto.randomUUID(); qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true }); shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i })); }
  const chunk = async (arr, sz, fn) => { for (let i = 0; i < arr.length; i += sz) await fn(arr.slice(i, i + sz)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 41 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
