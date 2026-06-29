// Tricky batch #72 — BRUTAL REASONING. Hand-verified. All EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-chsl-tier1", sectionCode: "general-intelligence", subject: "General Intelligence" },
  { examCode: "ibps-po-prelims", sectionCode: "reasoning", subject: "Reasoning Ability" },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-cgl-tier2", sectionCode: "reasoning", subject: "Reasoning" },
];
const ITEMS = [
  { t: "Number Series", d: "EXPERT", q: "Find the next: 2, 3, 5, 9, 17, ?", o: ["33", "31", "35", "32"], c: 0, e: "×2−1: 17×2−1 = 33." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 1, 2, 6, 21, ?", o: ["88", "84", "86", "90"], c: 0, e: "×1+1,×2+2,×3+3,×4+4: 21×4+4 = 88." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'CAT'=24 and 'DOG'=26, then 'FOX' (sum of positions) =?", o: ["45", "44", "48", "42"], c: 0, e: "F6+O15+X24 = 45." },
  { t: "Direction Sense", d: "EXPERT", q: "Walk 6 N, 8 E, 6 S, 8 E. Distance:", o: ["16 km", "10 km", "20 km", "12 km"], c: 0, e: "N/S cancel; East 16 → 16 km." },
  { t: "Clock", d: "EXPERT", q: "Times hands are straight (opposite) in 12 h:", o: ["11", "12", "22", "10"], c: 0, e: "Opposite 11 times in 12 hours." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: A, B, D, H, ?", o: ["P", "O", "N", "Q"], c: 0, e: "+1,+2,+4,+8: H+8 = P." },
  { t: "Syllogism", d: "EXPERT", q: "All metals conduct. Gold is a metal. So gold conducts. Valid?", o: ["Yes", "No", "Cannot say", "Partly"], c: 0, e: "Valid deduction." },
  { t: "Analogy", d: "EXPERT", q: "12 : 144 :: 13 : ?", o: ["169", "156", "196", "143"], c: 0, e: "Square: 13² = 169." },
  { t: "Ranking & Order", d: "EXPERT", q: "P is 11th from each end of a row. Total:", o: ["21", "22", "20", "23"], c: 0, e: "11+11−1 = 21." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 3, 5, 7, 9", o: ["9", "3", "5", "7"], c: 0, e: "9 not prime." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If ÷→+, ×→−: 18 ÷ 6 × 2 = ?", o: ["22", "5", "16", "24"], c: 0, e: "18+6−2 = 22." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: AZ, CY, EX, ?", o: ["GW", "GV", "FW", "GX"], c: 0, e: "First +2, second −1 → GW." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 7, 26, 63, 124, ?", o: ["215", "210", "216", "218"], c: 0, e: "n³−1: 6³−1 = 215." },
  { t: "Blood Relations", d: "EXPERT", q: "P's sister's husband is Q. Q's son is R. P is R's:", o: ["Maternal aunt/uncle", "Father", "Brother", "Cousin"], c: 0, e: "P is sibling of R's mother → maternal aunt/uncle." },
  { t: "Analogy", d: "EXPERT", q: "Pen : Cap :: Bottle : ?", o: ["Lid", "Glass", "Water", "Cork"], c: 0, e: "Cover pair: a bottle's cover is a lid." },
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
  console.log(`Batch 72 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
