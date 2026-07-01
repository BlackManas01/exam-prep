// Batch #99 — SSC CGL 2025 PYQ-LEVEL, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1";
const ITEMS = [
  { s: "quant", subj: "Quantitative Aptitude", t: "Compound Interest", q: "A certain sum of money invested at compound interest amounts to 4 times itself in 2 years. In how many years will the same sum amount to 16 times itself at the same rate of interest?", o: ["4", "8", "6", "3"], c: 0, e: "(1+r)²=4 → (1+r)=2; 16=2⁴ → 4 years." },
  { s: "quant", subj: "Quantitative Aptitude", t: "HCF & LCM", q: "The ratio of two numbers is 3 : 4 and their highest common factor (HCF) is 8. The least common multiple (LCM) of the two numbers is:", o: ["96", "84", "72", "108"], c: 0, e: "Numbers 24 & 32 → LCM = 96." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Discount", q: "A shopkeeper offers one article free on the purchase of every nine articles of the same kind. The effective percentage discount that a customer enjoys under this scheme is:", o: ["10%", "11.11%", "9%", "12%"], c: 0, e: "Buy 9, get 10 → discount = 1/10 = 10%." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Time & Work (men)", q: "If 20 men can build a wall 56 metres long in 6 days, then the number of men required to build a wall 70 metres long in 3 days is:", o: ["50", "45", "40", "60"], c: 0, e: "Men = (70×20×6)/(56×3) = 8400/168 = 50." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Number System", q: "The difference between two numbers is 1,365. When the larger number is divided by the smaller one, the quotient is 6 and the remainder is 15. The smaller number is:", o: ["270", "250", "300", "285"], c: 0, e: "L=6S+15, L−S=1365 → 5S+15=1365 → S=270." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Efficiency", q: "A alone can complete a piece of work in 18 days. B is 50% more efficient than A. The number of days B alone will take to complete the same work is:", o: ["12", "9", "27", "15"], c: 0, e: "B rate = 1.5×(1/18) = 1/12 → 12 days." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Percentage", q: "45% of a number is 90 more than 25% of the same number. The number is:", o: ["450", "400", "500", "360"], c: 0, e: "0.45x − 0.25x = 90 → 0.20x = 90 → x = 450." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Simple Interest", q: "The simple interest on a certain sum of money is 9/25 of the principal, and the number of years is numerically equal to the rate percent per annum. The rate percent per annum is:", o: ["6", "5", "7", "4"], c: 0, e: "9/25 P = P·R·R/100 → R² = 36 → R = 6." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Averages", q: "The average of six numbers is 8. If one of the numbers is removed, the average of the remaining five numbers becomes 7.5. The number that was removed is:", o: ["10.5", "9.5", "11", "8.5"], c: 0, e: "48 − 37.5 = 10.5." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Pipes & Cisterns", q: "Two pipes can fill a tank in 12 minutes and 16 minutes respectively, while a waste pipe can empty the full tank in 24 minutes. If all three are opened together, the time taken to fill the tank is:", o: ["9.6 min", "10 min", "8 min", "12 min"], c: 0, e: "1/12+1/16−1/24 = (4+3−2)/48 = 5/48 → 48/5 = 9.6 min." },
  { s: "reasoning", subj: "General Intelligence & Reasoning", t: "Blood Relations", q: "A is the brother of B. B is the son of C. C is the wife of D. D is the father of E. If E is the daughter of D, then how is A related to E?", o: ["Brother", "Cousin", "Uncle", "Father"], c: 0, e: "A & B are children of C & D; E is also D's daughter → A is E's brother." },
  { s: "reasoning", subj: "General Intelligence & Reasoning", t: "Syllogism", q: "Statements: All buses are vehicles. Some vehicles are old. No old thing is new. Conclusions: I. Some vehicles are not new. II. Some buses are old. Which conclusion(s) follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Old vehicles aren't new → some vehicles not new (I). II uncertain." },
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
  console.log(`Batch 99 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
