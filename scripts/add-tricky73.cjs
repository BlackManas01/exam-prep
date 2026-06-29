// Tricky batch #73 — BRUTAL ENGLISH. Hand-verified. All EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'QUELL':", o: ["Suppress", "Excite", "Begin", "Spread"], c: 0, e: "Quell = put down/suppress." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'AMICABLE':", o: ["Hostile", "Friendly", "Warm", "Polite"], c: 0, e: "Amicable ↔ hostile." },
  { t: "One Word Substitution", d: "EXPERT", q: "A handwriting that cannot be read:", o: ["Illegible", "Eligible", "Legible", "Tangible"], c: 0, e: "Illegible = not readable." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'BENIGN':", o: ["Harmless", "Cruel", "Bitter", "Severe"], c: 0, e: "Benign = gentle/harmless." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'To beat about the bush' means:", o: ["Avoid the main point", "Hunt birds", "Work hard", "Win easily"], c: 0, e: "Talk indirectly, avoiding the point." },
  { t: "One Word Substitution", d: "EXPERT", q: "One who renounces the world:", o: ["Ascetic", "Atheist", "Patriot", "Hermit"], c: 0, e: "Ascetic = practises severe self-discipline; renouncer." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'TRANQUIL':", o: ["Turbulent", "Calm", "Quiet", "Peaceful"], c: 0, e: "Tranquil ↔ turbulent." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'CULPABLE':", o: ["Guilty", "Innocent", "Pure", "Free"], c: 0, e: "Culpable = deserving blame; guilty." },
  { t: "One Word Substitution", d: "EXPERT", q: "Animals that live on land:", o: ["Terrestrial", "Aquatic", "Aerial", "Amphibian"], c: 0, e: "Terrestrial = land-dwelling." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'Win hands down' means:", o: ["Win easily", "Lose", "Tie", "Quit"], c: 0, e: "To win effortlessly." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'ABHOR':", o: ["Detest", "Love", "Accept", "Enjoy"], c: 0, e: "Abhor = hate/detest." },
  { t: "Confusable Words", d: "EXPERT", q: "'Stationery' refers to:", o: ["Writing materials", "Standing still", "A station", "A statue"], c: 0, e: "Stationery = paper goods; stationary = not moving." },
  { t: "One Word Substitution", d: "EXPERT", q: "One who studies the stars:", o: ["Astronomer", "Astrologer", "Geologist", "Biologist"], c: 0, e: "Astronomer = scientific study of stars." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'GENUINE':", o: ["Counterfeit", "Real", "Pure", "True"], c: 0, e: "Genuine ↔ counterfeit." },
  { t: "Error Spotting", d: "EXPERT", q: "Find the error: 'Each boy and girl (A)/ were given (B)/ a prize (C)/ today (D).'", o: ["B — 'were' should be 'was'", "A", "C", "D"], c: 0, e: "'Each…and' takes singular → 'was'." },
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
  console.log(`Batch 73 (brutal english) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
