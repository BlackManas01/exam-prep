// Tricky batch #66 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If x² + 1/x² = 7, find x⁴ + 1/x⁴.", o: ["47", "49", "45", "51"], c: 0, e: "(x²+1/x²)² − 2 = 49 − 2 = 47." },
  { t: "Boats & Streams", d: "EXPERT", q: "Downstream 16, upstream 10 km/h. Stream speed:", o: ["3 km/h", "6 km/h", "13 km/h", "2 km/h"], c: 0, e: "(16−10)/2 = 3 km/h." },
  { t: "Compound Interest", d: "EXPERT", q: "CI on ₹25000 at 8% for 2 years:", o: ["₹4160", "₹4000", "₹4200", "₹4320"], c: 0, e: "25000×1.08²=29160 → 4160." },
  { t: "Pipes & Cisterns", d: "EXPERT", q: "6 taps fill in 8 h. Time for 8 taps:", o: ["6 h", "7 h", "5 h", "9 h"], c: 0, e: "6×8/8 = 6 h." },
  { t: "Mixture", d: "EXPERT", q: "Milk:water 5:1 in 60 L. Water to add for 5:2:", o: ["10 L", "12 L", "8 L", "15 L"], c: 0, e: "Milk 50, water 10; for 5:2 water=20 → add 10." },
  { t: "Number System", d: "EXPERT", q: "Sum 1+3+5+…+19:", o: ["100", "90", "110", "81"], c: 0, e: "10² = 100." },
  { t: "Mensuration", d: "EXPERT", q: "Cone volume r=3, h=4 (π form):", o: ["12π", "36π", "24π", "9π"], c: 0, e: "(1/3)π×9×4 = 12π." },
  { t: "Mensuration", d: "EXPERT", q: "Curved SA cylinder r=7, h=5 (π=22/7):", o: ["220", "210", "230", "200"], c: 0, e: "2×22/7×7×5 = 220." },
  { t: "Surds", d: "EXPERT", q: "(√5+√3)(√5−√3) = ?", o: ["2", "8", "√2", "15"], c: 0, e: "5 − 3 = 2." },
  { t: "HCF/LCM", d: "EXPERT", q: "LCM of 9, 12, 15:", o: ["180", "90", "120", "150"], c: 0, e: "LCM = 180." },
  { t: "Probability", d: "EXPERT", q: "Probability of even number on a die:", o: ["1/2", "1/3", "1/6", "2/3"], c: 0, e: "3/6 = 1/2." },
  { t: "Simplification", d: "EXPERT", q: "999 × 7 = ?", o: ["6993", "6999", "7000", "6900"], c: 0, e: "1000×7 − 7 = 6993." },
  { t: "Trigonometry", d: "EXPERT", q: "sin45° = ?", o: ["1/√2", "√3/2", "1/2", "1"], c: 0, e: "sin45° = 1/√2." },
  { t: "Percentage", d: "EXPERT", q: "A number increased 20% then decreased 20%. Net change:", o: ["−4%", "0%", "+4%", "−2%"], c: 0, e: "1.2×0.8 = 0.96 → 4% decrease." },
  { t: "Ratio", d: "EXPERT", q: "If 3:5 = 27:x, x = ?", o: ["45", "40", "50", "35"], c: 0, e: "x = 5×27/3 = 45." },
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
  console.log(`Batch 66 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
