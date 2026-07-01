// Tricky batch #95 — BRUTAL 4+ line scenarios. Hand-verified. EXPERT.
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
  { t: "Partnership (timed)", q: "A and B enter into a partnership. A invests ₹16,000 for the whole year. B invests ₹12,000 initially and after 8 months withdraws ₹4,000. At the end of the year the total profit is ₹5,720. B's share of the profit is:", o: ["₹2,200", "₹2,400", "₹2,000", "₹2,520"], c: 0, e: "A=16000×12=192000; B=12000×8+8000×4=96000+32000=128000 → 192000:128000=3:2 → B=2/5×5720=2288 ≈ nearest given uses ratio 3:2.2? Use exact: A=192, B=128 → B share=128/320×5720=2288.", skip: true },
  { t: "Time & Work (efficiency)", q: "A is 50% more efficient than B, and B is 50% more efficient than C. If C alone takes 27 days to complete a piece of work, then A and C working together will finish it in:", o: ["≈10.8 days", "12 days", "9 days", "15 days"], c: 0, e: "C=1/27; B=1.5C; A=1.5B=2.25C → A=2.25/27=1/12; A+C=1/12+1/27=(9+4)/108=13/108 → ≈8.3? recompute below", skip: true },
  { t: "Boats (round trip)", q: "A man rows to a place 48 km away and comes back. He finds that he can row 4 km downstream in the same time as 3 km upstream. If his total rowing time is 14 hours, the speed of the stream (km/h) is:", o: ["1", "2", "1.5", "0.5"], c: 0, e: "Down:up speed = 4:3 → let down=4k,up=3k. 48/4k+48/3k=14 → 12/k+16/k=14 → 28/k=14 → k=2 → down=8,up=6 → stream=(8−6)/2=1." },
  { t: "Percentage (exam)", q: "In an examination a candidate must secure 40% marks to pass. A student got 250 marks and failed by 38 marks. The maximum marks of the examination are:", o: ["720", "700", "750", "680"], c: 0, e: "Pass mark = 250+38 = 288 = 40% → max = 288/0.4 = 720." },
  { t: "CI (annual)", q: "A sum of ₹12,000 amounts to ₹13,230 in 2 years at compound interest, compounded annually. The annual rate of interest is:", o: ["5%", "6%", "4.5%", "5.5%"], c: 0, e: "(1+r)²=13230/12000=1.1025=(1.05)² → r=5%." },
];
const REASON = [
  { t: "Syllogism (either-or)", q: "Statements: Some rings are bangles. All bangles are gold. Conclusions: I. Some rings are gold. II. Some bangles are rings. Which conclusion(s) follow?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "Rings that are bangles are gold → I; conversion of 'some rings are bangles' → some bangles are rings → II." },
  { t: "Direction (turns)", q: "Starting from home, Priya walks 3 km North, turns East and walks 4 km, turns North and walks 5 km, then turns West and walks 4 km. Her straight-line distance from home is:", o: ["8 km", "10 km", "6 km", "12 km"], c: 0, e: "Net North 3+5=8, East 4−4=0 → 8 km." },
  { t: "Number Series (wrong term)", q: "In the sequence 2, 6, 12, 20, 30, 44, 56 one number does not fit the pattern. The number that does not belong is:", o: ["44", "30", "20", "56"], c: 0, e: "n(n+1): 2,6,12,20,30,42,56 → 44 should be 42, so 44 is wrong." },
  { t: "Blood Relations", q: "P is the only brother of Q. Q is the mother of R. S is the father of P. How is S related to R?", o: ["Grandfather", "Father", "Uncle", "Brother"], c: 0, e: "S is father of P & Q (siblings); Q is R's mother → S is R's grandfather." },
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
  console.log(`Batch 95 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
