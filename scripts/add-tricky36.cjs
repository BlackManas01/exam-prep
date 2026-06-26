// Tricky batch #36 — BRUTAL ENGLISH. Hand-verified. All EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: OBSTREPEROUS", o: ["Unruly", "Obedient", "Obscure", "Obvious"], c: 0, e: "Obstreperous = noisy and difficult to control → unruly." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: FASTIDIOUS", o: ["Fussy", "Careless", "Fast", "Faithful"], c: 0, e: "Fastidious = very attentive to detail and hard to please → fussy." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: EBULLIENCE", o: ["Exuberance", "Gloom", "Boiling", "Calmness"], c: 0, e: "Ebullience = lively enthusiasm → exuberance." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: INVETERATE", o: ["Habitual", "Occasional", "Inventive", "Innocent"], c: 0, e: "Inveterate = firmly established by long habit → habitual." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: LACHRYMOSE", o: ["Tearful", "Cheerful", "Lazy", "Lustrous"], c: 0, e: "Lachrymose = tearful or given to weeping." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: PROPENSITY", o: ["Tendency", "Dislike", "Property", "Prosperity"], c: 0, e: "Propensity = an inclination or natural tendency." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: TURGID", o: ["Simple", "Swollen", "Pompous", "Bombastic"], c: 0, e: "Turgid = pompous/overblown; antonym simple. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: LAUDATORY", o: ["Critical", "Praising", "Complimentary", "Approving"], c: 0, e: "Laudatory = expressing praise; antonym critical. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: CRAVEN", o: ["Brave", "Cowardly", "Timid", "Fearful"], c: 0, e: "Craven = contemptibly cowardly; antonym brave. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: INDIGENCE", o: ["Affluence", "Poverty", "Need", "Want"], c: 0, e: "Indigence = poverty; antonym affluence. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: SUCCULENT", o: ["Dry", "Juicy", "Moist", "Lush"], c: 0, e: "Succulent = juicy; antonym dry. The rest are synonyms." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person who formally gives up the throne or high office'", o: ["Abdicator", "Successor", "Regent", "Monarch"], c: 0, e: "An abdicator renounces the throne or a position of authority." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'The killing of an infant'", o: ["Infanticide", "Patricide", "Genocide", "Homicide"], c: 0, e: "Infanticide = the killing of an infant; patricide = killing one's father (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A form of government in which power rests with a small group of people'", o: ["Oligarchy", "Monarchy", "Democracy", "Anarchy"], c: 0, e: "Oligarchy = rule by a small elite group." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To rest on one's oars'", o: ["To relax after completing an effort", "To row a boat", "To take a long holiday", "To give up midway"], c: 0, e: "To stop trying hard and relax after working." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To steal a march on someone'", o: ["To gain an advantage by acting before others", "To march in a parade", "To rob someone", "To copy someone"], c: 0, e: "To gain an advantage over others by acting before they do." },
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
  console.log(`Batch 36 (brutal English) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
