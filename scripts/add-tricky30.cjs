// Tricky batch #30 — EXTREME-HARD ENGLISH only. Hand-verified. All EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: ENIGMA", o: ["Mystery", "Solution", "Energy", "Enemy"], c: 0, e: "An enigma is a puzzle or mystery." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: ABATE", o: ["Diminish", "Increase", "Abandon", "Abate"], c: 0, e: "Abate = to lessen/diminish. 'Increase' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: CONUNDRUM", o: ["Riddle", "Solution", "Continuation", "Conclusion"], c: 0, e: "A conundrum is a confusing problem or riddle." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: EMINENT", o: ["Distinguished", "Ordinary", "Imminent", "Eminent"], c: 0, e: "Eminent = famous and respected → distinguished. 'Imminent' is a sound-alike trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: HAPLESS", o: ["Unlucky", "Fortunate", "Happy", "Helpless"], c: 0, e: "Hapless = unfortunate/unlucky. 'Happy' is a sound-alike trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: IMPECCABLE", o: ["Flawless", "Faulty", "Impossible", "Impatient"], c: 0, e: "Impeccable = without fault → flawless." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: VINDICATE", o: ["Accuse", "Exonerate", "Absolve", "Justify"], c: 0, e: "Vindicate = clear of blame; antonym accuse. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: SCANTY", o: ["Plentiful", "Meagre", "Sparse", "Scarce"], c: 0, e: "Scanty = insufficient; antonym plentiful. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: HASTEN", o: ["Delay", "Hurry", "Rush", "Accelerate"], c: 0, e: "Hasten = to speed up; antonym delay. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: VOLATILE", o: ["Stable", "Explosive", "Unstable", "Fickle"], c: 0, e: "Volatile = liable to change rapidly; antonym stable. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: FERVENT", o: ["Indifferent", "Passionate", "Ardent", "Eager"], c: 0, e: "Fervent = intensely passionate; antonym indifferent. The rest are synonyms." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person who performs on a tightrope'", o: ["Funambulist", "Acrobat", "Juggler", "Gymnast"], c: 0, e: "A funambulist walks/performs on a tightrope." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person appointed to settle a dispute between two parties'", o: ["Arbitrator", "Advocate", "Witness", "Mediator"], c: 0, e: "An arbitrator is officially appointed to judge a dispute." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person who always looks on the bright side of things'", o: ["Optimist", "Pessimist", "Realist", "Idealist"], c: 0, e: "An optimist is hopeful and positive about the future." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To be in the limelight'", o: ["To be the centre of public attention", "To be on stage", "To be in danger", "To be very bright"], c: 0, e: "To be the focus of public attention." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To leave no stone unturned'", o: ["To make every possible effort", "To search a garden", "To destroy everything", "To rest completely"], c: 0, e: "To do everything possible to achieve something." },
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
  console.log(`Batch 30 (extreme English) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
