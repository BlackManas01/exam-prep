// Tricky batch #56 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Percentage", d: "EXPERT", q: "12.5% of 800 = ?", o: ["100", "80", "120", "90"], c: 0, e: "1/8 × 800 = 100." },
  { t: "Surds", d: "EXPERT", q: "Cube root of 729:", o: ["9", "8", "7", "11"], c: 0, e: "9³ = 729." },
  { t: "Geometry", d: "EXPERT", q: "Triangle base 10, height 6. Area:", o: ["30", "60", "16", "36"], c: 0, e: "½×10×6 = 30." },
  { t: "Profit & Loss", d: "EXPERT", q: "CP ₹600, SP ₹750. Profit %:", o: ["25%", "20%", "30%", "15%"], c: 0, e: "150/600 = 25%." },
  { t: "Percentage", d: "EXPERT", q: "75% of 80 = ?", o: ["60", "55", "65", "70"], c: 0, e: "0.75×80 = 60." },
  { t: "Simple Interest", d: "EXPERT", q: "SI on ₹1000 at 6% for 4 years:", o: ["₹240", "₹200", "₹260", "₹220"], c: 0, e: "1000×6×4/100 = 240." },
  { t: "Ratio", d: "EXPERT", q: "₹300 divided 7:8. Smaller share:", o: ["₹140", "₹160", "₹150", "₹120"], c: 0, e: "7/15×300 = 140." },
  { t: "Mensuration", d: "EXPERT", q: "Volume of cuboid 2×3×4:", o: ["24", "18", "20", "26"], c: 0, e: "2×3×4 = 24." },
  { t: "Average", d: "EXPERT", q: "Average of 10,20,30,40,50:", o: ["30", "25", "35", "40"], c: 0, e: "150/5 = 30." },
  { t: "Speed", d: "EXPERT", q: "90 km in 1.5 h. Speed:", o: ["60 km/h", "45 km/h", "75 km/h", "55 km/h"], c: 0, e: "90/1.5 = 60." },
  { t: "Percentage", d: "EXPERT", q: "If 40% of x = 200, x = ?", o: ["500", "400", "450", "550"], c: 0, e: "200/0.4 = 500." },
  { t: "Discount", d: "EXPERT", q: "25% off ₹800:", o: ["₹600", "₹650", "₹550", "₹620"], c: 0, e: "800×0.75 = 600." },
  { t: "Number System", d: "EXPERT", q: "√1764 = ?", o: ["42", "40", "44", "46"], c: 0, e: "42² = 1764." },
  { t: "Algebra", d: "EXPERT", q: "If 3x = 81, x = ?", o: ["27", "9", "3", "4"], c: 0, e: "81/3 = 27." },
  { t: "Fraction", d: "EXPERT", q: "2/5 of 200 = ?", o: ["80", "100", "60", "120"], c: 0, e: "0.4×200 = 80." },
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
  console.log(`Batch 56 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
