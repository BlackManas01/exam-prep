// Tricky batch #97 — BRUTAL, SINGLE EXAM (ssc-chsl-tier1 only). Hand-verified. EXPERT.
// Policy: one exam per batch — no cross-exam duplicate questions.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-chsl-tier1";
const ITEMS = [
  { s: "quant", subj: "Quantitative Aptitude", t: "Profit & Loss", q: "A shopkeeper sells an article at a 15% profit. Had he bought it for 20% less and sold it for ₹36 less, he would have gained 25%. The original cost price of the article is:", o: ["₹240", "₹200", "₹250", "₹225"], c: 0, e: "1.15x−36 = 1.25(0.8x)=x → 0.15x=36 → x=240." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Average", q: "The average of 11 consecutive natural numbers is 30. If the next three consecutive numbers are also included, the new average becomes:", o: ["31.5", "31", "32", "30.5"], c: 0, e: "11 nums avg 30 → sum 330 (25..35). Add 36,37,38=111 → 441/14 = 31.5." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Pipes & Cisterns", q: "Two pipes can fill a tank in 20 and 30 minutes respectively. Both are opened together, but after 5 minutes the first pipe is closed. The time the second pipe takes to fill the remaining tank is:", o: ["17.5 min", "15 min", "20 min", "18 min"], c: 0, e: "5 min both = 5/20+5/30 = 5/12; remaining 7/12 by second (1/30) = 17.5 min." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Simple Interest", q: "A certain sum of money placed at simple interest triples itself in 20 years. The annual rate of interest is:", o: ["10%", "8%", "12%", "15%"], c: 0, e: "Triple = 200% gain in 20 yr → 200/20 = 10%." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Mixtures", q: "A mixture of 60 litres contains milk and water in the ratio 7 : 3. The quantity of water that must be added so that the ratio of milk to water becomes 3 : 2 is:", o: ["10 litres", "8 litres", "12 litres", "6 litres"], c: 0, e: "Milk 42, water 18; for 3:2 water=28 → add 10 L." },
  { s: "general-intelligence", subj: "General Intelligence", t: "Syllogism", q: "Statements: All keys are locks. Some locks are gates. No gate is metal. Conclusions: I. Some locks are not metal. II. Some keys are gates. Which conclusion(s) follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Gates aren't metal & gates are locks → some locks not metal (I). II uncertain." },
  { s: "general-intelligence", subj: "General Intelligence", t: "Blood Relations", q: "Pointing to a photograph, a woman said, 'The girl in the photo is the daughter of my mother's only son.' How is the girl related to the woman?", o: ["Niece", "Daughter", "Sister", "Cousin"], c: 0, e: "Mother's only son = the woman's brother; his daughter = the woman's niece." },
  { s: "general-intelligence", subj: "General Intelligence", t: "Direction", q: "A boy runs 20 m towards East, turns right and runs 15 m, turns right again and runs 25 m, then turns left and runs 15 m. His shortest distance from the start is:", o: ["≈29.15 m", "30 m", "25 m", "35 m"], c: 0, e: "Net East 20−25? actually East 20, then S15, then W25, then S15 → E: 20−25=−5, S: 30 → √(25+900)=√925 ≈ 30.4? use √(5²+30²)=√925≈30.4.", skip: true },
  { s: "general-intelligence", subj: "General Intelligence", t: "Number Series", q: "In the series 4, 6, 12, 30, 90, 315, one term is wrong. The wrong term is:", o: ["315", "90", "30", "12"], c: 0, e: "×1.5, ×2, ×2.5, ×3, ×3.5: 90×3.5=315 ✓; 30×3=90 ✓; 12×2.5=30 ✓; 6×2=12 ✓; 4×1.5=6 ✓ — all correct so trick: none... use given wrong 315? Actually all fit; replace.", skip: true },
  { s: "english", subj: "English Language", t: "Idioms", q: "Select the meaning of the idiom in the sentence: 'When the scandal broke, the minister decided to face the music rather than resign.'", o: ["Accept the consequences", "Enjoy a concert", "Run away", "Stay silent"], c: 0, e: "'Face the music' = accept the unpleasant consequences of one's actions." },
  { s: "english", subj: "English Language", t: "Error Spotting", q: "Identify the segment with an error: 'Neither the teacher (A)/ nor the students (B)/ was present (C)/ in the hall (D).'", o: ["C — 'was' should be 'were'", "A", "B", "D"], c: 0, e: "With 'neither...nor', the verb agrees with the nearer subject 'students' (plural) → 'were'." },
  { s: "english", subj: "English Language", t: "One Word Substitution", q: "Choose the correct one-word substitution: 'A government run by officials or bureaucrats rather than elected representatives.'", o: ["Bureaucracy", "Democracy", "Autocracy", "Aristocracy"], c: 0, e: "Bureaucracy = rule by officials." },
  { s: "english", subj: "English Language", t: "Fill in the Blanks", q: "Fill in the blank with the most appropriate word: 'Despite his ______ manner, the negotiator secured a deal that satisfied everyone.'", o: ["conciliatory", "belligerent", "indifferent", "reckless"], c: 0, e: "'Conciliatory' (peace-making) fits securing a satisfying deal." },
];
function hash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffle(o, ci) { const a = o.map((t, i) => ({ t, c: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const I = ITEMS.filter((x) => !x.skip);
  if (process.argv.includes("--verify")) { I.forEach((q, i) => console.log(`${i + 1}. [${q.s}/${q.t}] ${q.o[q.c]}`)); console.log(`Total: ${I.length}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const q of I) { const id = crypto.randomUUID(); qRows.push({ id, examCode: EXAM, sectionCode: q.s, subject: q.subj, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: hash(q.q, q.o[q.c]), isActive: true }); shuffle(q.o, q.c).forEach((o, i) => oRows.push({ questionId: id, text: o.t, isCorrect: o.c, displayOrder: i })); }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 97 (chsl only) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
