// Tricky batch #27 — EXTREME-HARD ENGLISH only. Hand-verified. All EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const ENGLISH_TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "english", subject: "English" },
  { examCode: "ssc-chsl-tier1", sectionCode: "english", subject: "English" },
  { examCode: "ssc-cgl-tier2", sectionCode: "english", subject: "English" },
  { examCode: "ibps-po-prelims", sectionCode: "english", subject: "English" },
];
const ENGLISH = [
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: PARAGON", o: ["Model of excellence", "Villain", "Paradox", "Paragraph"], c: 0, e: "A paragon is a perfect model or example of excellence." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: QUELL", o: ["Suppress", "Encourage", "Question", "Quench"], c: 0, e: "Quell = to put an end to/suppress. 'Quench' is a sound-alike trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: WHIMSICAL", o: ["Fanciful", "Serious", "Wise", "Wholesome"], c: 0, e: "Whimsical = playfully fanciful/capricious." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: ZEALOT", o: ["Fanatic", "Sceptic", "Coward", "Idler"], c: 0, e: "A zealot is a fanatical and uncompromising enthusiast." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: DEARTH", o: ["Scarcity", "Abundance", "Death", "Depth"], c: 0, e: "Dearth = a scarcity/lack. 'Abundance' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: PLETHORA", o: ["Excess", "Shortage", "Plenty of nothing", "Plain"], c: 0, e: "Plethora = an oversupply/excess." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: AMITY", o: ["Hostility", "Friendship", "Harmony", "Goodwill"], c: 0, e: "Amity = friendship; antonym hostility. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: EXODUS", o: ["Influx", "Departure", "Migration", "Withdrawal"], c: 0, e: "Exodus = a mass departure; antonym influx. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: INNATE", o: ["Acquired", "Inborn", "Natural", "Inherent"], c: 0, e: "Innate = inborn; antonym acquired. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: PARTISAN", o: ["Neutral", "Biased", "Supporter", "Devoted"], c: 0, e: "Partisan = prejudiced in favour of a side; antonym neutral." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: FLAMBOYANT", o: ["Modest", "Showy", "Flashy", "Ornate"], c: 0, e: "Flamboyant = showy; antonym modest. The rest are synonyms." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'The act of killing one's mother'", o: ["Matricide", "Patricide", "Fratricide", "Infanticide"], c: 0, e: "Matricide = killing one's mother; patricide = father (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'The study of the origin and history of words'", o: ["Etymology", "Entomology", "Ecology", "Etiology"], c: 0, e: "Etymology studies word origins; entomology studies insects (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'An imagined perfect place or state of society'", o: ["Utopia", "Dystopia", "Paradise", "Arcadia"], c: 0, e: "A utopia is an ideal society; a dystopia is its opposite (trap)." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To turn over a new leaf'", o: ["To reform and start afresh", "To read a new page", "To change jobs", "To plant a tree"], c: 0, e: "To begin to act or behave in a better way." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To make a clean breast of'", o: ["To confess everything", "To clean thoroughly", "To start over", "To be healthy"], c: 0, e: "To confess fully and frankly." },
];
function contentHash(stem, correct) {
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
  return crypto.createHash("sha256").update(`${norm(stem)}::${norm(correct)}`).digest("hex");
}
function shuffled(opts, correctIdx) {
  const arr = opts.map((text, i) => ({ text, correct: i === correctIdx }));
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
(async () => {
  if (process.argv.includes("--verify")) {
    let n = 0; for (const q of ENGLISH) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); }
    console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return;
  }
  const qRows = [], oRows = [];
  for (const t of ENGLISH_TARGETS) for (const q of ENGLISH) {
    const id = crypto.randomUUID();
    qRows.push({ id, examCode: t.examCode, sectionCode: t.sectionCode, subject: t.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true });
    shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i }));
  }
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 27 (extreme English) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
