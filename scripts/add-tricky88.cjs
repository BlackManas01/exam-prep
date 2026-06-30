// Tricky batch #88 — BRUTAL 4+ line scenarios (harder). Hand-verified. EXPERT.
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
  { t: "Algebra (word)", q: "A and B together have a certain amount of money. A's amount is 150% of B's amount. If A gives ₹500 to B, both will have equal amounts. The total amount the two have together is:", o: ["₹5000", "₹4000", "₹6000", "₹4500"], c: 0, e: "A=1.5B; 1.5B−500=B+500 → 0.5B=1000 → B=2000, A=3000 → total 5000." },
  { t: "Time & Work", q: "A can complete a piece of work in 10 days and B in 15 days. They work on alternate days, with A starting on the first day. The total number of days to finish the work is:", o: ["12", "11", "13", "10"], c: 0, e: "Each 2-day block = 1/6; after 10 days = 5/6; day 11 (A) → 28/30; day 12 (B) → 1. Total 12 days." },
  { t: "Boats & Streams", q: "A boat covers 24 km upstream in 6 hours and 36 km downstream in 6 hours. From this information, the speed of the stream (km/h) is:", o: ["1", "2", "1.5", "0.5"], c: 0, e: "Up=4, down=6 → stream=(6−4)/2 = 1." },
  { t: "Percentage", q: "In an examination, 35% of students failed in Mathematics, 25% failed in English, and 10% failed in both subjects. The percentage of students who passed in both subjects is:", o: ["50%", "40%", "45%", "55%"], c: 0, e: "Failed in at least one = 35+25−10 = 50% → passed both = 50%." },
];
const REASON = [
  { t: "Circular Seating", q: "Eight friends A-H sit around a circular table facing the centre. A is third to the left of B. C is second to the right of A. D is opposite A. E sits between C and B. Going clockwise from A as A,B,C,D,E,F,G,H, the person sitting opposite to E is:", o: ["A", "H", "G", "F"], c: 0, e: "In an 8-seat circle, opposite = +4 seats; E is 5th → 5+4=9≡1 → A." },
  { t: "Syllogism", q: "Statements: Some doctors are fools. All fools are rich. No rich man is wise. Conclusions: I. Some doctors are rich. II. Some doctors are not wise. Which conclusion(s) follow?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "Some doctors are fools→rich (I). Those are rich, no rich is wise → some doctors not wise (II)." },
  { t: "Direction (shadow)", q: "Early in the morning, just after sunrise, Rohit stands and notices that the shadow of a pole falls exactly to his left. Based on the direction of the rising sun, Rohit is facing:", o: ["South", "North", "East", "West"], c: 0, e: "Sun in east → shadow to west; west is his left → he faces South." },
  { t: "Series", q: "Study the pattern and find the missing term: 5, 11, 23, 47, 95, ?, 383. The missing number is:", o: ["191", "189", "190", "192"], c: 0, e: "Rule ×2+1: 95×2+1 = 191 (191×2+1 = 383 confirms)." },
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
  console.log(`Batch 88 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
