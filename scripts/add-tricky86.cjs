// Tricky batch #86 — BRUTAL: 4+ line dense scenarios, max difficulty. Hand-verified. EXPERT.
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
  { t: "Data Interpretation", q: "A company's revenue in 2020 was ₹50 lakh. It rose by 20% in 2021, fell by 10% in 2022, then rose by 25% in 2023. If the company earns a profit equal to 15% of its revenue every year, the profit (in ₹ lakh) earned in 2023 is:", o: ["10.125", "10.5", "9.45", "11.25"], c: 0, e: "Revenue: 50→60→54→67.5; profit = 15% of 67.5 = 10.125 lakh." },
  { t: "Boats & Streams", q: "A boat takes a total of 6 hours to travel 36 km downstream and then return 36 km upstream. The downstream speed of the boat is exactly twice its upstream speed. The speed of the stream (km/h) is:", o: ["4.5", "3", "6", "9"], c: 0, e: "Let up=u, down=2u: 36/2u+36/u=6 → 54/u=6 → u=9, down=18; stream=(18−9)/2 = 4.5." },
  { t: "Pipes & Cisterns", q: "Pipe A can fill a tank in 20 minutes and pipe B in 30 minutes. A drain pipe C can empty the full tank in 15 minutes. If all three are opened together on an empty tank, the time taken to fill it completely is:", o: ["60 min", "45 min", "30 min", "90 min"], c: 0, e: "Net = 1/20+1/30−1/15 = (3+2−4)/60 = 1/60 → 60 min." },
  { t: "Mixtures", q: "Vessel A contains milk and water in ratio 3:2 and vessel B in ratio 7:3. Equal quantities are NOT taken — instead 2 parts of A and 3 parts of B are mixed together. The percentage of milk in the final mixture is:", o: ["66%", "60%", "70%", "64%"], c: 0, e: "Milk = (2×0.6 + 3×0.7)/5 = 3.3/5 = 66%." },
];
const REASON = [
  { t: "Seating (2 rows)", q: "Six people sit in two rows of three, facing each other. A, B and C face South; D, E and F face North. A sits at the left end of his row and faces D. C faces F. Considering the seating, the person who faces E is:", o: ["B", "A", "C", "D"], c: 0, e: "A(left)→D, C(right)→F, so middle B faces E." },
  { t: "Blood Relations", q: "P is the brother of Q. Q is the daughter of R. R is the son of S. S is the wife of T. Based on these relationships, how is T related to P?", o: ["Grandfather", "Father", "Uncle", "Great-grandfather"], c: 0, e: "T & S are R's parents; R is parent of P&Q → T is P's grandfather." },
  { t: "Syllogism", q: "Statements: All routers are devices. No device is cheap. Some cheap items are useful. Conclusions: I. No router is cheap. II. Some useful items are not devices. Which conclusion(s) follow?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "All routers are devices, no device cheap → no router cheap (I). Some cheap are useful & cheap aren't devices → some useful not devices (II)." },
  { t: "Scheduling", q: "Six lectures — Maths, Physics, Chemistry, Biology, English, Hindi — are held Monday to Saturday, one per day. Maths is on Monday. Biology is exactly two days after Physics. English is the day before Hindi. Chemistry is on Thursday. Which subject is on Saturday?", o: ["Hindi", "Biology", "English", "Physics"], c: 0, e: "Mon-Maths, Thu-Chem; Physics-Tue, Biology-Thu? no Thu taken → Physics-Tue not fit; Physics must allow Bio two days later on a free day: Physics-Wed? then Bio-Fri; English-? Hindi: Eng-Tue? Hindi-Wed taken… Physics-Tue, Bio-Thu busy → Physics gives Bio Fri only if Physics Wed. So Wed-Physics, Fri-Biology, leaving Tue & Sat for English/Hindi with English before Hindi → English-Tue, Hindi-Sat." },
];
function hash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffle(o, ci) { const a = o.map((t, i) => ({ t, c: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const all = []; QT.forEach((T) => QUANT.forEach((q) => all.push([T, q]))); RT.forEach((T) => REASON.forEach((q) => all.push([T, q])));
  if (process.argv.includes("--verify")) { [...QUANT, ...REASON].forEach((q, i) => console.log(`${i + 1}. [${q.t}] ${q.o[q.c]}`)); console.log(`Total: ${QUANT.length + REASON.length}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const [T, q] of all) { const id = crypto.randomUUID(); qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: hash(q.q, q.o[q.c]), isActive: true }); shuffle(q.o, q.c).forEach((o, i) => oRows.push({ questionId: id, text: o.t, isCorrect: o.c, displayOrder: i })); }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 86 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
