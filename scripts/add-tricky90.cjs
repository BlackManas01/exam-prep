// Tricky batch #90 — BRUTAL 4+ line scenarios (tougher). Hand-verified. EXPERT.
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
  { t: "Time, Speed & Distance", q: "A train leaves station X at 8:00 a.m. and reaches Y at 10:00 a.m. Another train leaves Y at 9:00 a.m. and reaches X at 11:30 a.m. The two stations are 300 km apart on a straight track. The time at which the two trains cross each other is approximately:", o: ["9:33 a.m.", "9:30 a.m.", "9:48 a.m.", "9:24 a.m."], c: 0, e: "Speeds 150 & 120 km/h. At 9:00 train1 is 150 km from X, 150 km gap; closing 270 km/h → 150/270 h ≈ 33 min → ≈9:33 a.m." },
  { t: "Work & Wages", q: "A and B can do a job in 12 days, B and C in 16 days. A works for 5 days, B for 7 days, and C finishes the remaining work in 13 days. The number of days in which C alone can do the whole work is:", o: ["24", "20", "30", "16"], c: 0, e: "Standard SSC result: C alone = 24 days." },
  { t: "Mixtures (replacement)", q: "A container is full of pure milk. 20% of the milk is replaced by water; from the mixture 20% is again replaced by water; this is done a third time. The percentage of milk finally left in the container is:", o: ["51.2%", "48.8%", "50%", "60%"], c: 0, e: "(0.8)³ = 0.512 → 51.2%." },
  { t: "Partnership", q: "Three partners A, B and C invest in a business. A invests ₹X for 12 months, B invests twice A's amount for 6 months, and C invests thrice A's amount for 4 months. The ratio in which the annual profit is divided among A, B and C is:", o: ["1:1:1", "1:2:3", "3:2:1", "2:1:1"], c: 0, e: "X·12 : 2X·6 : 3X·4 = 12:12:12 = 1:1:1." },
];
const REASON = [
  { t: "Syllogism (possibility)", q: "Statements: All stones are rocks. All rocks are hard. Some hard things are valuable. Conclusions: I. All stones are hard. II. Some stones being valuable is a possibility. Which conclusion(s) follow?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "Stones→rocks→hard so I; nothing forbids stones being valuable → II possible." },
  { t: "Blood Relations (coded)", q: "In a family, 'A # B' means A is the father of B, 'A & B' means A is the wife of B, and 'A % B' means A is the brother of B. Given P # Q & R % S, how is P related to S?", o: ["Father-in-law", "Father", "Grandfather", "Uncle"], c: 0, e: "P father of Q; Q wife of R; R brother of S → R is P's son-in-law and S is R's sibling → P is S's father-in-law? Q&R married; R%S → S is R's brother → P (Q's father) is S's father-in-law via... P is father-in-law of R and R's brother S → P is father-in-law to R only; to S, P is unrelated by marriage except as brother-in-law's father. Closest defined: Father-in-law (of the couple's side).", skip: true },
  { t: "Direction (net displacement)", q: "A person starts from point O and walks 10 m North, then 6 m East, then 4 m South, then 6 m West, then 6 m South. His straight-line distance from O is:", o: ["0 m", "2 m", "6 m", "10 m"], c: 0, e: "North 10−4−6 = 0; East 6−6 = 0 → back at O → 0 m." },
  { t: "Number Analogy", q: "In a certain pattern, 6 is related to 42 and 9 is related to 90 in the same way. Following the same rule, 12 is related to:", o: ["156", "144", "168", "150"], c: 0, e: "n(n+1): 6×7=42, 9×10=90 → 12×13 = 156." },
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
  console.log(`Batch 90 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
