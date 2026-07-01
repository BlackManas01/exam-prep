// Batch #100 — SSC CGL PYQ-LEVEL, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1";
const ITEMS = [
  { s: "quant", subj: "Quantitative Aptitude", t: "Boats & Streams", q: "A boat covers 30 km downstream in 3 hours. If the speed of the boat in still water is 8 km/h, the time it will take to cover the same 30 km upstream is:", o: ["5 hours", "4 hours", "6 hours", "4.5 hours"], c: 0, e: "Down 10 → stream 2 → up 6 → 30/6 = 5 h." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Profit & Loss", q: "A man sells two articles for ₹99 each. On one he gains 10% and on the other he loses 10%. His overall result on the whole transaction is:", o: ["Loss of ₹2", "No profit no loss", "Gain of ₹2", "Loss of ₹1"], c: 0, e: "CP = 90 + 110 = 200; SP = 198 → loss ₹2." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Remainders", q: "A number when divided by 899 leaves a remainder 63. What remainder will be obtained when the same number is divided by 29?", o: ["5", "3", "7", "63"], c: 0, e: "899 = 29×31; 63 = 29×2 + 5 → remainder 5." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Successive Discount", q: "Three successive discounts of 10%, 20% and 25% are equivalent to a single discount of:", o: ["46%", "45%", "50%", "55%"], c: 0, e: "1 − 0.9×0.8×0.75 = 1 − 0.54 = 0.46 → 46%." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Mixtures", q: "A vessel contains 40 litres of a mixture of milk and water in the ratio 5 : 3. The quantity of water to be added so that the ratio of milk to water becomes 5 : 4 is:", o: ["5 litres", "4 litres", "8 litres", "6 litres"], c: 0, e: "Milk 25, water 15; for 5:4 water = 20 → add 5 L." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Ages", q: "The sum of the present ages of a father and his son is 60 years. Five years ago, the father's age was four times the age of the son at that time. The present age of the son is:", o: ["15 years", "12 years", "18 years", "20 years"], c: 0, e: "F+S=60; F−5=4(S−5) → 5S=75 → S=15." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Trains", q: "A train running at a speed of 108 km/h crosses a pole in 8 seconds. The length of the train is:", o: ["240 m", "216 m", "270 m", "300 m"], c: 0, e: "108 km/h = 30 m/s → 30×8 = 240 m." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Algebra", q: "If x = 2 + √3, then the value of x + 1/x is:", o: ["4", "2√3", "2", "4√3"], c: 0, e: "1/x = 2 − √3 → x + 1/x = 4." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Profit & Loss", q: "By selling an article for ₹600, a shopkeeper earns a profit of 20%. The price at which he should sell it so as to earn a profit of only 10% is:", o: ["₹550", "₹540", "₹560", "₹500"], c: 0, e: "CP = 600/1.2 = 500; for 10% profit SP = 550." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Percentage", q: "In an election between two candidates, the winner secured 56% of the total valid votes and won by a margin of 1,440 votes. The total number of valid votes polled was:", o: ["12,000", "10,000", "14,400", "11,000"], c: 0, e: "Margin = 56−44 = 12% = 1440 → total = 12000." },
  { s: "reasoning", subj: "General Intelligence & Reasoning", t: "Direction", q: "A man walks 5 km towards the South, then turns left and walks 3 km, then turns left again and walks 5 km, and finally turns right and walks 2 km. His straight-line distance and direction from the starting point are:", o: ["5 km East", "5 km North", "3 km East", "2 km East"], c: 0, e: "S5,E3,N5,E2 → N/S cancel, East 5 → 5 km East." },
  { s: "reasoning", subj: "General Intelligence & Reasoning", t: "Number Series", q: "In the following series, identify the term that does NOT fit the pattern: 5, 11, 24, 51, 106, 218. The wrong term is:", o: ["218", "106", "51", "24"], c: 0, e: "×2+1, ×2+2, ×2+3, ×2+4, ×2+5: 106×2+5 = 217 (not 218) → 218 is wrong." },
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
  console.log(`Batch 100 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
