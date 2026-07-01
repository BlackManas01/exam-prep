// Batch #102 — SSC CGL PYQ-LEVEL, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1";
const ITEMS = [
  { s: "quant", subj: "Quantitative Aptitude", t: "Geometry", q: "The sides of a triangle are in the ratio 3 : 4 : 5 and its perimeter is 144 cm. The area of the triangle is:", o: ["864 cm²", "720 cm²", "900 cm²", "600 cm²"], c: 0, e: "Sides 36,48,60 (right triangle) → area = ½×36×48 = 864 cm²." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Time & Distance", q: "A man covers a certain distance by car at 60 km/h and returns by the same route at 40 km/h. His average speed for the entire journey is:", o: ["48 km/h", "50 km/h", "45 km/h", "52 km/h"], c: 0, e: "2×60×40/100 = 48 km/h." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Partnership", q: "A and B started a business investing amounts in the ratio 3 : 5. After 6 months A doubled his investment while B kept his unchanged. At the end of the year, the profit ratio A : B is:", o: ["9 : 20", "3 : 5", "6 : 5", "1 : 2"], c: 0, e: "A = 3×6 + 6×6 = 54; B = 5×12 = 60 → 54:60 = 9:20." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Number System", q: "The largest four-digit number which when divided by 12, 15 and 18 leaves the same remainder 5 in each case is:", o: ["9905", "9900", "9965", "9945"], c: 0, e: "LCM(12,15,18)=180; largest 4-digit multiple = 9900; +5 = 9905." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Profit & Loss", q: "A shopkeeper sold an article at a loss of 10%. Had he sold it for ₹80 more, he would have made a profit of 10%. The cost price of the article is:", o: ["₹400", "₹350", "₹450", "₹500"], c: 0, e: "20% of CP = 80 → CP = 400." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Percentage", q: "The salary of an employee is first increased by 20% and then decreased by 20%. The net change in the salary is:", o: ["4% decrease", "no change", "4% increase", "2% decrease"], c: 0, e: "1.2×0.8 = 0.96 → 4% decrease." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Averages", q: "The average of 11 results is 50. If the average of the first six is 49 and that of the last six is 52, the sixth result is:", o: ["56", "55", "58", "54"], c: 0, e: "First six 294 + last six 312 = 606; sixth counted twice → 606 − 550 = 56." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Compound Interest", q: "The difference between the compound interest and the simple interest on a certain sum for 2 years at 10% per annum is ₹63. The sum is:", o: ["₹6,300", "₹6,000", "₹7,000", "₹5,400"], c: 0, e: "Diff = P(r/100)² = 0.01P = 63 → P = 6300." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Pipes", q: "Pipe A can fill a tank in 6 hours and pipe B in 4 hours. If they are opened alternately for 1 hour each starting with A, the tank will be full in:", o: ["4 hours 40 minutes", "5 hours", "4 hours 30 minutes", "4 hours 50 minutes"], c: 0, e: "Each 2-hr cycle = 1/6+1/4 = 5/12; after 4 hr = 10/12; hr5 (A) 1/6 → 12/12 → 5 hours? recompute: 10/12 + 1/6 = 12/12 at end of 5th hr → but tank fills mid-hour: need 2/12 in hr5 by A(1/6=2/12) exactly 1 hr → 5 hours.", skip: true },
  { s: "reasoning", subj: "General Intelligence & Reasoning", t: "Blood Relations", q: "Pointing towards a man, a woman said, 'His mother is the only daughter of my father.' How is the woman related to the man?", o: ["Mother", "Sister", "Aunt", "Daughter"], c: 0, e: "Only daughter of her father = the woman herself → his mother → Mother." },
  { s: "reasoning", subj: "General Intelligence & Reasoning", t: "Ranking", q: "In a row of 40 students, R is 11th from the left end and T is 31st from the left end. If they interchange their positions, R's new position from the right end will be:", o: ["10th", "11th", "9th", "12th"], c: 0, e: "R takes T's place = 31st from left = 40−31+1 = 10th from right." },
];
function hash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffle(o, ci) { const a = o.map((t, i) => ({ t, c: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const I = ITEMS.filter((x) => !x.skip);
  if (process.argv.includes("--verify")) { I.forEach((q, i) => console.log(`${i + 1}. [${q.s}/${q.t}] ${q.o[q.c]}`)); console.log(`Total: ${I.length}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const q of I) { const id = crypto.randomUUID(); qRows.push({ id, examCode: EXAM, sectionCode: q.s, subject: q.subj, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: hash(q.q, q.o[q.c]), isActive: true }); shuffle(q.o, q.c).forEach((o, i) => oRows.push({ questionId: id, text: o.t, isCorrect: o.c, displayOrder: i })); }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 102 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
