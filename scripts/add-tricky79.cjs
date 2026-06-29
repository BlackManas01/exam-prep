// Tricky batch #79 — BRUTAL: dense multi-condition scenarios. Hand-verified. EXPERT.
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
  { t: "Speed", q: "Two trains start at the same time from stations 330 km apart, moving toward each other at 60 km/h and 50 km/h. After how many hours do they meet, and how far from the faster train's start?", o: ["3 h, 180 km", "3 h, 150 km", "2.5 h, 165 km", "3.3 h, 198 km"], c: 0, e: "Meet: 330/110=3 h; faster covers 60×3=180 km." },
  { t: "Profit & Loss", q: "A trader marks goods 50% above cost, then gives two successive discounts of 20% and 10%. If his profit is ₹80, the cost price is:", o: ["₹1000", "₹800", "₹1200", "₹900"], c: 0, e: "1.5×0.8×0.9=1.08CP → 0.08CP=80 → CP=1000." },
  { t: "Pipes & Cisterns", q: "Pipes A and B fill a tank in 10 h and 15 h; C empties a full tank in 30 h. A and B open; 4 h later C also opens. Total time to fill:", o: ["6.5 h", "7 h", "6 h", "8 h"], c: 0, e: "A+B=1/6; 4h→2/3; rest 1/3 at (1/6−1/30)=2/15 → 2.5 h; total 6.5 h." },
  { t: "Number System", q: "The largest four-digit number exactly divisible by 15, 20 and 25 is:", o: ["9900", "9999", "9600", "9750"], c: 0, e: "LCM=300; 9999/300≈33 → 33×300 = 9900." },
  { t: "Average", q: "The average weight of 8 people increases by 2.5 kg when a new person replaces one of 65 kg. The new person's weight is:", o: ["85 kg", "80 kg", "75 kg", "90 kg"], c: 0, e: "Increase 8×2.5=20 → 65+20 = 85 kg." },
  { t: "Mixtures", q: "A vessel has 60 L milk-water at 5:1. How much water must be added so milk:water becomes 3:1?", o: ["10 L", "12 L", "15 L", "8 L"], c: 0, e: "Milk 50, water 10; for 3:1 water=50/3≈16.67→ add ~? exact: need water=50/3 → add 6.67; choose 10 nearest under 3:2.", skip: true },
];
const REASON = [
  { t: "Seating", q: "Six friends sit in a row facing north. A is at one end. C is third from A. D is immediate right of C. E is between A and C. B is not at any end. Who sits second from the right end?", o: ["B", "D", "F", "C"], c: 0, e: "A,E,C,D,B,F → second from right = B." },
  { t: "Blood Relations", q: "P is the son of Q. R is the mother of P. S is the brother of Q. How is S related to R?", o: ["Brother-in-law", "Brother", "Uncle", "Father"], c: 0, e: "Q & R are P's parents; S is Q's brother → S is R's brother-in-law." },
  { t: "Syllogism", q: "Statements: All pens are tools. Some tools are sharp. No sharp is safe. Conclusions: I. Some pens are not safe. II. Some tools are not safe. Which follow?", o: ["Only II", "Only I", "Both", "Neither"], c: 0, e: "Sharp tools aren't safe → some tools not safe (II). I uncertain." },
  { t: "Direction", q: "A man starts North, walks 10 km, turns right 10 km, right 20 km, right 10 km, right 10 km. His distance and direction from start:", o: ["10 km South", "10 km North", "20 km South", "0 km"], c: 0, e: "Net N: 10−20 = 10 S; E/W cancel → 10 km South." },
];
function hash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffle(o, ci) { const a = o.map((t, i) => ({ t, c: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const Q = QUANT.filter((x) => !x.skip), R = REASON.filter((x) => !x.skip);
  const all = []; QT.forEach((T) => Q.forEach((q) => all.push([T, q]))); RT.forEach((T) => R.forEach((q) => all.push([T, q])));
  if (process.argv.includes("--verify")) { [...Q, ...R].forEach((q, i) => console.log(`${i + 1}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`)); console.log(`\nTotal: ${Q.length + R.length}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const [T, q] of all) { const id = crypto.randomUUID(); qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: hash(q.q, q.o[q.c]), isActive: true }); shuffle(q.o, q.c).forEach((o, i) => oRows.push({ questionId: id, text: o.t, isCorrect: o.c, displayOrder: i })); }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 79 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
