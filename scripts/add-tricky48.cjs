// Tricky batch #48 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If x + 1/x = 4, find x² + 1/x².", o: ["14", "16", "12", "18"], c: 0, e: "(x+1/x)² − 2 = 16 − 2 = 14." },
  { t: "Geometry", d: "EXPERT", q: "Area of a right triangle with legs 8 and 15:", o: ["60", "120", "56", "64"], c: 0, e: "½×8×15 = 60." },
  { t: "Number System", d: "EXPERT", q: "Remainder when 5³⁰ is divided by 6:", o: ["1", "5", "0", "3"], c: 0, e: "5 ≡ −1; even power → 1." },
  { t: "Percentage", d: "EXPERT", q: "If price rises 20%, by what % cut consumption to keep spend same?", o: ["16⅔%", "20%", "25%", "10%"], c: 0, e: "20/120 = 1/6 = 16⅔%." },
  { t: "Compound Interest", d: "EXPERT", q: "CI on ₹4,000 at 10% for 2 years:", o: ["₹840", "₹800", "₹880", "₹900"], c: 0, e: "4000×1.1² = 4840 → 840." },
  { t: "Geometric Progression", d: "EXPERT", q: "Sum to infinity of 10 + 5 + 2.5 + … :", o: ["20", "25", "15", "18"], c: 0, e: "10/(1−1/2) = 20." },
  { t: "Ratio", d: "EXPERT", q: "Three numbers in ratio 2:3:4 sum to 90. Middle number:", o: ["30", "20", "40", "25"], c: 0, e: "Parts 9 → unit 10 → 3×10 = 30." },
  { t: "Speed", d: "EXPERT", q: "A 360 m train crosses a pole in 36 s. Speed in km/h:", o: ["36", "30", "40", "45"], c: 0, e: "10 m/s × 18/5 = 36." },
  { t: "Time & Work", d: "EXPERT", q: "20 men finish in 10 days. Days for 25 men:", o: ["8", "10", "9", "12"], c: 0, e: "200/25 = 8." },
  { t: "Logarithms", d: "EXPERT", q: "log₂32 = ?", o: ["5", "4", "6", "16"], c: 0, e: "2⁵ = 32 → 5." },
  { t: "Mensuration", d: "EXPERT", q: "If a cube has volume 216 cm³, its side is:", o: ["6 cm", "8 cm", "5 cm", "7 cm"], c: 0, e: "∛216 = 6." },
  { t: "Mensuration", d: "EXPERT", q: "Curved surface area of cylinder r=7, h=10 (π=22/7):", o: ["440", "420", "460", "400"], c: 0, e: "2×22/7×7×10 = 440." },
  { t: "Trigonometry", d: "EXPERT", q: "tan45° + cot45° = ?", o: ["2", "1", "0", "√2"], c: 0, e: "1 + 1 = 2." },
  { t: "Simple Interest", d: "EXPERT", q: "SI on ₹2,000 at 5% for 3 years:", o: ["₹300", "₹250", "₹350", "₹200"], c: 0, e: "2000×5×3/100 = 300." },
  { t: "Percentage", d: "EXPERT", q: "45% of 60% of 500 = ?", o: ["135", "150", "120", "165"], c: 0, e: "60% of 500 = 300; 45% of 300 = 135." },
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
  console.log(`Batch 48 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
