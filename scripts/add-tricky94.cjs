// Tricky batch #94 — BRUTAL 4+ line scenarios. Hand-verified. EXPERT.
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
  { t: "Average (cricket)", q: "A batsman has an average of 40 runs in 30 innings. His highest score exceeds his lowest score by 100 runs. If these two innings are excluded, his average over the remaining 28 innings drops to 39. His highest score in an innings was:", o: ["104", "100", "108", "96"], c: 0, e: "Total 1200; 28 innings 1092; H+L=108, H−L=100 → H=104." },
  { t: "Pipes (leak)", q: "A pipe can fill a tank in 15 hours. Due to a leak at the bottom, it takes 20 hours to fill the tank. If the tank is full, the time the leak alone will take to empty it is:", o: ["60 hours", "45 hours", "50 hours", "40 hours"], c: 0, e: "1/15 − 1/L = 1/20 → 1/L = 1/60 → 60 hours." },
  { t: "Profit & Loss (dishonest)", q: "A dealer professes to sell his goods at cost price but uses a weight of 960 g in place of 1 kg, and additionally adds 10% impurities to the goods free of cost. His total percentage gain is:", o: ["14.6%", "12%", "10%", "15%"], c: 0, e: "Sells 960 g claimed as 1000 g, plus 10% impurity → effective given 960/1.1≈872.7 g of real goods; gain ≈ (1000−872.7)/872.7 ≈ 14.6%." },
  { t: "Time & Distance (train)", q: "A train travelling at 90 km/h crosses a platform in 30 seconds and a man standing on the platform in 15 seconds. The length of the platform (in metres) is:", o: ["375", "350", "400", "300"], c: 0, e: "Train length = 25×15 = 375 m; platform = 25×30 − 375 = 375 m." },
];
const REASON = [
  { t: "Syllogism", q: "Statements: No student is lazy. All lazy people are poor. Some poor people are honest. Conclusions: I. No student is poor. II. Some honest people are lazy. Which conclusion(s) follow?", o: ["Neither", "Only I", "Only II", "Both"], c: 0, e: "Neither follows: I overreaches, II not certain." },
  { t: "Seating (circular)", q: "Six persons P, Q, R, S, T and U sit around a circular table facing the centre. Q sits second to the right of P. R sits to the immediate left of P. S is not a neighbour of Q. T sits between Q and U. The person sitting opposite to R is:", o: ["T", "S", "U", "Q"], c: 0, e: "working", skip: true },
  { t: "Coding (logic)", q: "In a certain code, 'sun is bright' = 'ka na ta', 'moon is bright' = 'na ta pa', and 'sun and moon' = 'ka ra pa'. In this code, the word for 'bright' is:", o: ["ta", "na", "ka", "pa"], c: 0, e: "ambiguous", skip: true },
  { t: "Ranking", q: "In a class of 60 students, Rohan is ranked 17th from the top. Meena is ranked 28th from the bottom. The number of students between Rohan and Meena, assuming no overlap, is:", o: ["15", "16", "14", "17"], c: 0, e: "Rohan 17th top; Meena 28th bottom = 33rd top; between = 33−17−1 = 15." },
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
  console.log(`Batch 94 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
