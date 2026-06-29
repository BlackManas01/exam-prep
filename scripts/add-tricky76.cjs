// Tricky batch #76 — BRUTAL QUANT (multi-step traps only). Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "ssc-chsl-tier1", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "ibps-po-prelims", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "maths", subject: "Mathematics" },
  { examCode: "ssc-cgl-tier2", sectionCode: "quant", subject: "Quantitative Aptitude" },
];
const ITEMS = [
  { t: "Simple Interest", d: "EXPERT", q: "A sum doubles itself in 8 years under simple interest. In how many years will it triple?", o: ["16", "12", "20", "24"], c: 0, e: "Doubling = 100% in 8 yr → 12.5%/yr; tripling = 200% → 200/12.5 = 16 yr." },
  { t: "Profit & Loss", d: "EXPERT", q: "A shopkeeper marks goods 40% above cost and allows a 10% discount. His net profit % is:", o: ["26%", "30%", "25%", "28%"], c: 0, e: "1.40 × 0.90 = 1.26 → 26% profit." },
  { t: "Average", d: "EXPERT", q: "Average age of 5 members rises by 2 years when a 30-yr-old is replaced. The new member's age is:", o: ["40", "38", "42", "36"], c: 0, e: "Total rises by 5×2=10 → new = 30+10 = 40." },
  { t: "Percentage", d: "EXPERT", q: "A number is increased by 10% then decreased by 10%. Net change is:", o: ["1% decrease", "no change", "1% increase", "2% decrease"], c: 0, e: "1.1×0.9 = 0.99 → 1% decrease." },
  { t: "Mixtures", d: "EXPERT", q: "From 40 L pure milk, 10 L is removed and replaced by water; done twice. Milk left:", o: ["22.5 L", "20 L", "25 L", "30 L"], c: 0, e: "40(3/4)² = 22.5 L." },
  { t: "Pipes & Cisterns", d: "EXPERT", q: "A fills in 6 h, B in 8 h. Both open 2 h, then A is shut. Total time to fill:", o: ["16/3 h", "5 h", "6 h", "4 h"], c: 0, e: "2 h: 7/12 filled; rest 5/12 by B(1/8) = 10/3 h → 2+10/3 = 16/3 h." },
  { t: "Algebra", d: "EXPERT", q: "If x + 1/x = √3, then x³ + 1/x³ = ?", o: ["0", "3√3", "1", "√3"], c: 0, e: "(√3)³ − 3√3 = 3√3 − 3√3 = 0." },
  { t: "Speed", d: "EXPERT", q: "A 200 m train at 36 km/h crosses a platform in 50 s. Platform length:", o: ["300 m", "250 m", "350 m", "200 m"], c: 0, e: "10 m/s ×50 = 500 m total − 200 = 300 m." },
  { t: "CI", d: "EXPERT", q: "CI on ₹5000 at 20% for 2 years:", o: ["₹2200", "₹2000", "₹2400", "₹2100"], c: 0, e: "5000×1.44 = 7200 → 2200." },
  { t: "Profit & Loss", d: "EXPERT", q: "Cost ₹100, marked 25% up, 10% discount given. Profit %:", o: ["12.5%", "15%", "10%", "20%"], c: 0, e: "125×0.9 = 112.5 → 12.5%." },
  { t: "Ratio", d: "EXPERT", q: "a:b = 3:4, b:c = 5:6. Then a:c = ?", o: ["5:8", "1:2", "3:6", "15:24"], c: 0, e: "a:b:c = 15:20:24 → a:c = 5:8." },
  { t: "Algebra", d: "EXPERT", q: "51² − 49² = ?", o: ["200", "100", "180", "210"], c: 0, e: "(51+49)(51−49) = 100×2 = 200." },
];
function contentHash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffled(o, ci) { const a = o.map((text, i) => ({ text, correct: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  if (process.argv.includes("--verify")) { let n = 0; for (const q of ITEMS) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); } console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const T of TARGETS) for (const q of ITEMS) { const id = crypto.randomUUID(); qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true }); shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i })); }
  const chunk = async (arr, sz, fn) => { for (let i = 0; i < arr.length; i += sz) await fn(arr.slice(i, i + sz)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 76 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
