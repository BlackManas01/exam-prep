// Tricky batch #83 — BRUTAL long scenarios. Hand-verified. EXPERT.
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
  { t: "Ages", q: "The sum of the ages of a father and son is 60 years. Six years ago the father's age was five times the son's. After 6 years the son's age will be:", o: ["20", "18", "24", "16"], c: 0, e: "Now F=46,S=14; +6 → son 20." },
  { t: "Speed", q: "A man covers a distance of 600 km. He travels the first half at 60 km/h and the second half at 40 km/h. His average speed for the whole trip is:", o: ["48 km/h", "50 km/h", "45 km/h", "52 km/h"], c: 0, e: "2×60×40/100 = 48 km/h." },
  { t: "Profit & Loss", q: "A trader allows a discount of 10% and still gains 20%. If the marked price is ₹600, the cost price is:", o: ["₹450", "₹480", "₹500", "₹420"], c: 0, e: "SP=540; CP=540/1.2 = 450." },
  { t: "Compound Interest", q: "A sum becomes ₹2420 in 2 years and ₹2662 in 3 years at compound interest. The sum is:", o: ["₹2000", "₹2200", "₹1800", "₹2100"], c: 0, e: "Rate=242/2420=10%; P=2420/1.21 = 2000." },
];
const REASON = [
  { t: "Puzzle", q: "Five books P,Q,R,S,T are stacked. R is above S. P is at the bottom. T is just below Q. S is above P. Which book is at the top?", o: ["Q", "T", "R", "S"], c: 0, e: "Bottom P,S,R,T,Q top → Q." },
  { t: "Blood Relations", q: "Introducing a man, a woman said: 'His mother is the only daughter of my mother.' Then the woman's relation to the man is:", o: ["Mother", "Sister", "Aunt", "Grandmother"], c: 0, e: "Only daughter of her mother = herself → his mother → Mother." },
  { t: "Syllogism", q: "Statements: No cat is dog. All dogs are loyal. Some loyal are wild. Conclusions: I. Some loyal are not cats. II. Some wild are dogs. Which follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Dogs are loyal but not cats → some loyal not cats (I)." },
];
function hash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffle(o, ci) { const a = o.map((t, i) => ({ t, c: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const all = []; QT.forEach((T) => QUANT.forEach((q) => all.push([T, q]))); RT.forEach((T) => REASON.forEach((q) => all.push([T, q])));
  if (process.argv.includes("--verify")) { [...QUANT, ...REASON].forEach((q, i) => console.log(`${i + 1}. [${q.t}] ${q.o[q.c]}`)); console.log(`Total: ${QUANT.length + REASON.length}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const [T, q] of all) { const id = crypto.randomUUID(); qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: hash(q.q, q.o[q.c]), isActive: true }); shuffle(q.o, q.c).forEach((o, i) => oRows.push({ questionId: id, text: o.t, isCorrect: o.c, displayOrder: i })); }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 83 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
