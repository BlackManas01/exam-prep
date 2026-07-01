// Batch #107 — BRUTAL REASONING, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1", SEC = "reasoning", SUBJ = "General Intelligence & Reasoning";
const ITEMS = [
  { t: "Number Series", q: "Find the next term: 3, 5, 9, 17, 33, ?", o: ["65", "63", "66", "64"], c: 0, e: "×2−1: 33×2−1 = 65." },
  { t: "Number Series", q: "Find the next term: 1, 4, 10, 22, 46, ?", o: ["94", "92", "96", "90"], c: 0, e: "×2+2: 46×2+2 = 94." },
  { t: "Coding-Decoding", q: "If the letters of the word are assigned their alphabetical positions (A=1 ... Z=26), then the sum of the positions of the letters in the word MOUSE is:", o: ["73", "71", "75", "69"], c: 0, e: "M13+O15+U21+S19+E5 = 73." },
  { t: "Blood Relations", q: "A is the father of B. B is the father of C. C is the mother of D. How is A related to D?", o: ["Great-grandfather", "Grandfather", "Father", "Uncle"], c: 0, e: "A→B→C→D spans three generations → A is D's great-grandfather." },
  { t: "Syllogism", q: "Statements: All cups are plates. Some plates are bowls. All bowls are dishes. Conclusions: I. Some plates are dishes. II. Some cups are dishes. Which conclusion(s) follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Bowls are dishes & bowls are plates → some plates dishes (I). II uncertain." },
  { t: "Direction Sense", q: "A man walks 5 km South, then 12 km East. His straight-line distance from the starting point is:", o: ["13 km", "17 km", "7 km", "15 km"], c: 0, e: "√(5²+12²) = 13 km." },
  { t: "Ranking", q: "In a row of 45 people, A is 18th from the left and B is 22nd from the right. The number of people sitting between A and B is:", o: ["5", "6", "4", "7"], c: 0, e: "B from left = 45−22+1 = 24; between = 24−18−1 = 5." },
  { t: "Clock", q: "The angle between the hour and minute hands of a clock at 6:15 is:", o: ["97.5°", "90°", "95°", "100°"], c: 0, e: "Hour = 187.5°, minute = 90° → difference 97.5°." },
  { t: "Number Analogy", q: "9 is related to 81 and 12 is related to 144 in the same way as 15 is related to:", o: ["225", "215", "235", "210"], c: 0, e: "Squares: 15² = 225." },
  { t: "Odd One Out", q: "Find the odd one out: 27, 64, 125, 150", o: ["150", "27", "64", "125"], c: 0, e: "27,64,125 are perfect cubes; 150 is not." },
  { t: "Seating", q: "Six people A, B, C, D, E, F sit in a row. A is at the left end. C is third from A. E is immediate right of C. B is between A and C. Who sits immediately to the left of E?", o: ["C", "B", "D", "F"], c: 0, e: "A,B,C,E,... → C is immediately left of E." },
  { t: "Letter Series", q: "Find the next term: A, C, F, J, O, ?", o: ["U", "T", "V", "S"], c: 0, e: "+2,+3,+4,+5,+6: O+6 = U." },
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
  console.log(`Batch 107 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
