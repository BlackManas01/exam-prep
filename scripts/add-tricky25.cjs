// Tricky batch #25 — EXTREME-HARD ENGLISH only. Hand-verified. All EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: FORTITUDE", o: ["Courage", "Weakness", "Fortune", "Fatigue"], c: 0, e: "Fortitude = courage in pain or adversity. 'Fortune' is a sound-alike trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: DEXTERITY", o: ["Skill", "Clumsiness", "Direction", "Density"], c: 0, e: "Dexterity = skill, especially with the hands." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: CLANDESTINE", o: ["Secret", "Open", "Classic", "Clean"], c: 0, e: "Clandestine = kept secret. 'Open' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: BELLIGERENT", o: ["Hostile", "Peaceful", "Beautiful", "Brilliant"], c: 0, e: "Belligerent = aggressive/hostile. 'Peaceful' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: ADULATION", o: ["Flattery", "Criticism", "Adulthood", "Addition"], c: 0, e: "Adulation = excessive flattery or admiration." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: OPULENT", o: ["Lavish", "Poor", "Opaque", "Open"], c: 0, e: "Opulent = rich and luxurious → lavish." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: TURBULENT", o: ["Calm", "Stormy", "Violent", "Chaotic"], c: 0, e: "Turbulent = disturbed/violent; antonym calm. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: ADVERSITY", o: ["Prosperity", "Misfortune", "Hardship", "Calamity"], c: 0, e: "Adversity = hardship; antonym prosperity. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: CANDOUR", o: ["Deceit", "Frankness", "Honesty", "Openness"], c: 0, e: "Candour = frankness; antonym deceit. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: LETHARGY", o: ["Energy", "Laziness", "Fatigue", "Idleness"], c: 0, e: "Lethargy = sluggishness; antonym energy. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: AUDACITY", o: ["Timidity", "Boldness", "Daring", "Courage"], c: 0, e: "Audacity = boldness; antonym timidity. The rest are synonyms." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person who eats human flesh'", o: ["Cannibal", "Carnivore", "Glutton", "Savage"], c: 0, e: "A cannibal eats human flesh; a carnivore eats animal flesh (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A doctor who treats mental illness'", o: ["Psychiatrist", "Psychologist", "Neurologist", "Physician"], c: 0, e: "A psychiatrist is a medical doctor treating mental illness; a psychologist is not a physician (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'One who has unlimited power'", o: ["Omnipotent", "Omniscient", "Omnipresent", "Autocrat"], c: 0, e: "Omnipotent = all-powerful; omniscient = all-knowing (trap)." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To paint the town red'", o: ["To go out and celebrate wildly", "To decorate a city", "To cause damage", "To protest"], c: 0, e: "To enjoy oneself flamboyantly in public." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To kill two birds with one stone'", o: ["To achieve two aims with a single action", "To be cruel", "To act hastily", "To waste effort"], c: 0, e: "To solve two problems with one action." },
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
  console.log(`Batch 25 (extreme English) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
