// Tricky batch #61 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If x + 1/x = 4, find x³ + 1/x³.", o: ["52", "64", "48", "56"], c: 0, e: "4³ − 3×4 = 64 − 12 = 52." },
  { t: "Number System", d: "EXPERT", q: "Units digit of 7⁷⁷:", o: ["7", "9", "3", "1"], c: 0, e: "Cycle 7,9,3,1; 77 mod 4 = 1 → 7." },
  { t: "Speed", d: "EXPERT", q: "200 m train crosses a 300 m platform in 25 s. Speed km/h:", o: ["72", "60", "80", "65"], c: 0, e: "500/25 = 20 m/s = 72 km/h." },
  { t: "Interest", d: "EXPERT", q: "CI − SI for 3 years at 10% on ₹10000 ≈", o: ["₹310", "₹300", "₹331", "₹210"], c: 0, e: "CI=3310, SI=3000 → ₹310." },
  { t: "Alligation", d: "EXPERT", q: "Mix ₹50/kg and ₹70/kg to get ₹58/kg. Ratio:", o: ["3:2", "2:3", "1:1", "5:3"], c: 0, e: "(70−58):(58−50) = 12:8 = 3:2." },
  { t: "Discount", d: "EXPERT", q: "Successive discounts 10% then 20% equal a single:", o: ["28%", "30%", "25%", "32%"], c: 0, e: "1−0.9×0.8 = 0.28 → 28%." },
  { t: "Clock", d: "EXPERT", q: "Angle between hands at 4:20:", o: ["10°", "20°", "0°", "15°"], c: 0, e: "Hour 130°, minute 120° → 10°." },
  { t: "Partnership", d: "EXPERT", q: "A invests for 12 mo, B for 6 mo, capital 2:1. Profit ratio A:B:", o: ["4:1", "2:1", "3:1", "1:1"], c: 0, e: "2×12 : 1×6 = 24:6 = 4:1." },
  { t: "Trigonometry", d: "EXPERT", q: "sec60° = ?", o: ["2", "1", "√2", "1/2"], c: 0, e: "1/cos60° = 1/0.5 = 2." },
  { t: "Mensuration", d: "EXPERT", q: "Surface area of sphere radius 3 (π form):", o: ["36π", "27π", "12π", "48π"], c: 0, e: "4π×9 = 36π." },
  { t: "Number System", d: "EXPERT", q: "1² + 2² + 3² + 4² + 5² = ?", o: ["55", "50", "60", "45"], c: 0, e: "5×6×11/6 = 55." },
  { t: "Fraction", d: "EXPERT", q: "1/2 + 1/3 + 1/6 = ?", o: ["1", "5/6", "2/3", "7/6"], c: 0, e: "3/6+2/6+1/6 = 1." },
  { t: "Mensuration", d: "EXPERT", q: "Volume of cylinder r=7, h=2 (π=22/7):", o: ["308", "300", "330", "280"], c: 0, e: "22/7×49×2 = 308." },
  { t: "Surds", d: "EXPERT", q: "√6.25 = ?", o: ["2.5", "2.4", "2.6", "3.5"], c: 0, e: "2.5² = 6.25." },
  { t: "Percentage", d: "EXPERT", q: "If A is 25% more than B, B is what % less than A?", o: ["20%", "25%", "15%", "30%"], c: 0, e: "25/125 = 20%." },
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
  console.log(`Batch 61 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
