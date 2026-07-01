// Tricky batch #93 — BRUTAL 4+ line scenarios. Hand-verified. EXPERT.
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
  { t: "Percentage (population)", q: "The population of a town increases by 10% during the first year and then decreases by 10% during the second year. If the population at the end of the second year is 79,200, the population at the beginning of the first year was:", o: ["80,000", "78,000", "81,000", "79,000"], c: 0, e: "P×1.1×0.9 = 0.99P = 79200 → P = 80000." },
  { t: "Simple Interest (reverse)", q: "A certain sum of money, lent out at simple interest, earns ₹720 as interest in 3 years at 6% per annum. The sum lent out was:", o: ["₹4,000", "₹3,600", "₹4,200", "₹3,800"], c: 0, e: "720 = P×6×3/100 = 0.18P → P = 4000." },
  { t: "Time & Work (M/W)", q: "6 men or 8 women can complete a piece of work in 10 days. Working together, 3 men and 4 women will complete the same work in:", o: ["10 days", "8 days", "12 days", "9 days"], c: 0, e: "6M=8W → 4W=3M; 3M+4W = 6M → same as 6 men → 10 days." },
  { t: "CI − SI", q: "The difference between the compound interest and the simple interest on a certain sum for 2 years at 5% per annum is ₹25. The sum is:", o: ["₹10,000", "₹8,000", "₹12,000", "₹9,000"], c: 0, e: "Diff = P(r/100)² = 0.0025P = 25 → P = 10000." },
];
const REASON = [
  { t: "Syllogism", q: "Statements: All lions are animals. All animals need water. Some that need water are plants. Conclusions: I. All lions need water. II. Some plants are lions. Which conclusion(s) follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Lions→animals→need water → I. Plants-lions link not certain → II no." },
  { t: "Direction", q: "A man starts walking towards the East. After walking 15 m he turns to his right and walks 20 m. Then he turns right again and walks 15 m. Finally he turns to his left and walks 10 m. How far and in which direction is he now from the starting point?", o: ["30 m South", "30 m North", "20 m South", "25 m South"], c: 0, e: "E15,S20,W15,S10 → E/W cancel, South 30 → 30 m South." },
  { t: "Number Series", q: "In the following series, one term is wrong. Find the wrong term: 3, 10, 32, 111, 460, 2315. The incorrect term is:", o: ["460", "111", "32", "2315"], c: 0, e: "×3+1, ×3+2, ×3+3, ×3+4, ×3+5: 111×3+4=337 (not 460) → 460 is wrong." },
  { t: "Blood Relations", q: "Introducing a boy, Sita said, 'He is the son of the daughter of the father of my uncle.' How is the boy related to Sita?", o: ["Cousin", "Brother", "Nephew", "Son"], c: 0, e: "Father of uncle = grandfather; his daughter = Sita's mother/aunt; her son = Sita's brother or cousin → cousin.", skip: true },
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
  console.log(`Batch 93 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
