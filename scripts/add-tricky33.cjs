// Tricky batch #33 — BRUTAL ENGLISH (teacher/topper vocabulary). Verified. EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: INELUCTABLE", o: ["Inevitable", "Avoidable", "Illogical", "Elastic"], c: 0, e: "Ineluctable = unable to be resisted/avoided → inevitable." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: SANGUINE", o: ["Optimistic", "Gloomy", "Bloody", "Calm"], c: 0, e: "Sanguine = cheerfully optimistic." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: PUSILLANIMOUS", o: ["Cowardly", "Brave", "Generous", "Powerful"], c: 0, e: "Pusillanimous = showing a lack of courage → cowardly." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: INSOUCIANT", o: ["Carefree", "Anxious", "Insulting", "Insolent"], c: 0, e: "Insouciant = casually unconcerned → carefree." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: PERNICKETY", o: ["Fussy", "Careless", "Pleasant", "Quick"], c: 0, e: "Pernickety = placing too much emphasis on trivial detail → fussy." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: TRUCULENCE", o: ["Aggressiveness", "Calmness", "Honesty", "Tiredness"], c: 0, e: "Truculence = eagerness to argue or fight → aggressiveness." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: ANATHEMA", o: ["Blessing", "Curse", "Taboo", "Ban"], c: 0, e: "Anathema = a detested/cursed thing; antonym blessing." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: MELLIFLUOUS", o: ["Harsh", "Sweet", "Melodious", "Smooth"], c: 0, e: "Mellifluous = sweet-sounding; antonym harsh. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: DIFFIDENCE", o: ["Confidence", "Shyness", "Hesitation", "Reluctance"], c: 0, e: "Diffidence = lack of self-confidence; antonym confidence." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: EXACERBATE", o: ["Alleviate", "Aggravate", "Worsen", "Intensify"], c: 0, e: "Exacerbate = make worse; antonym alleviate. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: RELINQUISH", o: ["Retain", "Surrender", "Abandon", "Yield"], c: 0, e: "Relinquish = give up; antonym retain. The rest are synonyms." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person who attacks cherished beliefs or traditional institutions'", o: ["Iconoclast", "Idolater", "Conformist", "Patriot"], c: 0, e: "An iconoclast challenges or attacks established beliefs." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'An abnormal fear of open or public spaces'", o: ["Agoraphobia", "Claustrophobia", "Acrophobia", "Xenophobia"], c: 0, e: "Agoraphobia = fear of open/public spaces; claustrophobia = enclosed spaces (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A sound that is too faint to be heard'", o: ["Inaudible", "Silent", "Mute", "Soundless"], c: 0, e: "Inaudible = unable to be heard." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'A wolf in sheep's clothing'", o: ["A dangerous person pretending to be harmless", "A shy person", "A fierce animal", "A clever disguise expert"], c: 0, e: "Someone who hides hostile intentions behind a friendly appearance." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To carry the day'", o: ["To win or be successful", "To work all day", "To carry a burden", "To waste time"], c: 0, e: "To be victorious or prevail." },
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
  console.log(`Batch 33 (brutal English) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
