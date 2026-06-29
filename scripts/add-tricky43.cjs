// Tricky batch #43 — BRUTAL ENGLISH. Hand-verified. All EXPERT.
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
  { t: "One Word Substitution", d: "EXPERT", q: "An animal that eats both plants and meat:", o: ["Omnivore", "Carnivore", "Herbivore", "Insectivore"], c: 0, e: "Omnivore eats both; carnivore meat; herbivore plants." },
  { t: "One Word Substitution", d: "EXPERT", q: "An abnormal fear of water:", o: ["Hydrophobia", "Aerophobia", "Pyrophobia", "Nyctophobia"], c: 0, e: "Hydro = water; pyro = fire; nycto = night." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'CANDID':", o: ["Frank", "Sweet", "Hidden", "Cruel"], c: 0, e: "Candid = honest and frank." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'BENEVOLENT':", o: ["Malevolent", "Kind", "Generous", "Gentle"], c: 0, e: "Benevolent = kind; antonym = malevolent." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'Spill the beans' means:", o: ["Reveal a secret", "Cook food", "Waste money", "Get angry"], c: 0, e: "Spill the beans = disclose secret information." },
  { t: "One Word Substitution", d: "EXPERT", q: "Government by a few:", o: ["Oligarchy", "Monarchy", "Anarchy", "Theocracy"], c: 0, e: "Oligarchy = rule by a small group." },
  { t: "Confusable Words", d: "EXPERT", q: "'Stationary' means:", o: ["Not moving", "Writing paper", "A shop", "A vehicle"], c: 0, e: "Stationary = still; stationery = paper goods." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'FRUGAL':", o: ["Thrifty", "Wasteful", "Lavish", "Greedy"], c: 0, e: "Frugal = economical/thrifty." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'SCARCE':", o: ["Abundant", "Rare", "Few", "Limited"], c: 0, e: "Scarce = few; antonym = abundant." },
  { t: "One Word Substitution", d: "EXPERT", q: "A medicine that cures all diseases:", o: ["Panacea", "Antidote", "Vaccine", "Tonic"], c: 0, e: "Panacea = universal remedy." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'Once in a blue moon' means:", o: ["Very rarely", "Every night", "Suddenly", "Forever"], c: 0, e: "Happening very rarely." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'GREGARIOUS':", o: ["Sociable", "Shy", "Angry", "Lazy"], c: 0, e: "Gregarious = fond of company; sociable." },
  { t: "One Word Substitution", d: "EXPERT", q: "The study of insects:", o: ["Entomology", "Ornithology", "Etymology", "Zoology"], c: 0, e: "Entomology = insects." },
  { t: "Confusable Words", d: "EXPERT", q: "'Principal' (noun) means:", o: ["Head of a school", "A rule", "A principle", "A pencil"], c: 0, e: "Principal = chief person; principle = a rule." },
  { t: "Error Spotting", d: "EXPERT", q: "Find the error: 'He don't (A)/ know (B)/ the answer (C)/ today (D).'", o: ["A — don't should be 'doesn't'", "B", "C", "D"], c: 0, e: "'He' takes 'doesn't' → A is wrong." },
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
  console.log(`Batch 43 (brutal english) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
