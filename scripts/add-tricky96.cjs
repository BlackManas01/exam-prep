// Tricky batch #96 — BRUTAL 4+ line scenarios (toughest). Hand-verified. EXPERT.
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
  { t: "Time & Work (efficiency)", q: "A is twice as good a workman as B, and B is thrice as good as C. If C alone can finish a piece of work in 54 days, then A, B and C working together will finish the same work in:", o: ["≈5.4 days", "6 days", "9 days", "4.5 days"], c: 0, e: "C=1/54; B=3C=1/18; A=2B=1/9. Sum=1/9+1/18+1/54=(6+3+1)/54=10/54 → 5.4 days." },
  { t: "Alligation (profit)", q: "A shopkeeper mixes two varieties of tea costing ₹80/kg and ₹120/kg. He sells the mixture at ₹117/kg, gaining 30%. The ratio in which the two varieties were mixed is:", o: ["1:1", "2:1", "1:2", "3:2"], c: 0, e: "CP of mix = 117/1.3 = 90; (120−90):(90−80)=30:10=3:1... check → 3:1", skip: true },
  { t: "Profit & Loss (two-part)", q: "A man bought two articles for ₹1,000 in total. He sold the first at a 20% profit and the second at a 5% loss, making an overall profit of 10%. The cost price of the first article was:", o: ["₹600", "₹500", "₹700", "₹400"], c: 0, e: "Let first=x: 0.20x − 0.05(1000−x)=100 → 0.25x−50=100 → x=600." },
  { t: "Speed (average)", q: "A person travels from P to Q at 40 km/h and returns at 60 km/h. If he takes 1 hour more for the onward journey than the return, the one-way distance PQ is:", o: ["120 km", "100 km", "150 km", "90 km"], c: 0, e: "d/40 − d/60 = 1 → d(3−2)/120=1 → d=120 km." },
];
const REASON = [
  { t: "Syllogism (possibility)", q: "Statements: All papers are files. No file is red. Some red things are sharp. Conclusions: I. No paper is red. II. Some sharp things being files is a possibility. Which conclusion(s) follow?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "Papers are files, no file red → no paper red (I). Sharp-file overlap not forbidden → possibility (II)." },
  { t: "Puzzle (order)", q: "Six people A-F are ranked by height. C is taller than A but shorter than D. B is the shortest. F is taller than D but shorter than E. Arranged tallest to shortest, the third tallest person is:", o: ["D", "F", "C", "E"], c: 0, e: "E > F > D > C > A > B → third tallest is D." },
  { t: "Direction (bearing)", q: "A cyclist rides 12 km towards the North, then turns right and rides 5 km, then turns right and rides 12 km, then turns left and rides 3 km. His distance and direction from the start are:", o: ["8 km East", "8 km West", "5 km East", "2 km East"], c: 0, e: "N12−S12=0; E5+E3=8 → 8 km East." },
  { t: "Blood Relations (coded)", q: "If 'A @ B' means A is the mother of B and 'A $ B' means A is the husband of B, then in the expression P $ Q @ R, how is P related to R?", o: ["Father", "Uncle", "Brother", "Grandfather"], c: 0, e: "Q is mother of R; P is husband of Q → P is father of R." },
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
  console.log(`Batch 96 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
