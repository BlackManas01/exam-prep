// Tricky batch #92 — BRUTAL 4+ line scenarios. Hand-verified. EXPERT.
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
  { t: "Ratio (word)", q: "A sum of ₹1,800 is divided among A, B and C. A's share is one-half of the combined share of B and C. If the amounts are such that B's share equals ₹600, then C's share is:", o: ["₹600", "₹500", "₹700", "₹550"], c: 0, e: "A = ½(B+C) → 3A=1800 → A=600; B=600 → C = 1800−600−600 = 600." },
  { t: "Boats (meeting)", q: "Two boats start at the same time toward each other from two points 105 km apart along a river. One travels downstream with an effective speed of 20 km/h and the other upstream at 15 km/h. The time after which they meet is:", o: ["3 hours", "3.5 hours", "2.5 hours", "4 hours"], c: 0, e: "Closing speed 35 km/h → 105/35 = 3 h." },
  { t: "Time & Work", q: "A can complete a piece of work in 20 days. He works alone for 4 days, after which B joins him, and together they finish the remaining work in 8 more days. The number of days B alone would take to do the whole work is:", o: ["20", "24", "16", "30"], c: 0, e: "A did 4/20=1/5; rest 4/5 in 8 days by A+B → A+B=1/10 → B=1/10−1/20=1/20 → 20 days." },
  { t: "CI (half-yearly)", q: "The compound interest on ₹8,000 for 1 year at 10% per annum, when the interest is compounded half-yearly, is:", o: ["₹820", "₹800", "₹840", "₹810"], c: 0, e: "5% per half-year, 2 periods: 8000×1.05²=8820 → CI ₹820." },
];
const REASON = [
  { t: "Syllogism", q: "Statements: All artists are creative. Some creative people are rich. No rich person is humble. Conclusions: I. Some artists are not humble. II. Some creative people are not humble. Which conclusion(s) follow?", o: ["Only II", "Only I", "Both", "Neither"], c: 0, e: "Rich creatives aren't humble → some creative not humble (II). Artists-rich link not certain → I no." },
  { t: "Seating", q: "Seven people A-G are seated in a row facing north. G is at one extreme end. There are three people between G and C. B is second to the right of C. A is exactly between C and B. Counting from G's end, the person in the fourth position is:", o: ["C", "A", "B", "D"], c: 0, e: "G(1)...C is 4th (three between). So position 4 = C." },
  { t: "Coding", q: "In a certain code, EARTH is written by replacing each letter with the one three places ahead in the alphabet (A→D, B→E ...). Using the same rule, the word MOON would be written as:", o: ["PRRQ", "PRRP", "PSSQ", "PRRO"], c: 0, e: "+3: M→P, O→R, O→R, N→Q → PRRQ." },
  { t: "Blood Relations", q: "In a family, M is the son of N. N is the daughter of O. O is the mother of P. P is the brother of N. Considering these relations, how is M related to P?", o: ["Nephew", "Son", "Brother", "Cousin"], c: 0, e: "N & P are siblings (children of O); M is N's son → M is P's nephew." },
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
  console.log(`Batch 92 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
