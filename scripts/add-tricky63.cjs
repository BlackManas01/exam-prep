// Tricky batch #63 — BRUTAL ENGLISH. Hand-verified. All EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'EBULLIENT':", o: ["Enthusiastic", "Sad", "Tired", "Quiet"], c: 0, e: "Ebullient = cheerful and full of energy." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'CANDOUR':", o: ["Deceit", "Honesty", "Frankness", "Truth"], c: 0, e: "Candour = frankness; antonym = deceit." },
  { t: "One Word Substitution", d: "EXPERT", q: "One who walks in sleep:", o: ["Somnambulist", "Insomniac", "Lunatic", "Mute"], c: 0, e: "Somnambulist = sleepwalker." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'TACITURN':", o: ["Reserved", "Talkative", "Cheerful", "Rude"], c: 0, e: "Taciturn = saying little; reserved." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'To bury the hatchet' means:", o: ["Make peace", "Hide a weapon", "Start a fight", "Dig a hole"], c: 0, e: "End a quarrel and make peace." },
  { t: "One Word Substitution", d: "EXPERT", q: "A government by a single ruler:", o: ["Autocracy", "Democracy", "Oligarchy", "Bureaucracy"], c: 0, e: "Autocracy = one ruler with absolute power." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'FRAGILE':", o: ["Sturdy", "Weak", "Brittle", "Thin"], c: 0, e: "Fragile ↔ sturdy." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'INSIPID':", o: ["Tasteless", "Spicy", "Sweet", "Strong"], c: 0, e: "Insipid = lacking flavour/interest." },
  { t: "One Word Substitution", d: "EXPERT", q: "Killing of a newborn:", o: ["Infanticide", "Patricide", "Genocide", "Suicide"], c: 0, e: "Infanticide = killing an infant." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'Achilles' heel' means:", o: ["A weak point", "A strong arm", "A fast runner", "A foot injury"], c: 0, e: "A small but fatal weakness." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'PARSIMONIOUS':", o: ["Stingy", "Generous", "Rich", "Kind"], c: 0, e: "Parsimonious = excessively frugal/stingy." },
  { t: "Confusable Words", d: "EXPERT", q: "'Complement' vs 'Compliment' — 'She paid him a ___; salt is a ___ to fries':", o: ["compliment; complement", "complement; compliment", "compliment; compliment", "complement; complement"], c: 0, e: "Compliment = praise; complement = completes." },
  { t: "One Word Substitution", d: "EXPERT", q: "A person who breaks rules of conduct:", o: ["Deviant", "Saint", "Loyalist", "Patron"], c: 0, e: "Deviant = departing from norms." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'LUCID':", o: ["Confusing", "Clear", "Bright", "Simple"], c: 0, e: "Lucid = clear; antonym = confusing." },
  { t: "Error Spotting", d: "EXPERT", q: "Find the error: 'The scenery (A)/ of Kashmir (B)/ are very (C)/ beautiful (D).'", o: ["C — 'are' should be 'is'", "A", "B", "D"], c: 0, e: "'Scenery' is uncountable singular → 'is'." },
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
  console.log(`Batch 63 (brutal english) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
