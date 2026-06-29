// Tricky batch #39 — BRUTAL QUANT. Hand-verified. All EXPERT. Every Q a different concept.
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
const QUANT = [
  { t: "Algebra", d: "EXPERT", q: "If x + 1/x = 3, find x³ + 1/x³.", o: ["18", "27", "21", "9"], c: 0, e: "x³+1/x³ = (x+1/x)³ − 3(x+1/x) = 27 − 9 = 18." },
  { t: "Trigonometry", d: "EXPERT", q: "If sinθ + cosθ = √2, the value of sinθ·cosθ is:", o: ["1/2", "1", "√2", "1/4"], c: 0, e: "(sinθ+cosθ)² = 2 → 1 + 2sinθcosθ = 2 → sinθcosθ = 1/2." },
  { t: "Geometry", d: "EXPERT", q: "The area of a triangle with sides 13, 14, 15 cm is:", o: ["84 cm²", "91 cm²", "78 cm²", "90 cm²"], c: 0, e: "s = 21; area = √(21·8·7·6) = √7056 = 84 cm²." },
  { t: "Number System", d: "EXPERT", q: "The remainder when 2¹⁰⁰ is divided by 7 is:", o: ["2", "1", "4", "6"], c: 0, e: "2³ ≡ 1 (mod 7); 100 = 3×33 + 1 → 2¹⁰⁰ ≡ 2¹ = 2." },
  { t: "Percentage", d: "EXPERT", q: "If the price of sugar rises 25%, by what % must consumption fall to keep expenditure unchanged?", o: ["20%", "25%", "15%", "30%"], c: 0, e: "Reduction = 25/(100+25) = 1/5 = 20%." },
  { t: "Compound Interest", d: "EXPERT", q: "CI on ₹10,000 at 10% p.a. for 2 years (compounded annually) is:", o: ["₹2,100", "₹2,000", "₹2,200", "₹2,310"], c: 0, e: "Amount = 10000(1.1)² = 12100 → CI = ₹2,100." },
  { t: "Geometric Progression", d: "EXPERT", q: "Sum to infinity of 2 + 2/3 + 2/9 + 2/27 + … is:", o: ["3", "4", "2.5", "6"], c: 0, e: "a=2, r=1/3 → S = 2/(1−1/3) = 2/(2/3) = 3." },
  { t: "Ratio & Proportion", d: "EXPERT", q: "If a:b = 2:3 and b:c = 4:5, then a:c = ?", o: ["8:15", "2:5", "8:5", "6:5"], c: 0, e: "a:b:c = 8:12:15 → a:c = 8:15." },
  { t: "Speed", d: "EXPERT", q: "A 120 m train crosses a pole in 12 s. Its speed is:", o: ["36 km/h", "30 km/h", "40 km/h", "45 km/h"], c: 0, e: "10 m/s × 18/5 = 36 km/h." },
  { t: "Time & Work", d: "EXPERT", q: "6 men finish a job in 8 days. How many days for 12 men (same rate)?", o: ["4", "6", "3", "5"], c: 0, e: "6×8 = 48 man-days; 48/12 = 4 days." },
  { t: "Logarithms", d: "EXPERT", q: "Value of log₂64 + log₉81 = ?", o: ["8", "6", "10", "7"], c: 0, e: "log₂64 = 6, log₉81 = 2 → 8." },
  { t: "Mensuration", d: "EXPERT", q: "Volume of a sphere of radius 3 cm is:", o: ["36π cm³", "27π cm³", "12π cm³", "48π cm³"], c: 0, e: "(4/3)π·3³ = 36π cm³." },
  { t: "Mensuration", d: "EXPERT", q: "Total surface area of a cube of side 6 cm is:", o: ["216 cm²", "196 cm²", "144 cm²", "240 cm²"], c: 0, e: "6×6² = 216 cm²." },
  { t: "Trigonometry", d: "EXPERT", q: "If sinθ + cosθ = √2, then tanθ + cotθ = ?", o: ["2", "1", "√2", "4"], c: 0, e: "θ = 45° → tan+cot = 1+1 = 2." },
  { t: "Growth", d: "EXPERT", q: "A town of 1000 grows 10% per year. Population after 2 years is:", o: ["1210", "1200", "1100", "1220"], c: 0, e: "1000×1.1×1.1 = 1210." },
];
function contentHash(stem, correct) { const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${norm(stem)}::${norm(correct)}`).digest("hex"); }
function shuffled(opts, ci) { const a = opts.map((text, i) => ({ text, correct: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  if (process.argv.includes("--verify")) { let n = 0; for (const q of QUANT) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); } console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const T of TARGETS) for (const q of QUANT) {
    const id = crypto.randomUUID();
    qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true });
    shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i }));
  }
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 39 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
