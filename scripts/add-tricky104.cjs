// Batch #104 — BRUTAL REASONING, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1", SEC = "reasoning", SUBJ = "General Intelligence & Reasoning";
const ITEMS = [
  { t: "Number Series", q: "Find the next term in the series: 6, 11, 21, 36, 56, ?", o: ["81", "76", "84", "80"], c: 0, e: "Differences 5,10,15,20,25 → 56+25 = 81." },
  { t: "Number Series", q: "Find the next term: 7, 14, 28, 56, 112, ?", o: ["224", "196", "168", "200"], c: 0, e: "×2 each time → 112×2 = 224." },
  { t: "Coding-Decoding", q: "In a certain code, MADRAS is written as NBESBT (each letter moved one place forward). Following the same rule, BOMBAY is written as:", o: ["CPNCBZ", "CPNCAZ", "CPMCBZ", "CQNCBZ"], c: 0, e: "+1 each: B→C,O→P,M→N,B→C,A→B,Y→Z → CPNCBZ." },
  { t: "Blood Relations", q: "A is the son of B. B is the sister of C. C is the mother of D. D is the brother of E. How is A related to E?", o: ["Cousin", "Brother", "Uncle", "Nephew"], c: 0, e: "B & C are sisters; C is mother of D & E; A is B's son → A and E are cousins." },
  { t: "Syllogism", q: "Statements: All pens are inks. Some inks are red. No red thing is permanent. Conclusions: I. Some inks are not permanent. II. Some pens are red. Which conclusion(s) follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Red inks aren't permanent → some inks not permanent (I). II uncertain." },
  { t: "Direction Sense", q: "A man walks 8 km towards North, then turns East and walks 15 km. His shortest distance from the starting point is:", o: ["17 km", "23 km", "13 km", "21 km"], c: 0, e: "√(8²+15²) = √289 = 17 km." },
  { t: "Ranking", q: "In a row of 35 students, X is 13th from the left end and Y is 17th from the right end. The number of students sitting between X and Y is:", o: ["5", "6", "4", "7"], c: 0, e: "Y from left = 35−17+1 = 19; between = 19−13−1 = 5." },
  { t: "Clock", q: "The angle between the hour hand and the minute hand of a clock at 4:40 is:", o: ["100°", "90°", "110°", "120°"], c: 0, e: "Hour = 4×30 + 40×0.5 = 140°; minute = 240° → difference 100°." },
  { t: "Calendar", q: "If 15 August 2020 (a leap year) was a Saturday, then 15 August 2021 was a:", o: ["Sunday", "Saturday", "Monday", "Friday"], c: 0, e: "Aug 2020 to Aug 2021 has no 29 Feb between → 365 days → 1 odd day → Saturday + 1 = Sunday." },
  { t: "Number Analogy", q: "In the same way as 3 is related to 12 and 5 is related to 30, the number 7 is related to:", o: ["56", "49", "63", "42"], c: 0, e: "n(n+1): 3×4=12, 5×6=30 → 7×8 = 56." },
  { t: "Odd One Out", q: "Choose the number that does not belong with the others: 8, 27, 64, 124", o: ["124", "8", "27", "64"], c: 0, e: "8,27,64 are perfect cubes (2³,3³,4³); 124 is not (125=5³)." },
  { t: "Order & Ranking", q: "Among five friends, S is taller than P; P is taller than Q; R is shorter than Q; T is shorter than R. Who is the tallest?", o: ["S", "P", "Q", "R"], c: 0, e: "S > P > Q > R > T → S is tallest." },
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
  console.log(`Batch 104 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
