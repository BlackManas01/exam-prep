// Tricky batch #18 — EXTREME-HARD ENGLISH only (advanced vocabulary, foreign
// phrases, classical idioms, subtle grammar). Hand-verified. Tagged EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: PULCHRITUDE", o: ["Beauty", "Ugliness", "Purity", "Wealth"], c: 0, e: "Pulchritude = physical beauty." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: SYCOPHANT", o: ["Flatterer", "Critic", "Leader", "Hypocrite"], c: 0, e: "A sycophant is a servile flatterer." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: OBFUSCATE", o: ["Confuse", "Clarify", "Obstruct", "Observe"], c: 0, e: "Obfuscate = to deliberately make unclear → confuse. 'Clarify' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: MAGNANIMOUS", o: ["Generous", "Selfish", "Magnificent", "Enormous"], c: 0, e: "Magnanimous = noble and generous. 'Magnificent' is a sound-alike trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: PERSPICACIOUS", o: ["Perceptive", "Sweaty", "Stubborn", "Transparent"], c: 0, e: "Perspicacious = having keen insight → perceptive. 'Perspirable' sound-trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: TACITURN", o: ["Reserved", "Talkative", "Tactical", "Punctual"], c: 0, e: "Taciturn = saying little → reserved. 'Talkative' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: CAPRICIOUS", o: ["Unpredictable", "Steady", "Captive", "Capable"], c: 0, e: "Capricious = given to sudden changes → unpredictable." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: ALACRITY", o: ["Reluctance", "Eagerness", "Promptness", "Briskness"], c: 0, e: "Alacrity = brisk eagerness; antonym reluctance. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: PROLIX", o: ["Concise", "Lengthy", "Wordy", "Tedious"], c: 0, e: "Prolix = tediously long-winded; antonym concise." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: MUNIFICENT", o: ["Stingy", "Generous", "Lavish", "Bountiful"], c: 0, e: "Munificent = very generous; antonym stingy." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: VERACITY", o: ["Falsehood", "Truthfulness", "Honesty", "Accuracy"], c: 0, e: "Veracity = truthfulness; antonym falsehood." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A bitter and abusive speech or piece of writing'", o: ["Diatribe", "Eulogy", "Dialogue", "Soliloquy"], c: 0, e: "A diatribe is a forceful, bitter verbal attack." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A mild or indirect word substituted for a harsh or blunt one'", o: ["Euphemism", "Synonym", "Metaphor", "Idiom"], c: 0, e: "A euphemism softens an unpleasant expression (e.g. 'passed away')." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'Special words or expressions used by a particular profession'", o: ["Jargon", "Slang", "Dialect", "Lingo"], c: 0, e: "Jargon = specialised vocabulary of a profession or group." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'A Pyrrhic victory'", o: ["A victory that comes at a devastating cost", "An easy win", "A moral victory", "A surprising defeat"], c: 0, e: "A Pyrrhic victory inflicts such losses that it is hardly worth winning." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'A sword of Damocles'", o: ["An ever-present impending danger", "A powerful weapon", "A royal honour", "A difficult choice"], c: 0, e: "A sword of Damocles is a constant looming threat." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To cross the Rubicon'", o: ["To pass a point of no return", "To take a long journey", "To win a battle", "To avoid a decision"], c: 0, e: "To make an irreversible commitment." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the phrase: \"Achilles' heel\"", o: ["A small but fatal weakness", "A great strength", "A painful injury", "A clever trick"], c: 0, e: "An Achilles' heel is a vulnerable point despite overall strength." },
  { t: "Vocabulary", d: "EXPERT", q: "Choose the correct meaning of the phrase 'bona fide'.", o: ["Genuine; in good faith", "A good friend", "A false claim", "A formal contract"], c: 0, e: "Bona fide (Latin) = genuine, sincere, in good faith." },
  { t: "Vocabulary", d: "EXPERT", q: "Choose the correct meaning of the phrase 'carte blanche'.", o: ["Complete freedom to act", "A blank cheque", "A secret plan", "A polite refusal"], c: 0, e: "Carte blanche = unrestricted authority to do as one thinks best." },
  { t: "Vocabulary", d: "EXPERT", q: "Choose the correct meaning of the phrase 'faux pas'.", o: ["An embarrassing social blunder", "A false friend", "A clever move", "A formal apology"], c: 0, e: "Faux pas = a social mistake or breach of etiquette." },
  { t: "Vocabulary", d: "EXPERT", q: "Choose the correct meaning of the phrase 'quid pro quo'.", o: ["A favour given in return for something", "A sudden change", "A legal dispute", "A peace treaty"], c: 0, e: "Quid pro quo = something given or received for something else." },
  { t: "Sentence Improvement", d: "EXPERT", q: "Improve the underlined part: 'I wish I was as tall as my brother.'", o: ["I wish I were", "I wish I am", "I wish I had been", "No improvement"], c: 0, e: "The subjunctive mood after 'wish' requires 'were': 'I wish I were'." },
  { t: "Error Spotting", d: "EXPERT", q: "Identify the part with the error: He likes reading, (A) / writing and (B) / to paint in his free time. (C) / No error (D)", o: ["C", "A", "B", "D"], c: 0, e: "Parallelism requires 'painting', not 'to paint'." },
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
    let n = 0;
    for (const q of ENGLISH) { n++; console.log(`${n}. [${q.t}·${q.d}] ${q.q}\n    ✓ ${q.o[q.c]}`); }
    console.log(`\nTotal: ${n} extreme English questions.`);
    await prisma.$disconnect();
    return;
  }
  const qRows = [], oRows = [];
  for (const t of ENGLISH_TARGETS) for (const q of ENGLISH) {
    const id = crypto.randomUUID();
    qRows.push({ id, examCode: t.examCode, sectionCode: t.sectionCode, subject: t.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true });
    shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i }));
  }
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const insertedIds = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  const liveOpts = oRows.filter((o) => insertedIds.has(o.questionId));
  await chunk(liveOpts, 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 18 (extreme English) inserted ${insertedIds.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
