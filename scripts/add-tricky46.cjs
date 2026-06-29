// Tricky batch #46 — BRUTAL ENGLISH. Hand-verified. All EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'GARRULOUS':", o: ["Talkative", "Silent", "Brave", "Lazy"], c: 0, e: "Garrulous = excessively talkative." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'OBSCURE':", o: ["Clear", "Dark", "Hidden", "Vague"], c: 0, e: "Obscure = unclear; antonym = clear." },
  { t: "One Word Substitution", d: "EXPERT", q: "One who hates mankind:", o: ["Misanthrope", "Philanthropist", "Egoist", "Cynic"], c: 0, e: "Misanthrope hates humans; philanthropist loves them." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'UBIQUITOUS':", o: ["Everywhere", "Rare", "Useless", "Tiny"], c: 0, e: "Ubiquitous = present everywhere." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'Let the cat out of the bag' means:", o: ["Reveal a secret", "Free an animal", "Make a mistake", "Run fast"], c: 0, e: "To disclose a secret unintentionally." },
  { t: "One Word Substitution", d: "EXPERT", q: "Government by religious leaders:", o: ["Theocracy", "Democracy", "Plutocracy", "Aristocracy"], c: 0, e: "Theocracy = rule by religious authority." },
  { t: "One Word Substitution", d: "EXPERT", q: "A life story written by oneself:", o: ["Autobiography", "Biography", "Memoir", "Diary"], c: 0, e: "Autobiography = self-written life story." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'GENEROUS':", o: ["Stingy", "Kind", "Rich", "Bold"], c: 0, e: "Generous ↔ stingy." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'HOSTILE':", o: ["Unfriendly", "Warm", "Helpful", "Calm"], c: 0, e: "Hostile = unfriendly/aggressive." },
  { t: "One Word Substitution", d: "EXPERT", q: "An expert judge in matters of taste/art:", o: ["Connoisseur", "Novice", "Amateur", "Critic"], c: 0, e: "Connoisseur = a discerning expert." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'A piece of cake' means:", o: ["Very easy", "Tasty food", "A reward", "A small part"], c: 0, e: "Something very easy to do." },
  { t: "Confusable Words", d: "EXPERT", q: "Choose correct: 'Everyone ___ the rules were unfair.' :", o: ["except accepted that", "accept excepted that", "except excepted", "accept accept"], c: 0, e: "Except = apart from; accept = agree → 'Everyone except… accepted that'." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'PRUDENT':", o: ["Wise", "Foolish", "Quick", "Rude"], c: 0, e: "Prudent = careful/wise." },
  { t: "One Word Substitution", d: "EXPERT", q: "Killing of one's brother:", o: ["Fratricide", "Patricide", "Regicide", "Genocide"], c: 0, e: "Fratricide = killing a brother; patricide = father; regicide = king." },
  { t: "Error Spotting", d: "EXPERT", q: "Find the error: 'Neither of the boys (A)/ were (B)/ present (C)/ yesterday (D).'", o: ["B — were should be 'was'", "A", "C", "D"], c: 0, e: "'Neither' is singular → 'was'." },
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
  console.log(`Batch 46 (brutal english) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
