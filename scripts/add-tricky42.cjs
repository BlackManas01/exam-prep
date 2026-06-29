// Tricky batch #42 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If x − 1/x = 4, find x² + 1/x².", o: ["18", "16", "14", "20"], c: 0, e: "x²+1/x² = (x−1/x)² + 2 = 16 + 2 = 18." },
  { t: "Trigonometry", d: "EXPERT", q: "If cosθ = 3/5, then tanθ = ?", o: ["4/3", "3/4", "5/3", "5/4"], c: 0, e: "sinθ = 4/5 → tanθ = (4/5)/(3/5) = 4/3." },
  { t: "Geometry", d: "EXPERT", q: "Area of a right triangle with legs 5 and 12 cm:", o: ["30 cm²", "60 cm²", "26 cm²", "32 cm²"], c: 0, e: "½×5×12 = 30 cm²." },
  { t: "Number System", d: "EXPERT", q: "Remainder when 3⁵⁰ is divided by 7:", o: ["2", "1", "4", "5"], c: 0, e: "3⁶ ≡ 1; 50 = 6×8+2 → 3² = 9 ≡ 2." },
  { t: "Percentage", d: "EXPERT", q: "If sugar price falls 20%, by what % can consumption rise keeping spend same?", o: ["25%", "20%", "30%", "15%"], c: 0, e: "20/(100−20) = 1/4 = 25%." },
  { t: "Interest", d: "EXPERT", q: "Difference between CI and SI on ₹5,000 at 10% for 2 years:", o: ["₹50", "₹100", "₹25", "₹60"], c: 0, e: "Diff = P(r/100)² = 5000×0.01 = ₹50." },
  { t: "Geometric Progression", d: "EXPERT", q: "Sum to infinity of 9 + 3 + 1 + 1/3 + … :", o: ["13.5", "12", "14", "15"], c: 0, e: "9/(1−1/3) = 9/(2/3) = 13.5." },
  { t: "Ratio", d: "EXPERT", q: "If a:b = 3:4 and b:c = 8:9, then a:c = ?", o: ["2:3", "3:9", "1:2", "4:9"], c: 0, e: "a:b:c = 24:32:36 → a:c = 2:3." },
  { t: "Speed", d: "EXPERT", q: "A 200 m train crosses a pole in 20 s. Speed in km/h:", o: ["36", "40", "30", "45"], c: 0, e: "10 m/s × 18/5 = 36 km/h." },
  { t: "Time & Work", d: "EXPERT", q: "10 men finish work in 12 days. Days for 8 men:", o: ["15", "14", "16", "18"], c: 0, e: "120 man-days / 8 = 15 days." },
  { t: "Logarithms", d: "EXPERT", q: "log₁₀1000 = ?", o: ["3", "2", "4", "10"], c: 0, e: "10³ = 1000 → 3." },
  { t: "Mensuration", d: "EXPERT", q: "Volume of cylinder r = 7, h = 10 (π = 22/7):", o: ["1540", "1400", "1600", "1320"], c: 0, e: "22/7×49×10 = 1540." },
  { t: "Mensuration", d: "EXPERT", q: "If a cube has volume 343 cm³, its side is:", o: ["7 cm", "6 cm", "8 cm", "9 cm"], c: 0, e: "∛343 = 7 cm." },
  { t: "Trigonometry", d: "EXPERT", q: "sin30° + cos60° = ?", o: ["1", "0.5", "√3/2", "2"], c: 0, e: "0.5 + 0.5 = 1." },
  { t: "Decay", d: "EXPERT", q: "A population of 8000 falls 10% per year. After 2 years:", o: ["6480", "6400", "6500", "7200"], c: 0, e: "8000×0.9×0.9 = 6480." },
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
  console.log(`Batch 42 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
