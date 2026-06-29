// Tricky batch #68 — BRUTAL ENGLISH. Hand-verified. All EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "english", subject: "English Comprehension" },
  { examCode: "ssc-chsl-tier1", sectionCode: "english", subject: "English Language" },
  { examCode: "ibps-po-prelims", sectionCode: "english", subject: "English Language" },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "general-awareness", subject: "General Awareness" },
  { examCode: "ssc-cgl-tier2", sectionCode: "english", subject: "English Language" },
];
const ITEMS = [
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'NEFARIOUS':", o: ["Wicked", "Noble", "Kind", "Brave"], c: 0, e: "Nefarious = extremely wicked." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'AUSTERE':", o: ["Lavish", "Strict", "Plain", "Harsh"], c: 0, e: "Austere = severe/plain; antonym = lavish." },
  { t: "One Word Substitution", d: "EXPERT", q: "A doctor for the eyes:", o: ["Ophthalmologist", "Cardiologist", "Dermatologist", "Neurologist"], c: 0, e: "Ophthalmologist = eye specialist." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'ARDUOUS':", o: ["Difficult", "Easy", "Quick", "Light"], c: 0, e: "Arduous = very difficult." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'To be in hot water' means:", o: ["In trouble", "In a bath", "In summer", "Cooking"], c: 0, e: "To be in difficulty/trouble." },
  { t: "One Word Substitution", d: "EXPERT", q: "Rule by the wealthy:", o: ["Plutocracy", "Democracy", "Theocracy", "Monarchy"], c: 0, e: "Plutocracy = rule by the rich." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'MUNDANE':", o: ["Extraordinary", "Ordinary", "Dull", "Routine"], c: 0, e: "Mundane = dull; antonym = extraordinary." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'GREGARIOUS' is closest to:", o: ["Sociable", "Hostile", "Quiet", "Stingy"], c: 0, e: "Gregarious = sociable." },
  { t: "One Word Substitution", d: "EXPERT", q: "A list of dishes in a restaurant:", o: ["Menu", "Recipe", "Bill", "Order"], c: 0, e: "Menu = list of dishes." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'To pull someone's leg' means:", o: ["To tease", "To injure", "To pull rope", "To help"], c: 0, e: "To joke/tease playfully." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'PLACID':", o: ["Calm", "Angry", "Loud", "Busy"], c: 0, e: "Placid = peaceful/calm." },
  { t: "Confusable Words", d: "EXPERT", q: "'Advice' vs 'Advise' — '___ me; take my ___':", o: ["Advise; advice", "Advice; advise", "Advise; advise", "Advice; advice"], c: 0, e: "Advise (verb), advice (noun)." },
  { t: "One Word Substitution", d: "EXPERT", q: "Fear of foreigners:", o: ["Xenophobia", "Hydrophobia", "Acrophobia", "Claustrophobia"], c: 0, e: "Xeno = strangers/foreigners." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'ASCEND':", o: ["Descend", "Climb", "Rise", "Lift"], c: 0, e: "Ascend ↔ descend." },
  { t: "Error Spotting", d: "EXPERT", q: "Find the error: 'He is the most cleverest (A)/ boy (B)/ in the (C)/ class (D).'", o: ["A — drop 'most'", "B", "C", "D"], c: 0, e: "'Cleverest' is already superlative → 'most' is redundant." },
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
  console.log(`Batch 68 (brutal english) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
