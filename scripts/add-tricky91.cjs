// Tricky batch #91 — BRUTAL 4+ line scenarios (toughest). Hand-verified. EXPERT.
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
  { t: "Profit & Loss (chain)", q: "A man sells an article to a wholesaler at a profit of 20%. The wholesaler sells it to a retailer at a profit of 25%, and the retailer sells it to a customer at a profit of 10%. If the customer pays ₹825, the original cost to the man was:", o: ["₹500", "₹550", "₹600", "₹480"], c: 0, e: "825 = CP×1.2×1.25×1.10 = 1.65 CP → CP = 500." },
  { t: "Pipes (timed)", q: "Two pipes A and B can fill a tank in 24 and 32 minutes respectively. Both are opened together, but pipe B is closed after some minutes so that the tank is full in exactly 18 minutes. The number of minutes after which B was closed is:", o: ["8", "6", "10", "12"], c: 0, e: "A for 18 min = 18/24 = 3/4; remaining 1/4 from B → 1/4 = t/32 → t = 8 min." },
  { t: "Averages (combined)", q: "The average marks of 30 students in a class is 40. The average of the top 10 is 70 and that of the bottom 10 is 20. The average marks of the remaining 10 students is:", o: ["30", "35", "25", "40"], c: 0, e: "Total 1200; top 700, bottom 200; rest = 300 → average 30." },
  { t: "Simple/Compound", q: "A certain sum of money becomes ₹6,690 after 3 years and ₹10,035 after 6 years on compound interest, interest compounded annually. The sum (principal) is:", o: ["₹4,460", "₹4,000", "₹5,000", "₹4,230"], c: 0, e: "Ratio 10035/6690 = 1.5 over 3 yrs → (1+r)³=1.5; P = 6690/1.5 = ₹4,460." },
];
const REASON = [
  { t: "Puzzle (ranking)", q: "Among five friends, A is taller than B but shorter than C. D is taller than A but shorter than C. E is shorter than B. Arranged from tallest to shortest, who stands exactly in the middle?", o: ["A", "D", "B", "C"], c: 0, e: "C > D > A > B > E → middle (3rd) is A." },
  { t: "Syllogism (3-stmt)", q: "Statements: Some pens are pencils. All pencils are erasers. No eraser is red. Conclusions: I. Some pens are erasers. II. No pencil is red. Which conclusion(s) follow?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "Pens that are pencils are erasers → I. Pencils are erasers and no eraser is red → no pencil red → II." },
  { t: "Coding (number)", q: "In a code, if MONDAY is written as 132 and FRIDAY is written as 124 by adding the alphabet positions of the letters, then SUNDAY would be written as:", o: ["96", "98", "94", "100"], c: 0, e: "S19+U21+N14+D4+A1+Y25 = 84? recompute: 19+21+14+4+1+25 = 84. (Adjust answer.)", skip: true },
  { t: "Data Sufficiency", q: "Six people A-F are sitting in a circle facing the centre. A is between F and B. C is to the immediate right of B. D is between C and E. Considering all constraints, the person sitting opposite to A is:", o: ["D", "E", "C", "F"], c: 0, e: "Clockwise: F,A,B,C,D,E → opposite A (2nd) is D (5th, +3 in 6-seat)." },
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
  console.log(`Batch 91 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
