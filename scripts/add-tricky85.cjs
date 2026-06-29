// Tricky batch #85 — BRUTAL long scenarios. Hand-verified. EXPERT.
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
  { t: "Profit & Loss", q: "A dishonest dealer claims to sell at cost price but uses a 800 g weight for a kg. His gain percentage is:", o: ["25%", "20%", "12.5%", "33%"], c: 0, e: "Gain = 200/800 = 25%." },
  { t: "SI/CI", q: "The difference between CI and SI on a sum at 10% for 2 years is ₹50. The sum is:", o: ["₹5000", "₹4000", "₹6000", "₹5500"], c: 0, e: "Diff = P(r/100)² = 0.01P = 50 → P = 5000." },
  { t: "Time & Distance", q: "A man walking at 4/5 of his usual speed reaches office 10 minutes late. His usual time (minutes) is:", o: ["40", "50", "30", "45"], c: 0, e: "5/4 ratio → extra 1/4 time = 10 → usual = 40 min." },
  { t: "Allegation", q: "In what ratio must rice at ₹30/kg be mixed with ₹40/kg to get a mix worth ₹36/kg?", o: ["2:3", "3:2", "1:1", "4:1"], c: 0, e: "(40−36):(36−30) = 4:6 = 2:3." },
];
const REASON = [
  { t: "Blood Relations", q: "A is the father of B. C is the daughter of B. D is the brother of A. E is the son of C. How is A related to E?", o: ["Great-grandfather", "Grandfather", "Father", "Uncle"], c: 0, e: "A→B→C→E across three generations → great-grandfather." },
  { t: "Syllogism", q: "All cups are plates. Some plates are spoons. No spoon is steel. Conclusions: I. Some plates are not steel. II. Some cups are spoons. Which follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Spoons not steel & spoons are plates → some plates not steel (I)." },
  { t: "Direction", q: "From home, a boy cycles 3 km E, 4 km N, 3 km W, 8 km S. His distance from home is:", o: ["4 km", "5 km", "3 km", "6 km"], c: 0, e: "Net E0, S4 → 4 km South." },
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
  console.log(`Batch 85 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
