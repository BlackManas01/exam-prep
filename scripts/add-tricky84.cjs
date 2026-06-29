// Tricky batch #84 — BRUTAL long scenarios. Hand-verified. EXPERT.
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
  { t: "Time & Work", q: "A is twice as efficient as B. Together they finish a job in 12 days. The time A alone takes is:", o: ["18 days", "24 days", "20 days", "16 days"], c: 0, e: "A=2B; combined 3B units; 12 days total; A alone = 36/2 = 18 days." },
  { t: "Percentage", q: "A's salary is 20% more than B's. B's is 25% less than C's. If C earns ₹20000, A earns:", o: ["₹18000", "₹20000", "₹15000", "₹22000"], c: 0, e: "B=15000; A=1.2×15000 = 18000." },
  { t: "Mixtures", q: "Two vessels have milk:water as 2:1 and 5:1. Equal volumes are mixed. The ratio in the mixture is:", o: ["3:1", "7:5", "2:1", "4:1"], c: 0, e: "2/3+5/6=3/2 milk, 1/3+1/6=1/2 water → 3:1." },
  { t: "Speed", q: "A train passes a 120 m platform in 15 s and a 200 m platform in 19 s. Its length is:", o: ["180 m", "150 m", "200 m", "120 m"], c: 0, e: "(L+200)/19=(L+120)/15 → 80/4 m/s=20; L=20×15−120=180." },
];
const REASON = [
  { t: "Ranking", q: "In a row of 40 children, Asha is 11th from the left and Bina is 31st from the left. After they swap, Asha is 12th from the left from Bina's old place — how many children sit between them?", o: ["19", "20", "18", "21"], c: 0, e: "Positions 11 and 31 → between = 31−11−1 = 19." },
  { t: "Blood Relations", q: "A and B are siblings. C is A's son. D is B's father. The relation of D to C is:", o: ["Grandfather", "Father", "Uncle", "Brother"], c: 0, e: "D is parent of A&B; C is A's son → D is C's grandfather." },
  { t: "Syllogism", q: "All squares are figures. Some figures are circles. No circle is straight. Conclusions: I. Some figures not straight. II. All squares are circles. Which follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Circles not straight & circles are figures → some figures not straight (I)." },
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
  console.log(`Batch 84 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
