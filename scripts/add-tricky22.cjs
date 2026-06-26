// Tricky batch #22 — EXTREME-HARD ENGLISH only. Hand-verified. All EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: LOQUACIOUS", o: ["Talkative", "Silent", "Logical", "Liquid"], c: 0, e: "Loquacious = very talkative. 'Silent' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: PERFUNCTORY", o: ["Cursory", "Thorough", "Perfect", "Punctual"], c: 0, e: "Perfunctory = done carelessly/superficially → cursory." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: SAGACIOUS", o: ["Wise", "Foolish", "Sacred", "Sad"], c: 0, e: "Sagacious = having keen judgement → wise." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: INCONGRUOUS", o: ["Out of place", "Harmonious", "Incomplete", "Enormous"], c: 0, e: "Incongruous = not in harmony → out of place. 'Harmonious' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: VITRIOLIC", o: ["Caustic", "Gentle", "Glassy", "Vital"], c: 0, e: "Vitriolic = filled with bitter criticism → caustic." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: PENURIOUS", o: ["Stingy", "Generous", "Pensive", "Wealthy"], c: 0, e: "Penurious = miserly/extremely poor → stingy." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: ABSTEMIOUS", o: ["Gluttonous", "Moderate", "Temperate", "Sparing"], c: 0, e: "Abstemious = sparing in food/drink; antonym gluttonous. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: ESCHEW", o: ["Embrace", "Avoid", "Shun", "Abstain"], c: 0, e: "Eschew = deliberately avoid; antonym embrace. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: LAUDABLE", o: ["Blameworthy", "Praiseworthy", "Commendable", "Admirable"], c: 0, e: "Laudable = deserving praise; antonym blameworthy. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: CACOPHONY", o: ["Harmony", "Discord", "Noise", "Din"], c: 0, e: "Cacophony = harsh discordant sound; antonym harmony. The rest are synonyms." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person who hates or is opposed to marriage'", o: ["Misogamist", "Misogynist", "Bachelor", "Celibate"], c: 0, e: "A misogamist hates marriage; a misogynist hates women (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'An alphabetical list of words with their meanings at the end of a book'", o: ["Glossary", "Index", "Appendix", "Lexicon"], c: 0, e: "A glossary explains difficult terms; an index lists topics (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'Government or rule by a mob'", o: ["Ochlocracy", "Anarchy", "Autocracy", "Oligarchy"], c: 0, e: "Ochlocracy (mobocracy) = rule by the mob; anarchy = absence of government (trap)." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To rule the roost'", o: ["To be in complete control", "To raise chickens", "To wake up early", "To make noise"], c: 0, e: "To be the dominant person in a group." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'A baptism of fire'", o: ["A difficult first experience", "A religious ceremony", "A great achievement", "A dangerous accident"], c: 0, e: "A painful or difficult new undertaking." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To have an axe to grind'", o: ["To have a private selfish motive", "To prepare for a fight", "To do hard manual work", "To hold a grudge openly"], c: 0, e: "To have a personal or selfish reason for doing something." },
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
  console.log(`Batch 22 (extreme English) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
