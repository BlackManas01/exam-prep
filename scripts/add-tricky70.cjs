// Tricky batch #70 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next: 10, 20, 40, 80, ?", o: ["160", "120", "100", "140"], c: 0, e: "×2 → 160." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 50, 45, 40, 35, ?", o: ["30", "25", "32", "28"], c: 0, e: "−5 → 30." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'SKY' = 'TLZ' (+1 each), 'SUN' → ?", o: ["TVO", "TVP", "UVO", "TWO"], c: 0, e: "+1: S→T, U→V, N→O → TVO." },
  { t: "Direction Sense", d: "EXPERT", q: "Walk 20 S, 21 E. Distance:", o: ["29 km", "31 km", "27 km", "25 km"], c: 0, e: "√(400+441) = 29." },
  { t: "Clock", d: "EXPERT", q: "Angle between hands at 10:00:", o: ["60°", "120°", "90°", "150°"], c: 0, e: "Difference 2 hr ×30 = 60°." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: C, E, H, L, ?", o: ["Q", "P", "O", "R"], c: 0, e: "+2,+3,+4,+5: L+5 = Q." },
  { t: "Syllogism", d: "EXPERT", q: "Some pens are inks. All inks are blue. Conclusion: Some pens are blue. Follows?", o: ["Yes", "No", "Cannot say", "Never"], c: 0, e: "Pens that are inks are blue → some pens are blue." },
  { t: "Analogy", d: "EXPERT", q: "5 : 124 :: 3 : ?", o: ["26", "27", "24", "28"], c: 0, e: "n³−1: 3³−1 = 26." },
  { t: "Ranking & Order", d: "EXPERT", q: "X 9th from top, 9th from bottom. Total:", o: ["17", "18", "16", "19"], c: 0, e: "9+9−1 = 17." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 81, 100, 121, 130", o: ["130", "81", "100", "121"], c: 0, e: "81,100,121 squares; 130 not." },
  { t: "Mathematical Operations", d: "EXPERT", q: "30 ÷ 6 × 2 + 4 − 3:", o: ["11", "9", "13", "10"], c: 0, e: "5×2=10, +4−3 = 11." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: WX, UV, ST, ?", o: ["QR", "PQ", "RS", "QS"], c: 0, e: "−2 each pair → QR." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 6, 13, 27, 55, ?", o: ["111", "110", "112", "109"], c: 0, e: "×2+1: 55×2+1 = 111." },
  { t: "Blood Relations", d: "EXPERT", q: "A is B's son. B is C's wife. C is A's:", o: ["Father", "Uncle", "Brother", "Grandfather"], c: 0, e: "B is mother, C the husband → A's father." },
  { t: "Analogy", d: "EXPERT", q: "Sparrow : Bird :: Cobra : ?", o: ["Reptile", "Insect", "Fish", "Mammal"], c: 0, e: "Class pair: cobra is a reptile." },
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
  console.log(`Batch 70 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
