// Tricky batch #89 — BRUTAL 4+ line scenarios (harder). Hand-verified. EXPERT.
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
  { t: "Successive Change", q: "The price of a commodity first increases by 20%, then by a further 25%, and finally decreases by 10%. The single equivalent percentage change in the price is:", o: ["35% increase", "30% increase", "40% increase", "32% increase"], c: 0, e: "1.20×1.25×0.90 = 1.35 → 35% increase." },
  { t: "Profit & Loss", q: "By selling an article for ₹1,140 a man incurs a loss of 5%. The price at which he must sell it to gain 10% instead is:", o: ["₹1,320", "₹1,254", "₹1,300", "₹1,200"], c: 0, e: "CP = 1140/0.95 = 1200; for 10% gain SP = 1200×1.1 = 1320." },
  { t: "Alligation", q: "Three varieties of rice costing ₹20, ₹30 and ₹40 per kg are mixed in the ratio 1 : 2 : 3 respectively. The average cost per kg of the resulting mixture is:", o: ["₹33.33", "₹30", "₹35", "₹32"], c: 0, e: "(1×20+2×30+3×40)/6 = 200/6 = ₹33.33." },
  { t: "Calendar", q: "It is given that 26 January 2020 was a Sunday. Using the rules of odd days (and accounting for leap years), the day of the week on 26 January 2024 will be:", o: ["Friday", "Saturday", "Thursday", "Sunday"], c: 0, e: "Odd days 2020-24 = 2+1+1+1 = 5 → Sunday + 5 = Friday." },
];
const REASON = [
  { t: "Ages (ratio)", q: "The present ages of three friends A, B and C are in the ratio 3 : 5 : 7. If the sum of their present ages is 90 years, then the age of C four years from now will be:", o: ["46", "42", "44", "48"], c: 0, e: "15x=90→x=6; C=42 now → 42+4 = 46." },
  { t: "Syllogism", q: "Statements: All engineers are graduates. Some graduates are employed. No employed person is idle. Conclusions: I. Some graduates are not idle. II. Some engineers are employed. Which conclusion(s) follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Employed graduates aren't idle → some graduates not idle (I). II uncertain." },
  { t: "Blood Relations", q: "A family has six members P, Q, R, S, T and U. P and Q are a married couple, P being the male. R and S are brothers. T is the brother of P. U is the mother of P. Among the members, the number of male members is at most:", o: ["4", "3", "5", "2"], c: 0, e: "P (male), T (brother of P, male), R & S (brothers, male) → at least 4 males; U female, Q female → 4." },
  { t: "Series", q: "Observe the series and find the missing term: 7, 8, 18, 57, ?, 1165. The number that fits in the blank is:", o: ["232", "230", "228", "234"], c: 0, e: "Rule ×1+1, ×2+2, ×3+3, ×4+4, ×5+5: 57×4+4 = 232 (232×5+5 = 1165)." },
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
  console.log(`Batch 89 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
