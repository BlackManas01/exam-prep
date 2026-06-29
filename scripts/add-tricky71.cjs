// Tricky batch #71 — BRUTAL QUANT. Hand-verified. All EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "ssc-chsl-tier1", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "ibps-po-prelims", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "maths", subject: "Mathematics" },
  { examCode: "ssc-cgl-tier2", sectionCode: "quant", subject: "Quantitative Aptitude" },
];
const ITEMS = [
  { t: "Algebra", d: "EXPERT", q: "If x + 1/x = 3, find x⁴ + 1/x⁴.", o: ["47", "49", "45", "51"], c: 0, e: "x²+1/x²=7; (7)²−2 = 47." },
  { t: "Pipes & Cisterns", d: "EXPERT", q: "A fills 12 h, B 15 h, C empties 20 h. All open, fill time:", o: ["10 h", "12 h", "8 h", "9 h"], c: 0, e: "1/12+1/15−1/20 = 1/10 → 10 h." },
  { t: "Interest", d: "EXPERT", q: "CI − SI for 3 years on ₹10000 at 10%:", o: ["₹310", "₹331", "₹300", "₹210"], c: 0, e: "CI=3310, SI=3000 → ₹310." },
  { t: "Speed", d: "EXPERT", q: "Trains 180 m & 270 m, speeds 36 & 54 km/h opposite. Crossing time:", o: ["18 s", "20 s", "16 s", "25 s"], c: 0, e: "450 m at 90 km/h (25 m/s) = 18 s." },
  { t: "Discount", d: "EXPERT", q: "Successive discounts 20%, 25%, 10% on ₹1000:", o: ["₹540", "₹500", "₹550", "₹560"], c: 0, e: "1000×0.8×0.75×0.9 = 540." },
  { t: "Clock", d: "EXPERT", q: "Angle between hands at 2:30:", o: ["105°", "120°", "90°", "100°"], c: 0, e: "Hour 75°, minute 180° → 105°." },
  { t: "Partnership", d: "EXPERT", q: "A ₹8000 for 6 mo, B ₹12000 for 4 mo. Profit ratio:", o: ["1:1", "2:3", "3:2", "1:2"], c: 0, e: "48000:48000 = 1:1." },
  { t: "Surds", d: "EXPERT", q: "(2+√3)(2−√3) = ?", o: ["1", "7", "4", "√3"], c: 0, e: "4 − 3 = 1." },
  { t: "Proportion", d: "EXPERT", q: "Fourth proportional to 3, 12, 5:", o: ["20", "15", "18", "24"], c: 0, e: "3:12 = 5:x → x = 20." },
  { t: "Trigonometry", d: "EXPERT", q: "sin30°cos60° + cos30°sin60° = ?", o: ["1", "0.5", "√3/2", "0"], c: 0, e: "= sin(30+60) = sin90 = 1." },
  { t: "Number System", d: "EXPERT", q: "Units digit of 4⁵⁰:", o: ["6", "4", "2", "8"], c: 0, e: "4 cycles 4,6; even power → 6." },
  { t: "Average", d: "EXPERT", q: "Average of squares of first 4 naturals:", o: ["7.5", "6", "8", "7"], c: 0, e: "(1+4+9+16)/4 = 30/4 = 7.5." },
  { t: "Percentage", d: "EXPERT", q: "A's salary 25% more than B. B is less by:", o: ["20%", "25%", "15%", "30%"], c: 0, e: "25/125 = 20%." },
  { t: "Mensuration", d: "EXPERT", q: "Area equilateral triangle side 6:", o: ["9√3", "12√3", "6√3", "18"], c: 0, e: "(√3/4)×36 = 9√3." },
  { t: "Simplification", d: "EXPERT", q: "13 × 13 = ?", o: ["169", "159", "189", "144"], c: 0, e: "13² = 169." },
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
  console.log(`Batch 71 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
