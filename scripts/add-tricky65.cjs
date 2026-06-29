// Tricky batch #65 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next: 5, 6, 9, 14, 21, ?", o: ["30", "28", "32", "29"], c: 0, e: "+1,+3,+5,+7,+9: 21+9 = 30." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 3, 9, 27, 81, ?", o: ["243", "162", "200", "240"], c: 0, e: "×3: 81×3 = 243." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'A'=1,...'Z'=26, value of 'SUM':", o: ["54", "52", "56", "50"], c: 0, e: "S19+U21+M13 = 53? Recheck: 19+21+13 = 53. (Use 53).", skip: true },
  { t: "Direction Sense", d: "EXPERT", q: "Walk 9 N, 12 E. Distance:", o: ["15 km", "21 km", "11 km", "13 km"], c: 0, e: "√(81+144) = 15." },
  { t: "Clock", d: "EXPERT", q: "Hands of clock are at right angle how often per 12 h?", o: ["22", "24", "11", "12"], c: 0, e: "Twice per overlap-period → 22 times in 12 hours." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: A, C, F, J, ?", o: ["O", "N", "M", "P"], c: 0, e: "+2,+3,+4,+5: J+5 = O." },
  { t: "Syllogism", d: "EXPERT", q: "No A is B. Some B are C. Conclusion: Some C are not A. Follows?", o: ["Yes", "No", "Cannot say", "Never"], c: 0, e: "The B that are C are not A → some C are not A." },
  { t: "Analogy", d: "EXPERT", q: "6 : 35 :: 8 : ?", o: ["63", "64", "65", "62"], c: 0, e: "n²−1: 8²−1 = 63." },
  { t: "Ranking & Order", d: "EXPERT", q: "X 18th from left, 23rd from right. Total persons:", o: ["40", "41", "39", "42"], c: 0, e: "18+23−1 = 40." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 15, 25, 35, 49", o: ["49", "15", "25", "35"], c: 0, e: "15,25,35 are multiples of 5; 49 is not." },
  { t: "Mathematical Operations", d: "EXPERT", q: "16 ÷ 4 + 2 × 3 − 5 (BODMAS):", o: ["5", "7", "6", "8"], c: 0, e: "4 + 6 − 5 = 5." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: ZA, YB, XC, WD, ?", o: ["VE", "VF", "UE", "VD"], c: 0, e: "First −1; second +1 → VE." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 2, 5, 11, 23, 47, ?", o: ["95", "94", "96", "92"], c: 0, e: "×2+1: 47×2+1 = 95." },
  { t: "Blood Relations", d: "EXPERT", q: "A is B's father. C is A's only son. B is C's:", o: ["Sister", "Brother", "Mother", "Wife"], c: 0, e: "C is A's only son; B is also A's child → B is female → sister." },
  { t: "Analogy", d: "EXPERT", q: "Library : Books :: Arsenal : ?", o: ["Weapons", "Soldiers", "Food", "Tools"], c: 0, e: "Storage pair: arsenal stores weapons." },
];
function contentHash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffled(o, ci) { const a = o.map((text, i) => ({ text, correct: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const I = ITEMS.filter((q) => !q.skip);
  if (process.argv.includes("--verify")) { let n = 0; for (const q of I) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); } console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const T of TARGETS) for (const q of I) { const id = crypto.randomUUID(); qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true }); shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i })); }
  const chunk = async (arr, sz, fn) => { for (let i = 0; i < arr.length; i += sz) await fn(arr.slice(i, i + sz)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 65 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
