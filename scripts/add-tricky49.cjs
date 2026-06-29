// Tricky batch #49 — BRUTAL ENGLISH. Hand-verified. All EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'ABATE':", o: ["Lessen", "Increase", "Begin", "Hide"], c: 0, e: "Abate = reduce/lessen." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'LETHARGIC':", o: ["Energetic", "Sleepy", "Slow", "Calm"], c: 0, e: "Lethargic = sluggish; antonym = energetic." },
  { t: "One Word Substitution", d: "EXPERT", q: "A speech made without preparation:", o: ["Extempore", "Eulogy", "Monologue", "Soliloquy"], c: 0, e: "Extempore = impromptu speech." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'AUDACIOUS':", o: ["Bold", "Timid", "Quiet", "Honest"], c: 0, e: "Audacious = daring/bold." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'To turn a blind eye' means:", o: ["To ignore deliberately", "To go blind", "To look closely", "To weep"], c: 0, e: "Deliberately ignore wrongdoing." },
  { t: "One Word Substitution", d: "EXPERT", q: "A place where dead bodies are kept:", o: ["Mortuary", "Granary", "Aviary", "Dormitory"], c: 0, e: "Mortuary = where corpses are kept." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'TRANSPARENT':", o: ["Opaque", "Clear", "Bright", "Thin"], c: 0, e: "Transparent ↔ opaque." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'INDIGENOUS':", o: ["Native", "Foreign", "Poor", "Angry"], c: 0, e: "Indigenous = native/local." },
  { t: "One Word Substitution", d: "EXPERT", q: "Animals that live in water:", o: ["Aquatic", "Amphibian", "Terrestrial", "Arboreal"], c: 0, e: "Aquatic = living in water; arboreal = trees." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'To cut corners' means:", o: ["To do cheaply/hastily", "To turn", "To save lives", "To divide"], c: 0, e: "Do something poorly to save cost/time." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'TENACIOUS':", o: ["Persistent", "Weak", "Lazy", "Loose"], c: 0, e: "Tenacious = holding firmly; persistent." },
  { t: "Confusable Words", d: "EXPERT", q: "'Affect' is usually a ___ and 'effect' a ___:", o: ["verb; noun", "noun; verb", "verb; verb", "noun; noun"], c: 0, e: "Affect (verb) = influence; effect (noun) = result." },
  { t: "One Word Substitution", d: "EXPERT", q: "Fear of heights:", o: ["Acrophobia", "Claustrophobia", "Hydrophobia", "Xenophobia"], c: 0, e: "Acro = heights." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'VICTORY':", o: ["Defeat", "Win", "Joy", "Battle"], c: 0, e: "Victory ↔ defeat." },
  { t: "Error Spotting", d: "EXPERT", q: "Find the error: 'One of the boy (A)/ is missing (B)/ from the (C)/ list (D).'", o: ["A — boy should be 'boys'", "B", "C", "D"], c: 0, e: "'One of the' takes a plural noun → 'boys'." },
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
  console.log(`Batch 49 (brutal english) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
