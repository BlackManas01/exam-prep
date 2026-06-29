// Tricky batch #64 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If a+b=7 and a²+b²=29, then ab = ?", o: ["10", "12", "8", "14"], c: 0, e: "ab = ((7)²−29)/2 = 20/2 = 10." },
  { t: "Geometry", d: "EXPERT", q: "Each interior angle of a regular hexagon:", o: ["120°", "108°", "135°", "144°"], c: 0, e: "(6−2)×180/6 = 120°." },
  { t: "Number System", d: "EXPERT", q: "Units digit of 3³³:", o: ["3", "9", "7", "1"], c: 0, e: "Cycle 3,9,7,1; 33 mod 4 = 1 → 3." },
  { t: "Profit & Loss", d: "EXPERT", q: "Two articles each ₹600: one +20%, one −20%. Net:", o: ["Loss ₹50", "No loss", "Profit ₹50", "Loss ₹100"], c: 0, e: "Equal SP +/−20% always 4% loss on one CP pair = ₹50 loss." },
  { t: "Percentage", d: "EXPERT", q: "60% of 60% of 250:", o: ["90", "100", "120", "150"], c: 0, e: "0.6×0.6×250 = 90." },
  { t: "CI", d: "EXPERT", q: "₹12000 at 5% for 2 years CI:", o: ["₹1230", "₹1200", "₹1250", "₹1260"], c: 0, e: "12000×1.05²=13230 → 1230." },
  { t: "Average", d: "EXPERT", q: "Average of 3 numbers 40; two are 30 & 50. Third:", o: ["40", "30", "50", "45"], c: 0, e: "Sum 120 − 80 = 40." },
  { t: "Speed", d: "EXPERT", q: "Two trains 60 & 40 km/h opposite; relative speed:", o: ["100 km/h", "20 km/h", "50 km/h", "120 km/h"], c: 0, e: "Opposite → 60+40 = 100." },
  { t: "Mensuration", d: "EXPERT", q: "Perimeter of square area 144:", o: ["48", "44", "36", "40"], c: 0, e: "Side 12 → 4×12 = 48." },
  { t: "Time & Work", d: "EXPERT", q: "12 men 9 days. 18 men days:", o: ["6", "8", "5", "7"], c: 0, e: "108/18 = 6." },
  { t: "Ratio", d: "EXPERT", q: "x:y = 5:3, x+y = 32. x = ?", o: ["20", "18", "15", "12"], c: 0, e: "5/8×32 = 20." },
  { t: "Surds", d: "EXPERT", q: "∛512 = ?", o: ["8", "7", "9", "6"], c: 0, e: "8³ = 512." },
  { t: "Trigonometry", d: "EXPERT", q: "cos0° + sin0° = ?", o: ["1", "0", "2", "−1"], c: 0, e: "1 + 0 = 1." },
  { t: "Simplification", d: "EXPERT", q: "(15²) − (13²) = ?", o: ["56", "60", "52", "48"], c: 0, e: "(15+13)(15−13) = 28×2 = 56." },
  { t: "Mensuration", d: "EXPERT", q: "Area of equilateral triangle side 4:", o: ["4√3", "8", "16", "2√3"], c: 0, e: "(√3/4)×16 = 4√3." },
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
  console.log(`Batch 64 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
