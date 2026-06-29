// Tricky batch #57 — BRUTAL ENGLISH. Hand-verified. All EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'CACOPHONY':", o: ["Harsh noise", "Melody", "Silence", "Echo"], c: 0, e: "Cacophony = harsh discordant sound." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'VERBOSE':", o: ["Concise", "Wordy", "Loud", "Long"], c: 0, e: "Verbose ↔ concise." },
  { t: "One Word Substitution", d: "EXPERT", q: "One who is indifferent to pleasure or pain:", o: ["Stoic", "Cynic", "Critic", "Sceptic"], c: 0, e: "Stoic = unaffected by emotion." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'LACONIC':", o: ["Brief", "Talkative", "Lazy", "Loud"], c: 0, e: "Laconic = using few words; brief." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'A storm in a teacup' means:", o: ["Fuss over a trifle", "A big disaster", "Tea time", "Bad weather"], c: 0, e: "Great fuss over a minor matter." },
  { t: "One Word Substitution", d: "EXPERT", q: "Murder of a king:", o: ["Regicide", "Genocide", "Homicide", "Suicide"], c: 0, e: "Regicide = killing a king." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'PROXIMITY':", o: ["Distance", "Closeness", "Nearness", "Touch"], c: 0, e: "Proximity ↔ distance." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'EXONERATE':", o: ["Acquit", "Blame", "Punish", "Accuse"], c: 0, e: "Exonerate = clear of blame." },
  { t: "One Word Substitution", d: "EXPERT", q: "A speech in praise of someone dead:", o: ["Eulogy", "Epitaph", "Elegy", "Sermon"], c: 0, e: "Eulogy = high praise (esp. for the deceased)." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'To add fuel to the fire' means:", o: ["Worsen a situation", "Cook fast", "Help calm", "Light a lamp"], c: 0, e: "Make a bad situation worse." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'OSTENTATIOUS':", o: ["Showy", "Plain", "Hidden", "Cheap"], c: 0, e: "Ostentatious = flashy/showy." },
  { t: "Confusable Words", d: "EXPERT", q: "'Lose' vs 'Loose' — 'Don't ___ your keys; the screw is ___':", o: ["lose; loose", "loose; lose", "lose; lose", "loose; loose"], c: 0, e: "Lose = misplace; loose = not tight." },
  { t: "One Word Substitution", d: "EXPERT", q: "Study of the origin of words:", o: ["Etymology", "Entomology", "Ecology", "Ornithology"], c: 0, e: "Etymology = word origins." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'SUPERFLUOUS':", o: ["Essential", "Extra", "Useless", "Spare"], c: 0, e: "Superfluous = excessive; antonym = essential." },
  { t: "Error Spotting", d: "EXPERT", q: "Find the error: 'She is senior (A)/ than (B)/ me by (C)/ two years (D).'", o: ["B — 'than' should be 'to'", "A", "C", "D"], c: 0, e: "'Senior' takes 'to', not 'than'." },
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
  console.log(`Batch 57 (brutal english) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
