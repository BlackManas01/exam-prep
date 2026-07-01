// Batch #110 — BRUTAL REASONING, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1", SEC = "reasoning", SUBJ = "General Intelligence & Reasoning";
const ITEMS = [
  { t: "Number Series", q: "Find the next term: 11, 13, 17, 25, 41, ?", o: ["73", "71", "69", "75"], c: 0, e: "+2,+4,+8,+16,+32: 41+32 = 73." },
  { t: "Number Series", q: "Find the next term: 1, 3, 9, 31, 129, ?", o: ["651", "645", "655", "639"], c: 0, e: "×1+2, ×2+3, ×3+4, ×4+5, ×5+6: 129×5+6 = 651.", skip: true },
  { t: "Coding-Decoding", q: "If ‘PAINT’ is coded as ‘QBJOU’ (each letter +1) and ‘COLOR’ as ‘DPMPS’, then the code for the word ‘BRUSH’ is:", o: ["CSVTI", "CSVTJ", "CSUTI", "CTVTI"], c: 0, e: "+1 each: B→C,R→S,U→V,S→T,H→I → CSVTI." },
  { t: "Blood Relations", q: "Q is the brother of R. S is the sister of Q. T is the father of R. How many children does T have?", o: ["3", "2", "4", "1"], c: 0, e: "Q, R and S are all children of T → 3 children." },
  { t: "Syllogism", q: "Statements: All fruits are sweet. Some sweets are red. No red thing is sour. Conclusions: I. Some sweets are not sour. II. Some fruits are red. Which conclusion(s) follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Red sweets aren't sour → some sweets not sour (I). II uncertain." },
  { t: "Direction Sense", q: "A man walks 7 km towards East, turns right and walks 24 km. His shortest distance from the start is:", o: ["25 km", "31 km", "17 km", "23 km"], c: 0, e: "√(7²+24²) = 25 km." },
  { t: "Ranking", q: "In a row of 50 people, A is 20th from the left and B is 25th from the right. The number of people between A and B is:", o: ["4", "5", "6", "3"], c: 0, e: "B from left = 50−25+1 = 26; between = 26−20−1 = 5? recompute 26−20−1 = 5 → but options list 4 first; correct is 5.", skip: true },
  { t: "Clock", q: "The hands of a clock are 20 minutes apart on the dial. The angle between them is:", o: ["120°", "100°", "90°", "150°"], c: 0, e: "Each minute = 6°; 20 min-spaces × 6° = 120°." },
  { t: "Number Analogy", q: "7 is related to 49 and 11 is related to 121 in the same way as 13 is related to:", o: ["169", "156", "196", "143"], c: 0, e: "Squares: 13² = 169." },
  { t: "Odd One Out", q: "Find the odd one out: 63, 80, 99, 120, 145", o: ["145", "63", "80", "120"], c: 0, e: "63=8²−1,80=9²−1,99=10²−1,120=11²−1; 145 breaks (should be 143=12²−1)." },
  { t: "Order & Ranking", q: "Five students scored different marks. M scored more than N but less than O. P scored more than O. Q scored the least. Who scored the second highest?", o: ["O", "P", "M", "N"], c: 0, e: "P > O > M > N > Q → second highest is O." },
  { t: "Letter Series", q: "Find the next term: A, B, D, G, K, ?", o: ["P", "O", "N", "Q"], c: 0, e: "+1,+2,+3,+4,+5: K+5 = P." },
];
function hash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffle(o, ci) { const a = o.map((t, i) => ({ t, c: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const I = ITEMS.filter((x) => !x.skip);
  if (process.argv.includes("--verify")) { I.forEach((q, i) => console.log(`${i + 1}. [${q.t}] ${q.o[q.c]}`)); console.log(`Total: ${I.length}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const q of I) { const id = crypto.randomUUID(); qRows.push({ id, examCode: EXAM, sectionCode: SEC, subject: SUBJ, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: hash(q.q, q.o[q.c]), isActive: true }); shuffle(q.o, q.c).forEach((o, i) => oRows.push({ questionId: id, text: o.t, isCorrect: o.c, displayOrder: i })); }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 110 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
