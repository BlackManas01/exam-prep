// Tricky batch #81 — BRUTAL long scenarios. Hand-verified. EXPERT.
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
  { t: "Data Interpretation", q: "A shop sold 400 items in a week. 30% were sold on Monday and 25% on Tuesday. The remaining items were sold equally on Wednesday, Thursday and Friday. The number of items sold on Thursday is:", o: ["60", "50", "45", "75"], c: 0, e: "Mon 120, Tue 100, rest 180 over 3 days = 60 each." },
  { t: "Boats", q: "A boat's speed in still water is 16 km/h and the stream flows at 4 km/h. The boat travels 48 km downstream and returns. The total time taken is:", o: ["6.4 h", "6 h", "7.2 h", "8 h"], c: 0, e: "Down 20→2.4 h, up 12→4 h; total 6.4 h." },
  { t: "Partnership", q: "A invests ₹8000 for 12 months, B invests ₹12000 for 6 months. They earn ₹35000 profit. A's share is:", o: ["₹20000", "₹15000", "₹17500", "₹21000"], c: 0, e: "96000:72000 = 4:3 → A = 4/7×35000 = 20000." },
  { t: "Trains", q: "Two trains 120 m and 180 m long run in opposite directions at 40 km/h and 50 km/h. The time they take to cross each other is:", o: ["12 s", "10 s", "15 s", "9 s"], c: 0, e: "300 m at 90 km/h (25 m/s) = 12 s." },
];
const REASON = [
  { t: "Seating", q: "Six students P-U sit in a row facing north. P is at the left end. R is third from the right. S sits between P and Q. T is immediate right of R. Identify who sits at the right end.", o: ["U", "T", "Q", "R"], c: 0, e: "P,S,Q,R,T,U → right end is U." },
  { t: "Blood Relations", q: "A is B's brother, C is B's father, D is C's father, E is D's only son. Then A is E's:", o: ["Grandson", "Son", "Nephew", "Brother"], c: 0, e: "E = D's only son = C; A is C's child → grandson of D, so A is E(=C)'s son? E is C → A is son.", skip: true },
  { t: "Syllogism", q: "Statements: All teachers are scholars. Some scholars are poets. No poet is rich. Conclusions: I. Some scholars are not rich. II. Some teachers are poets. Which follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Poets aren't rich → some scholars not rich (I). II uncertain." },
  { t: "Direction", q: "Starting facing East, a person walks 6 km, turns left, walks 8 km, turns left, walks 6 km. How far is he from start and in which direction?", o: ["8 km North", "8 km South", "6 km North", "10 km North"], c: 0, e: "E6,N8,W6 → net N8 → 8 km North." },
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
  console.log(`Batch 81 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
