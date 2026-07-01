// Tricky batch #98 — REAL SSC CGL 2025 PYQ-LEVEL, SINGLE EXAM (ssc-cgl-tier1). Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1";
const ITEMS = [
  { s: "quant", subj: "Quantitative Aptitude", t: "Profit & Discount", q: "A retailer keeps the price of an air conditioner 80% above its cost price. He offers a first discount of 25% on the marked price. During a festival offer, an additional discount of 10% is applied on the already-discounted price. If the final selling price is ₹15,552, the approximate cost price of the air conditioner is:", o: ["₹12,800", "₹9,000", "₹10,000", "₹9,200"], c: 0, e: "CP×1.80×0.75×0.90 = 1.215 CP = 15552 → CP = 12800." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Averages", q: "The average of 8 numbers is 21. If each of the numbers is first multiplied by 4 and then increased by 5, the new average of the resulting numbers is:", o: ["89", "84", "90", "85"], c: 0, e: "New average = 4×21 + 5 = 89." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Mixture & Profit", q: "A shopkeeper mixes 30 kg of rice costing ₹40 per kg with 20 kg of rice costing ₹60 per kg. If he sells the whole mixture at a profit of 25%, the selling price per kg of the mixture is:", o: ["₹60", "₹55", "₹58", "₹62"], c: 0, e: "Cost = (1200+1200)/50 = ₹48/kg; SP = 48×1.25 = ₹60." },
  { s: "quant", subj: "Quantitative Aptitude", t: "CI & SI", q: "The compound interest on a certain sum for 2 years at 10% per annum, compounded annually, is ₹1,050. The simple interest on the same sum for the same period and rate is:", o: ["₹1,000", "₹1,050", "₹950", "₹1,100"], c: 0, e: "CI factor for 2 yr at 10% = 0.21 → P = 1050/0.21 = 5000; SI = 5000×0.20 = ₹1,000." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Time & Work", q: "A can complete a piece of work in 15 days and B in 30 days. They begin the work together and work for 4 days, after which A leaves. The number of additional days B needs to finish the remaining work is:", o: ["18", "16", "20", "15"], c: 0, e: "4 days together = 4/15+4/30 = 2/5; remaining 3/5 by B (1/30) = 18 days." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Population", q: "The population of a village increases by 5% in the first year and again by 5% in the second year. If the present population is 44,100, the population two years ago was:", o: ["40,000", "42,000", "39,000", "41,000"], c: 0, e: "P×1.05² = 44100 → P = 44100/1.1025 = 40000." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Speed & Distance", q: "Two runners start together from the same point and run in opposite directions along a straight track at speeds of 5 km/h and 7 km/h respectively. The time after which the distance between them becomes 36 km is:", o: ["3 hours", "2.5 hours", "4 hours", "3.5 hours"], c: 0, e: "Combined separation speed = 12 km/h → 36/12 = 3 hours." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Successive Discount", q: "A dealer marks an article 50% above its cost price and allows two successive discounts of 20% and 10%. The overall profit or loss percentage on the article is:", o: ["8% profit", "8% loss", "10% profit", "no profit no loss"], c: 0, e: "1.50×0.80×0.90 = 1.08 → 8% profit." },
  { s: "general-intelligence", subj: "General Intelligence", t: "Blood Relations", q: "P is the mother of Q. Q is the sister of R. R is the son of S. S is the husband of P. Considering these relationships, how is R related to Q?", o: ["Brother", "Father", "Uncle", "Cousin"], c: 0, e: "P & S are parents of Q and R; R is son → R is Q's brother." },
  { s: "general-intelligence", subj: "General Intelligence", t: "Syllogism", q: "Statements: All phones are gadgets. Some gadgets are expensive. No expensive item is fragile. Conclusions: I. Some gadgets are not fragile. II. Some phones are expensive. Which conclusion(s) follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Expensive gadgets aren't fragile → some gadgets not fragile (I). II uncertain." },
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
  console.log(`Batch 98 (cgl-tier1, PYQ-level) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
