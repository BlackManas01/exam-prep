// Tricky batch #58 — BRUTAL REASONING. Hand-verified. All EXPERT.
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
  { t: "Number Series", d: "EXPERT", q: "Find the next: 2, 10, 30, 68, ?", o: ["130", "120", "126", "140"], c: 0, e: "n³+n: 5³+5 = 130." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 0, 3, 8, 15, 24, ?", o: ["35", "33", "36", "34"], c: 0, e: "n²−1: 6²−1 = 35." },
  { t: "Coding-Decoding", d: "EXPERT", q: "If 'CAT' → 'DBU' (each letter +1), then 'DOG' → ?", o: ["EPH", "EPG", "DPH", "EOG"], c: 0, e: "+1 each: D→E, O→P, G→H → EPH." },
  { t: "Direction Sense", d: "EXPERT", q: "Walk 5 E, 5 N, 5 E. Distance from start:", o: ["√125 km", "10 km", "5 km", "15 km"], c: 0, e: "East 10, North 5 → √(100+25) = √125." },
  { t: "Clock", d: "EXPERT", q: "Angle between hands at 7:00:", o: ["150°", "120°", "180°", "90°"], c: 0, e: "7×30 = 210; smaller = 360−210 = 150°." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: B, D, G, K, ?", o: ["P", "O", "N", "Q"], c: 0, e: "+2,+3,+4,+5: K+5 = P." },
  { t: "Syllogism", d: "EXPERT", q: "Some cats are dogs. All dogs are pets. Conclusion: Some cats are pets. Follows?", o: ["Yes", "No", "Cannot say", "Never"], c: 0, e: "Cats that are dogs are pets → some cats are pets." },
  { t: "Analogy", d: "EXPERT", q: "4 : 64 :: 5 : ?", o: ["125", "100", "75", "150"], c: 0, e: "n³: 5³ = 125." },
  { t: "Ranking & Order", d: "EXPERT", q: "X 10th from top, 16th from bottom. Total:", o: ["25", "26", "24", "27"], c: 0, e: "10+16−1 = 25." },
  { t: "Odd One Out", d: "EXPERT", q: "Find the odd one: 13, 17, 19, 27", o: ["27", "13", "17", "19"], c: 0, e: "27 = 3³, others prime." },
  { t: "Mathematical Operations", d: "EXPERT", q: "8 + 2 × 5 − 12 ÷ 4 (BODMAS):", o: ["15", "13", "17", "12"], c: 0, e: "2×5=10, 12÷4=3 → 8+10−3 = 15." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next: ACEG, BDFH, CEGI, ?", o: ["DFHJ", "DEFG", "DFGH", "EGIK"], c: 0, e: "Each block starts A,B,C,D → DFHJ." },
  { t: "Number Series", d: "EXPERT", q: "Find the next: 1, 3, 7, 15, 31, ?", o: ["63", "62", "60", "64"], c: 0, e: "×2+1: 31×2+1 = 63." },
  { t: "Blood Relations", d: "EXPERT", q: "P is Q's mother, Q is R's brother. P is R's:", o: ["Mother", "Aunt", "Sister", "Grandmother"], c: 0, e: "Q and R are siblings; P is mother of both → R's mother." },
  { t: "Analogy", d: "EXPERT", q: "Cow : Calf :: Horse : ?", o: ["Foal", "Cub", "Kid", "Pup"], c: 0, e: "Young pair: a horse's young is a foal." },
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
  console.log(`Batch 58 (brutal reasoning) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
