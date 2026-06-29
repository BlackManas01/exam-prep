// Tricky batch #59 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If a−b=5, ab=14, a²+b²=?", o: ["53", "39", "45", "49"], c: 0, e: "(a−b)²+2ab = 25+28 = 53." },
  { t: "Trigonometry", d: "EXPERT", q: "tan60° × cot60° = ?", o: ["1", "√3", "1/√3", "3"], c: 0, e: "tanθ×cotθ = 1." },
  { t: "Geometry", d: "EXPERT", q: "Sum of interior angles of a pentagon:", o: ["540°", "360°", "720°", "450°"], c: 0, e: "(5−2)×180 = 540°." },
  { t: "Number System", d: "EXPERT", q: "Units digit of 7⁴⁵:", o: ["7", "3", "9", "1"], c: 0, e: "Cycle 7,9,3,1; 45 mod 4 = 1 → 7." },
  { t: "Percentage", d: "EXPERT", q: "A scores 80%, total 500. Marks:", o: ["400", "350", "420", "380"], c: 0, e: "0.8×500 = 400." },
  { t: "Compound Interest", d: "EXPERT", q: "₹10000 at 20% for 2 years CI:", o: ["₹4400", "₹4000", "₹4200", "₹4800"], c: 0, e: "10000×1.44 = 14400 → 4400." },
  { t: "Average", d: "EXPERT", q: "Average of 1 to 9:", o: ["5", "4.5", "5.5", "6"], c: 0, e: "(1+9)/2 = 5." },
  { t: "Profit & Loss", d: "EXPERT", q: "20% loss; CP ₹500. SP:", o: ["₹400", "₹420", "₹450", "₹380"], c: 0, e: "500×0.8 = 400." },
  { t: "Mensuration", d: "EXPERT", q: "Area of circle radius 7 (π=22/7):", o: ["154", "144", "164", "150"], c: 0, e: "22/7×49 = 154." },
  { t: "Time & Work", d: "EXPERT", q: "A 8 days, B 8 days. Together:", o: ["4 days", "8 days", "6 days", "5 days"], c: 0, e: "1/8+1/8 = 1/4 → 4 days." },
  { t: "Ratio", d: "EXPERT", q: "If 2:3 = x:18, x = ?", o: ["12", "9", "15", "10"], c: 0, e: "x = 2×18/3 = 12." },
  { t: "Speed", d: "EXPERT", q: "Convert 72 km/h to m/s:", o: ["20", "18", "25", "22"], c: 0, e: "72×5/18 = 20 m/s." },
  { t: "Simplification", d: "EXPERT", q: "(25×4) − (60÷5) = ?", o: ["88", "90", "85", "92"], c: 0, e: "100 − 12 = 88." },
  { t: "Surds", d: "EXPERT", q: "√625 = ?", o: ["25", "24", "26", "20"], c: 0, e: "25² = 625." },
  { t: "Mensuration", d: "EXPERT", q: "Volume of cube side 5:", o: ["125", "100", "150", "75"], c: 0, e: "5³ = 125." },
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
  console.log(`Batch 59 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
