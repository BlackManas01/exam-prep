// Tricky batch #80 — BRUTAL: long 4-line scenarios. Hand-verified. EXPERT.
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
  { t: "Data Interpretation", q: "In a school of 200 students, 60% are boys. Of the boys, 25% wear glasses; of the girls, 40% wear glasses. The total number of students wearing glasses is:", o: ["62", "60", "58", "64"], c: 0, e: "Boys 120→30, girls 80→32; total 62." },
  { t: "Simple Interest", q: "A man invests a sum, putting half at 10% and half at 20% simple interest. After one year his total interest is ₹450. The sum invested is:", o: ["₹3000", "₹2500", "₹3500", "₹4000"], c: 0, e: "0.5P(0.10)+0.5P(0.20)=0.15P=450 → P=3000." },
  { t: "Speed", q: "A car travels 200 km at 40 km/h and returns the same 200 km at 60 km/h. Its average speed for the whole journey is:", o: ["48 km/h", "50 km/h", "45 km/h", "52 km/h"], c: 0, e: "2×40×60/(40+60)=4800/100=48." },
  { t: "Time & Work", q: "A and B can finish a task in 12 and 15 days. They start together; A leaves after 3 days and B completes the rest. Total days taken:", o: ["11.25", "10", "12", "9.75"], c: 0, e: "3d→9/20 done; rest 11/20 by B(1/15)=8.25d → 11.25." },
  { t: "Profit & Loss", q: "By selling 33 metres of cloth a trader gains the cost of 11 metres. His profit percentage is:", o: ["33.3%", "25%", "50%", "11%"], c: 0, e: "Gain 11/33 = 1/3 = 33.3%." },
  { t: "Ratio", q: "The incomes of A and B are 3:4 and expenditures 5:7. If each saves ₹6000, A's income is:", o: ["₹18000", "₹24000", "₹15000", "₹12000"], c: 0, e: "3x−5y=6000, 4x−7y=6000 → x=6000 → A=3x=18000." },
];
const REASON = [
  { t: "Ranking", q: "In a class, Ravi is 7th from the top and 26th from the bottom. If 5 students fail and are removed (none in top 7), Ravi's rank from the bottom becomes:", o: ["21st", "26th", "20th", "19th"], c: 0, e: "Total 7+26−1=32; remove 5 below → 27 left; Ravi still 7th top → 27−7+1 = 21st from bottom." },
  { t: "Blood Relations", q: "Pointing to a photo, a man said: 'She is the daughter of my grandfather's only son.' How is the lady related to the man?", o: ["Sister", "Mother", "Aunt", "Daughter"], c: 0, e: "Grandfather's only son = man's father; his daughter = man's sister." },
  { t: "Syllogism", q: "All keys are locks. All locks are doors. Some doors are gates. Conclusions: I. All keys are doors. II. Some keys are gates. Which follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Keys→locks→doors so I; gates link to doors not keys → II uncertain." },
  { t: "Scheduling", q: "Five tasks done Mon-Fri, one per day. P is before Q. R is on Wed. S is the day after Q. T is on Mon. Which task is on Friday?", o: ["S", "Q", "P", "R"], c: 0, e: "T-Mon, R-Wed; P,Q,S fill Tue/Thu/Fri with P<Q<S → P-Tue,Q-Thu,S-Fri." },
];
function hash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffle(o, ci) { const a = o.map((t, i) => ({ t, c: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const all = []; QT.forEach((T) => QUANT.forEach((q) => all.push([T, q]))); RT.forEach((T) => REASON.forEach((q) => all.push([T, q])));
  if (process.argv.includes("--verify")) { [...QUANT, ...REASON].forEach((q, i) => console.log(`${i + 1}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`)); console.log(`\nTotal: ${QUANT.length + REASON.length}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const [T, q] of all) { const id = crypto.randomUUID(); qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: hash(q.q, q.o[q.c]), isActive: true }); shuffle(q.o, q.c).forEach((o, i) => oRows.push({ questionId: id, text: o.t, isCorrect: o.c, displayOrder: i })); }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 80 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
