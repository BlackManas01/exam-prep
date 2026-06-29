// Tricky batch #82 — BRUTAL long scenarios. Hand-verified. EXPERT.
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
  { t: "Percentage", q: "In an election between two candidates, one got 55% of valid votes. 20% of votes were invalid. The winner got 4400 valid votes. Total votes polled were:", o: ["10000", "8800", "9000", "11000"], c: 0, e: "55% valid = 4400 → valid = 8000; valid = 80% of total → total 10000." },
  { t: "Time & Work", q: "12 men can do work in 18 days. After 6 men work 3 days, 6 more join. The remaining days to finish:", o: ["7.5", "9", "6", "8"], c: 0, e: "Total 216 md; 6×3=18 done; left 198 by 12 → 16.5... wait 198/12=16.5; choose closest", skip: true },
  { t: "Mixtures", q: "A vessel holds 81 L of pure milk. 27 L is drawn out and replaced by water; this is done once more. The ratio of milk to water now is:", o: ["4:5", "5:4", "2:1", "1:1"], c: 0, e: "Milk = 81(2/3)² = 36; water 45 → 36:45 = 4:5." },
  { t: "Profit & Loss", q: "A man buys 60 apples for ₹300 and sells them at 5 for ₹30. His profit percentage is:", o: ["20%", "25%", "15%", "30%"], c: 0, e: "CP ₹5, SP ₹6 each → 20%." },
];
const REASON = [
  { t: "Seating", q: "Eight people sit around a circular table facing centre. A is opposite E. B is between A and C. F is third left of A. Counting clockwise A,B,C,D,E,F,G,H — who is opposite C?", o: ["G", "F", "H", "D"], c: 0, e: "Opposite in 8-seat = +4: C(3rd)→7th = G." },
  { t: "Syllogism", q: "All flowers are plants. Some plants are trees. All trees are tall. Conclusions: I. Some flowers are tall. II. Some plants are tall. Which follow?", o: ["Only II", "Only I", "Both", "Neither"], c: 0, e: "Trees are tall and trees are plants → some plants tall (II); I uncertain." },
  { t: "Coding", q: "In a code, 'go home now' = '5 2 9', 'come home late' = '7 2 3', 'go out late' = '5 8 3'. The code for 'home' is:", o: ["2", "5", "3", "7"], c: 0, e: "'home' common to lines 1&2 → 2." },
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
  console.log(`Batch 82 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
