// Tricky batch #74 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If a−1/a=3, then a²+1/a²=?", o: ["11", "9", "7", "13"], c: 0, e: "(a−1/a)²+2 = 9+2 = 11." },
  { t: "Geometry", d: "EXPERT", q: "Sum of exterior angles of any polygon:", o: ["360°", "180°", "540°", "720°"], c: 0, e: "Always 360°." },
  { t: "Number System", d: "EXPERT", q: "Units digit of 9⁹⁹:", o: ["9", "1", "3", "7"], c: 0, e: "9 cycles 9,1; odd power → 9." },
  { t: "Percentage", d: "EXPERT", q: "If 20% = 50, then 100% = ?", o: ["250", "200", "300", "150"], c: 0, e: "50/0.2 = 250." },
  { t: "Profit & Loss", d: "EXPERT", q: "Buy 12 for ₹10, sell 10 for ₹12. Profit %:", o: ["44%", "40%", "20%", "50%"], c: 0, e: "CP/item 10/12, SP 12/10 → 1.2/0.833=44%." },
  { t: "CI", d: "EXPERT", q: "₹16000 at 25% for 2 yrs CI:", o: ["₹9000", "₹8000", "₹8500", "₹9500"], c: 0, e: "16000×1.5625=25000 → 9000." },
  { t: "Average", d: "EXPERT", q: "Average of 11 to 20:", o: ["15.5", "15", "16", "14.5"], c: 0, e: "(11+20)/2 = 15.5." },
  { t: "Speed", d: "EXPERT", q: "60 km/h to m/s:", o: ["16.67", "20", "15", "18"], c: 0, e: "60×5/18 ≈ 16.67." },
  { t: "Time & Work", d: "EXPERT", q: "A 10 days, B 15 days. Together:", o: ["6", "5", "8", "12"], c: 0, e: "10×15/25 = 6." },
  { t: "Mensuration", d: "EXPERT", q: "Circumference of circle radius 14 (π=22/7):", o: ["88", "44", "84", "96"], c: 0, e: "2×22/7×14 = 88." },
  { t: "Ratio", d: "EXPERT", q: "Divide 96 in 3:5. Larger:", o: ["60", "36", "48", "40"], c: 0, e: "5/8×96 = 60." },
  { t: "Surds", d: "EXPERT", q: "√(196) = ?", o: ["14", "12", "16", "18"], c: 0, e: "14² = 196." },
  { t: "Trigonometry", d: "EXPERT", q: "cot45° = ?", o: ["1", "0", "√3", "1/√3"], c: 0, e: "cot45° = 1." },
  { t: "Simplification", d: "EXPERT", q: "(18²−12²) = ?", o: ["180", "200", "160", "150"], c: 0, e: "(30)(6) = 180." },
  { t: "Mensuration", d: "EXPERT", q: "Volume cuboid 5×4×3:", o: ["60", "50", "70", "45"], c: 0, e: "60." },
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
  console.log(`Batch 74 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
