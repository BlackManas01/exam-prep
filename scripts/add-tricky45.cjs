// Tricky batch #45 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If x + 1/x = 2, find x³ + 1/x³.", o: ["2", "8", "6", "0"], c: 0, e: "x+1/x=2 → x=1 → x³+1/x³ = 2; or 2³−3×2 = 2." },
  { t: "Trigonometry", d: "EXPERT", q: "If sinθ = 1/2 (0<θ<90°), cosθ = ?", o: ["√3/2", "1/2", "1", "√2/2"], c: 0, e: "θ = 30° → cos30° = √3/2." },
  { t: "Geometry", d: "EXPERT", q: "Area of a right triangle with legs 9 and 40 cm:", o: ["180 cm²", "200 cm²", "160 cm²", "190 cm²"], c: 0, e: "½×9×40 = 180 cm²." },
  { t: "Number System", d: "EXPERT", q: "Remainder when 7¹⁰⁰ is divided by 4:", o: ["1", "3", "0", "2"], c: 0, e: "7 ≡ 3; 3² ≡ 1 (mod 4); 100 even → 1." },
  { t: "Percentage", d: "EXPERT", q: "If price rises 50%, consumption must fall by what % to keep spend equal?", o: ["33⅓%", "50%", "25%", "20%"], c: 0, e: "50/150 = 1/3 = 33⅓%." },
  { t: "Compound Interest", d: "EXPERT", q: "CI on ₹8,000 at 25% p.a. for 2 years:", o: ["₹4,500", "₹4,000", "₹5,000", "₹4,200"], c: 0, e: "8000×1.25² = 12500 → CI = 4500." },
  { t: "Geometric Progression", d: "EXPERT", q: "Sum to infinity of 4 + 2 + 1 + 1/2 + … :", o: ["8", "10", "6", "7"], c: 0, e: "4/(1−1/2) = 8." },
  { t: "Ratio", d: "EXPERT", q: "Three numbers in ratio 5:6:7; their sum is 36. Largest is:", o: ["14", "12", "10", "16"], c: 0, e: "Parts = 18 → unit 2 → 7×2 = 14." },
  { t: "Speed", d: "EXPERT", q: "A 150 m train crosses a pole in 15 s. Speed in km/h:", o: ["36", "30", "40", "45"], c: 0, e: "10 m/s × 18/5 = 36 km/h." },
  { t: "Time & Work", d: "EXPERT", q: "15 men finish in 6 days. Days for 9 men:", o: ["10", "9", "12", "8"], c: 0, e: "90 man-days / 9 = 10." },
  { t: "Logarithms", d: "EXPERT", q: "log₅125 = ?", o: ["3", "2", "5", "25"], c: 0, e: "5³ = 125 → 3." },
  { t: "Mensuration", d: "EXPERT", q: "Volume of a sphere of radius 6 (in terms of π):", o: ["288π", "144π", "216π", "256π"], c: 0, e: "(4/3)π×216 = 288π." },
  { t: "Mensuration", d: "EXPERT", q: "Total surface area of a cube of side 2 cm:", o: ["24 cm²", "12 cm²", "8 cm²", "16 cm²"], c: 0, e: "6×4 = 24 cm²." },
  { t: "Trigonometry", d: "EXPERT", q: "cos60° + sin30° = ?", o: ["1", "0.5", "√3", "2"], c: 0, e: "0.5 + 0.5 = 1." },
  { t: "Compound Interest", d: "EXPERT", q: "CI on ₹5,000 at 20% for 2 years:", o: ["₹2,200", "₹2,000", "₹2,400", "₹2,100"], c: 0, e: "5000×1.2² = 7200 → CI = 2200." },
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
  console.log(`Batch 45 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
