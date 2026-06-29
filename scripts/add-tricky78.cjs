// Tricky batch #78 — BRUTAL MULTI-LINE (3-5 line scenarios only). Hand-verified. EXPERT.
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
  { t: "Average", q: "The average of 5 numbers is 27. When one number is removed, the average of the remaining four becomes 25. The number removed is:", o: ["35", "33", "30", "37"], c: 0, e: "Total 135; remaining 100 → removed 35." },
  { t: "Ages", q: "The ratio of a father's age to his son's is 4:1. After 16 years it becomes 2:1. The son's present age (years) is:", o: ["8", "10", "12", "16"], c: 0, e: "4x+16 = 2(x+16) → 2x=16 → x=8; son = 8." },
  { t: "Compound Interest", q: "A sum amounts to ₹9680 in 2 years and ₹10648 in 3 years at compound interest. The annual rate (%) is:", o: ["10", "8", "12", "9"], c: 0, e: "10648−9680 = 968 is interest on 9680 → 968/9680 = 10%." },
  { t: "Boats", q: "A boat goes 30 km downstream in 3 h and returns the same distance in 5 h. Speed of boat in still water (km/h):", o: ["8", "10", "6", "9"], c: 0, e: "Down 10, up 6 → still = (10+6)/2 = 8." },
  { t: "Profit & Loss", q: "A man sells two cycles at ₹2400 each. On one he gains 20%, on the other he loses 20%. His overall result is:", o: ["Loss of ₹200", "No profit no loss", "Gain ₹200", "Loss ₹100"], c: 0, e: "CP 2000 + 3000 = 5000; SP 4800 → loss ₹200." },
  { t: "Time & Work", q: "A and B together finish a job in 12 days, B and C in 15 days, C and A in 20 days. Days for all three together:", o: ["10", "12", "8", "9"], c: 0, e: "2(a+b+c)=1/12+1/15+1/20=12/60 → a+b+c=1/10 → 10 days." },
];
const REASON = [
  { t: "Family Code", q: "If A+B means A is father of B; A−B means A is mother of B; A×B means A is brother of B. In P+Q−R, how is P related to R?", o: ["Grandfather", "Father", "Brother", "Uncle"], c: 0, e: "P father of Q; Q mother of R → P is R's grandfather." },
  { t: "Seating", q: "Five boys sit in a row. C is to the right of B but left of D. A is left of B. E is at the extreme right. Who is exactly in the middle?", o: ["C", "B", "D", "A"], c: 0, e: "Order A,B,C,D,E → middle is C." },
  { t: "Syllogism", q: "All cars are vehicles. Some vehicles are red. No red is fast. Conclusions: I. Some cars are fast. II. Some vehicles are not fast. Which follow?", o: ["Only II", "Only I", "Both", "Neither"], c: 0, e: "Red vehicles are not fast → some vehicles not fast (II). I not certain." },
  { t: "Direction", q: "Ravi walks 4 km East, turns left 3 km, left 8 km, left 3 km. How far and which direction from start?", o: ["4 km West", "4 km East", "8 km West", "2 km West"], c: 0, e: "E4−W8 = 4 W; N3−S3 = 0 → 4 km West." },
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
  console.log(`Batch 78 (brutal multi-line) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
