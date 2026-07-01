// Batch #103 — SSC CGL PYQ-LEVEL, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1";
const ITEMS = [
  { s: "quant", subj: "Quantitative Aptitude", t: "Algebra", q: "If a + b + c = 6 and a² + b² + c² = 14, then the value of ab + bc + ca is:", o: ["11", "10", "12", "8"], c: 0, e: "(a+b+c)² = a²+b²+c² + 2(ab+bc+ca) → 36 = 14 + 2S → S = 11." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Trigonometry", q: "If sinθ + cosecθ = 2, then the value of sin⁷θ + cosec⁷θ is:", o: ["2", "1", "128", "7"], c: 0, e: "sinθ+cosecθ=2 → sinθ=1 → 1⁷+1⁷ = 2." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Mensuration", q: "The radii of two circles are 8 cm and 6 cm. The radius of a circle whose area equals the sum of the areas of these two circles is:", o: ["10 cm", "12 cm", "14 cm", "9 cm"], c: 0, e: "r² = 64+36 = 100 → r = 10 cm." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Time & Work", q: "A and B can do a work in 8 days, B and C in 12 days, and A and C in 8 days. Working together, A, B and C will complete the work in:", o: ["6 days", "8 days", "5 days", "7 days"], c: 0, e: "2(a+b+c)=1/8+1/12+1/8=1/3 → a+b+c=1/6 → 6 days." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Percentage", q: "In an examination 42% students failed in Hindi and 52% failed in English. If 17% failed in both subjects, the percentage of students who passed in both subjects is:", o: ["23%", "20%", "25%", "27%"], c: 0, e: "Failed in at least one = 42+52−17 = 77% → passed both = 23%." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Profit & Loss", q: "A man buys oranges at 6 for ₹10 and sells them at 4 for ₹10. His profit percentage is:", o: ["50%", "40%", "45%", "60%"], c: 0, e: "CP/orange = 10/6, SP = 10/4 → gain = (2.5−1.667)/1.667 = 50%." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Simple Interest", q: "A sum of ₹1,200 amounts to ₹1,632 in 4 years at simple interest. If the rate of interest is increased by 2%, the amount will become:", o: ["₹1,728", "₹1,700", "₹1,650", "₹1,760"], c: 0, e: "SI=432 → rate=9%; +2%=11% → new SI=1200×11×4/100=528 → amount 1728." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Speed", q: "A train 150 m long passes a platform 350 m long in 20 seconds. The speed of the train in km/h is:", o: ["90", "72", "60", "108"], c: 0, e: "500/20 = 25 m/s = 90 km/h." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Ratio", q: "The monthly incomes of A and B are in the ratio 5 : 4 and their expenditures are in the ratio 7 : 5. If each saves ₹3,000 per month, then A's monthly income is:", o: ["₹10,000", "₹9,000", "₹12,000", "₹8,000"], c: 0, e: "5x−7y=3000, 4x−5y=3000 → solve x=2000 → A=5x=10000." },
  { s: "reasoning", subj: "General Intelligence & Reasoning", t: "Syllogism", q: "Statements: Some books are novels. All novels are stories. No story is boring. Conclusions: I. Some books are stories. II. Some novels are not boring. Which conclusion(s) follow?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "Book-novels are stories → I. Novels are stories, no story boring → some novels not boring → II." },
  { s: "reasoning", subj: "General Intelligence & Reasoning", t: "Direction", q: "Ravi starts from his house, walks 3 km North, turns East and walks 4 km, then turns South and walks 6 km. How far is he from his house and in which direction?", o: ["5 km South-East", "5 km North-East", "3 km East", "7 km South"], c: 0, e: "Net South 3, East 4 → √(9+16)=5 km, South-East." },
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
  console.log(`Batch 103 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
