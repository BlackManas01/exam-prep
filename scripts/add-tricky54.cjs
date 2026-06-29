// Tricky batch #54 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Boats & Streams", d: "EXPERT", q: "Boat speed 10 km/h, stream 2 km/h. Downstream speed:", o: ["12 km/h", "8 km/h", "10 km/h", "6 km/h"], c: 0, e: "10+2 = 12 km/h." },
  { t: "Pipes & Cisterns", d: "EXPERT", q: "Pipe A fills in 6 h, B in 12 h. Together time:", o: ["4 h", "9 h", "8 h", "3 h"], c: 0, e: "1/6+1/12 = 1/4 → 4 h." },
  { t: "Mixture", d: "EXPERT", q: "Milk:water = 3:1 in 40 L. Litres of water:", o: ["10", "8", "12", "15"], c: 0, e: "1/4×40 = 10 L." },
  { t: "Number System", d: "EXPERT", q: "HCF of 24 and 36:", o: ["12", "6", "8", "18"], c: 0, e: "HCF = 12." },
  { t: "Algebra", d: "EXPERT", q: "If a+b=10, ab=21, a²+b²=?", o: ["58", "60", "54", "62"], c: 0, e: "(a+b)²−2ab = 100−42 = 58." },
  { t: "Average", d: "EXPERT", q: "Average of 5 consecutive integers is 12. Largest is:", o: ["14", "13", "15", "16"], c: 0, e: "Middle = 12 → 10,11,12,13,14 → 14." },
  { t: "Speed", d: "EXPERT", q: "Distance 240 km in 4 h. Average speed:", o: ["60 km/h", "50 km/h", "70 km/h", "55 km/h"], c: 0, e: "240/4 = 60." },
  { t: "Profit & Loss", d: "EXPERT", q: "SP ₹920 at 15% loss. CP:", o: ["₹1082.35", "₹1058", "₹1000", "₹1080"], c: 0, e: "920/0.85 ≈ ₹1082.35." },
  { t: "Percentage", d: "EXPERT", q: "If 30% of x = 90, then x =", o: ["300", "270", "330", "360"], c: 0, e: "90/0.3 = 300." },
  { t: "Mensuration", d: "EXPERT", q: "Perimeter of a circle radius 7 (π=22/7):", o: ["44", "42", "48", "40"], c: 0, e: "2×22/7×7 = 44." },
  { t: "Time & Work", d: "EXPERT", q: "A does 1/4 work in 5 days. Full work in:", o: ["20 days", "16 days", "25 days", "15 days"], c: 0, e: "5×4 = 20 days." },
  { t: "Simple Interest", d: "EXPERT", q: "₹6000 at 8% for 5 years SI:", o: ["₹2400", "₹2000", "₹2800", "₹2200"], c: 0, e: "6000×8×5/100 = 2400." },
  { t: "Ratio", d: "EXPERT", q: "Divide ₹120 in 1:2:3. Largest share:", o: ["₹60", "₹40", "₹20", "₹50"], c: 0, e: "6 parts → 20 each → 3×20 = 60." },
  { t: "Trigonometry", d: "EXPERT", q: "sin90° − cos90° = ?", o: ["1", "0", "−1", "2"], c: 0, e: "1 − 0 = 1." },
  { t: "Number System", d: "EXPERT", q: "Square of 25:", o: ["625", "525", "650", "600"], c: 0, e: "25² = 625." },
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
  console.log(`Batch 54 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
