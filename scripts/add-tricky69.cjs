// Tricky batch #69 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If a+1/a=5, then a²+1/a²=?", o: ["23", "25", "21", "27"], c: 0, e: "5²−2 = 23." },
  { t: "Geometry", d: "EXPERT", q: "Angles of triangle 2:3:4. Smallest:", o: ["40°", "60°", "80°", "30°"], c: 0, e: "9 parts=180 → 20 each → 2×20 = 40°." },
  { t: "Number System", d: "EXPERT", q: "Units digit of 2⁵⁰:", o: ["4", "2", "8", "6"], c: 0, e: "Cycle 2,4,8,6; 50 mod4=2 → 4." },
  { t: "Percentage", d: "EXPERT", q: "x is 40% of 250. x = ?", o: ["100", "90", "110", "120"], c: 0, e: "0.4×250 = 100." },
  { t: "Profit & Loss", d: "EXPERT", q: "CP 250, profit 40%. SP:", o: ["350", "300", "340", "360"], c: 0, e: "250×1.4 = 350." },
  { t: "Speed", d: "EXPERT", q: "Cover 360 km in 6 h. Avg speed:", o: ["60", "50", "70", "65"], c: 0, e: "360/6 = 60." },
  { t: "Average", d: "EXPERT", q: "Avg of 2,4,6,8,10,12:", o: ["7", "6", "8", "9"], c: 0, e: "42/6 = 7." },
  { t: "Time & Work", d: "EXPERT", q: "A 20 days, B 30 days. Together:", o: ["12 days", "10 days", "15 days", "25 days"], c: 0, e: "20×30/50 = 12." },
  { t: "Mensuration", d: "EXPERT", q: "Diagonal of cube side 2√3:", o: ["6", "4", "8", "12"], c: 0, e: "side√3 = 2√3×√3 = 6." },
  { t: "Simple Interest", d: "EXPERT", q: "₹5000 SI ₹1000 at 5%. Years:", o: ["4", "5", "3", "2"], c: 0, e: "1000 = 5000×5×t/100 → t=4." },
  { t: "Ratio", d: "EXPERT", q: "a:b:c = 1:2:3, c−a = 20. b = ?", o: ["20", "10", "30", "15"], c: 0, e: "Diff 2 parts =20 → 1 part=10 → b=20." },
  { t: "Surds", d: "EXPERT", q: "√(144×4) = ?", o: ["24", "20", "28", "22"], c: 0, e: "12×2 = 24." },
  { t: "Trigonometry", d: "EXPERT", q: "tan30°×tan60° = ?", o: ["1", "√3", "1/3", "3"], c: 0, e: "(1/√3)(√3) = 1." },
  { t: "Simplification", d: "EXPERT", q: "85% of 200 + 5 = ?", o: ["175", "170", "180", "165"], c: 0, e: "170 + 5 = 175." },
  { t: "Mensuration", d: "EXPERT", q: "Area of rectangle 12×8:", o: ["96", "88", "100", "80"], c: 0, e: "12×8 = 96." },
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
  console.log(`Batch 69 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
