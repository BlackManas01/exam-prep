// Tricky batch #87 — BRUTAL 4+ line scenarios. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const QT = [
  { examCode: "ssc-cgl-tier1", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "ssc-chsl-tier1", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "ibps-po-prelims", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "ssc-cgl-tier2", sectionCode: "quant", subject: "Quantitative Aptitude" },
];
const RT = [
  { examCode: "ssc-cgl-tier1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-chsl-tier1", sectionCode: "general-intelligence", subject: "General Intelligence" },
  { examCode: "ibps-po-prelims", sectionCode: "reasoning", subject: "Reasoning Ability" },
  { examCode: "ssc-cgl-tier2", sectionCode: "reasoning", subject: "Reasoning" },
];
const QUANT = [
  { t: "Data Interpretation", q: "A shopkeeper's sales in January were ₹40,000. Each month his sales increase by 10% over the previous month. His total sales for January, February and March together amount to:", o: ["₹1,32,400", "₹1,30,000", "₹1,28,400", "₹1,33,200"], c: 0, e: "40000+44000+48400 = 132400." },
  { t: "Wages", q: "A can do a job in 6 days, B in 8 days and C in 12 days. They work together and are paid ₹1,800 in total. Since payment is in proportion to work done, C's share is:", o: ["₹400", "₹450", "₹600", "₹300"], c: 0, e: "Rates 1/6:1/8:1/12 = 4:3:2 → C = 2/9×1800 = 400." },
  { t: "Partnership", q: "A starts a business with ₹12,000 and after 4 months adds ₹6,000 more. B joins at the start with ₹16,000 for the whole year. At year-end the profit is ₹21,000. B's share is:", o: ["₹10,500", "₹12,000", "₹9,000", "₹14,000"], c: 0, e: "A = 12000×4 + 18000×8 = 192000; B = 16000×12 = 192000 → 1:1 → B = 10500." },
  { t: "Trains", q: "A 120 m long train running at 54 km/h overtakes a 180 m long train moving in the SAME direction and completely passes it in 60 seconds. The speed of the slower train (km/h) is:", o: ["36", "30", "40", "45"], c: 0, e: "Relative = 300 m/60 s = 5 m/s = 18 km/h; 54 − vB = 18 → vB = 36." },
];
const REASON = [
  { t: "Floor Puzzle", q: "Five people P, Q, R, S, T live in a five-storey building (floor 1 at the bottom). P lives on the topmost floor. There is exactly one person between P and Q. R lives immediately above S. T does not live on floor 1. The person on floor 2 is:", o: ["R", "S", "T", "Q"], c: 0, e: "P=5, Q=3 (one between). R immediately above S among {1,2,4} → S=1,R=2; T=4. Floor 2 = R." },
  { t: "Coding", q: "In a certain language, 'pit dnu ja' means 'apple is red', 'dnu ka' means 'red car', and 'ja la' means 'sweet apple'. In this language, the word for 'is' is:", o: ["pit", "dnu", "ja", "la"], c: 0, e: "apple=ja, red=dnu → in line 1 the remaining word 'pit' = is." },
  { t: "Syllogism", q: "Statements: All books are papers. Some papers are pens. All pens are blue. Conclusions: I. Some papers are blue. II. Some books are blue. Which conclusion(s) follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Pens are blue & pens are papers → some papers blue (I). II not certain." },
  { t: "Blood Relations", q: "Pointing to a lady in a photograph, Rahul said, 'Her father's only son's wife is my mother.' How is the lady related to Rahul?", o: ["Sister", "Mother", "Aunt", "Cousin"], c: 0, e: "Her father's only son = the lady's brother; his wife = Rahul's mother → that brother is Rahul's father → the lady is Rahul's aunt? Father's sister = aunt.", skip: true },
];
function hash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffle(o, ci) { const a = o.map((t, i) => ({ t, c: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const Q = QUANT.filter((x) => !x.skip), R = REASON.filter((x) => !x.skip);
  const all = []; QT.forEach((T) => Q.forEach((q) => all.push([T, q]))); RT.forEach((T) => R.forEach((q) => all.push([T, q])));
  if (process.argv.includes("--verify")) { [...Q, ...R].forEach((q, i) => console.log(`${i + 1}. [${q.t}] ${q.o[q.c]}`)); console.log(`Total: ${Q.length + R.length}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const [T, q] of all) { const id = crypto.randomUUID(); qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: hash(q.q, q.o[q.c]), isActive: true }); shuffle(q.o, q.c).forEach((o, i) => oRows.push({ questionId: id, text: o.t, isCorrect: o.c, displayOrder: i })); }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 87 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
