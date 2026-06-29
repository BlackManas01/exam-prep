// Tricky batch #51 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Mensuration", d: "EXPERT", q: "Curved surface area of a cone with r=3, slant l=5 (π form):", o: ["15π", "12π", "9π", "20π"], c: 0, e: "CSA = πrl = π×3×5 = 15π." },
  { t: "Ages", d: "EXPERT", q: "Father is 40, son 10. After how many years is father twice the son's age?", o: ["20", "15", "25", "10"], c: 0, e: "40+x = 2(10+x) → x = 20." },
  { t: "Partnership", d: "EXPERT", q: "A and B invest 3:2; profit ₹3000. A's share:", o: ["₹1800", "₹1200", "₹1500", "₹2000"], c: 0, e: "3/5×3000 = 1800." },
  { t: "Alligation", d: "EXPERT", q: "Equal volumes of 20% and 40% acid mixed. Resulting strength:", o: ["30%", "25%", "35%", "28%"], c: 0, e: "Average = (20+40)/2 = 30%." },
  { t: "HCF/LCM", d: "EXPERT", q: "LCM of 4, 6, 8:", o: ["24", "12", "48", "16"], c: 0, e: "LCM(4,6,8) = 24." },
  { t: "Surds", d: "EXPERT", q: "√4096 = ?", o: ["64", "62", "66", "60"], c: 0, e: "64² = 4096." },
  { t: "Algebra", d: "EXPERT", q: "If 2ˣ = 32, x = ?", o: ["5", "4", "6", "8"], c: 0, e: "2⁵ = 32." },
  { t: "Compound Ratio", d: "EXPERT", q: "Compound ratio of 2:3 and 4:5:", o: ["8:15", "6:8", "2:5", "8:5"], c: 0, e: "(2×4):(3×5) = 8:15." },
  { t: "Average", d: "EXPERT", q: "Average of first 5 even numbers (2,4,6,8,10):", o: ["6", "5", "7", "8"], c: 0, e: "30/5 = 6." },
  { t: "Discount", d: "EXPERT", q: "20% discount on ₹500 marked price gives:", o: ["₹400", "₹420", "₹380", "₹450"], c: 0, e: "500×0.8 = 400." },
  { t: "Percentage", d: "EXPERT", q: "Percentage increase from 50 to 75:", o: ["50%", "25%", "33%", "40%"], c: 0, e: "25/50 = 50%." },
  { t: "Profit & Loss", d: "EXPERT", q: "CP ₹800, SP ₹1000. Profit %:", o: ["25%", "20%", "30%", "15%"], c: 0, e: "200/800 = 25%." },
  { t: "Mensuration", d: "EXPERT", q: "Diagonal of a square of side 10 cm:", o: ["10√2 cm", "20 cm", "10 cm", "5√2 cm"], c: 0, e: "Diagonal = a√2 = 10√2." },
  { t: "Number System", d: "EXPERT", q: "Sum of first 10 natural numbers:", o: ["55", "50", "45", "60"], c: 0, e: "10×11/2 = 55." },
  { t: "Simplification", d: "EXPERT", q: "15% of 200 + 10% of 100 = ?", o: ["40", "35", "45", "30"], c: 0, e: "30 + 10 = 40." },
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
  console.log(`Batch 51 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
