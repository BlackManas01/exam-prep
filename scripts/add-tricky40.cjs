// Tricky batch #40 — BRUTAL ENGLISH. Hand-verified. All EXPERT. No repeated word/rule.
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
const ENGLISH = [
  { t: "One Word Substitution", d: "EXPERT", q: "A person who speaks many languages:", o: ["Polyglot", "Linguist", "Bilingual", "Orator"], c: 0, e: "Polyglot = one who knows/uses several languages; a linguist studies language; bilingual = only two." },
  { t: "One Word Substitution", d: "EXPERT", q: "An abnormal fear of enclosed spaces:", o: ["Claustrophobia", "Agoraphobia", "Acrophobia", "Xenophobia"], c: 0, e: "Claustrophobia = fear of confined spaces; agoraphobia = open spaces; acrophobia = heights." },
  { t: "Synonyms", d: "EXPERT", q: "Choose the synonym of 'PULCHRITUDE':", o: ["Beauty", "Wealth", "Anger", "Decay"], c: 0, e: "Pulchritude means physical beauty." },
  { t: "Antonyms", d: "EXPERT", q: "Choose the antonym of 'PUSILLANIMOUS':", o: ["Courageous", "Timid", "Greedy", "Honest"], c: 0, e: "Pusillanimous = cowardly; antonym = courageous." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Idiom 'to bell the cat' means:", o: ["To undertake a risky task", "To make noise", "To flatter", "To run away"], c: 0, e: "To bell the cat = to take on a dangerous or risky task for the group." },
  { t: "One Word Substitution", d: "EXPERT", q: "Words inscribed on a tomb:", o: ["Epitaph", "Epigram", "Epilogue", "Elegy"], c: 0, e: "Epitaph = tomb inscription; elegy = mournful poem; epilogue = closing section." },
  { t: "Confusable Words", d: "EXPERT", q: "'Complaisant' most nearly means:", o: ["Eager to please", "Self-satisfied", "Complaining", "Complicated"], c: 0, e: "Complaisant = willing to please; do not confuse with 'complacent' (smug)." },
  { t: "Synonyms", d: "EXPERT", q: "Choose the synonym of 'MELLIFLUOUS':", o: ["Sweet-sounding", "Harsh", "Bitter", "Silent"], c: 0, e: "Mellifluous = pleasant/sweet-sounding." },
  { t: "Antonyms", d: "EXPERT", q: "Choose the antonym of 'EPHEMERAL':", o: ["Permanent", "Brief", "Fragile", "Hidden"], c: 0, e: "Ephemeral = short-lived; antonym = permanent." },
  { t: "One Word Substitution", d: "EXPERT", q: "One who cannot be corrected:", o: ["Incorrigible", "Invincible", "Incurable", "Inevitable"], c: 0, e: "Incorrigible = beyond correction/reform." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'Hobson's choice' means:", o: ["No real choice at all", "A wise decision", "A free gift", "A lucky escape"], c: 0, e: "Hobson's choice = an apparent choice where only one option exists." },
  { t: "Synonyms", d: "EXPERT", q: "Choose the synonym of 'PERSPICACIOUS':", o: ["Discerning", "Sweaty", "Confused", "Stubborn"], c: 0, e: "Perspicacious = having keen insight; discerning." },
  { t: "One Word Substitution", d: "EXPERT", q: "The scientific study of birds:", o: ["Ornithology", "Etymology", "Entomology", "Ecology"], c: 0, e: "Ornithology = birds; entomology = insects; etymology = word origins." },
  { t: "Confusable Words", d: "EXPERT", q: "'Ingenuous' most nearly means:", o: ["Innocent and frank", "Highly clever", "Dishonest", "Mechanical"], c: 0, e: "Ingenuous = naive/frank; do not confuse with 'ingenious' (clever)." },
  { t: "Error Spotting", d: "EXPERT", q: "Find the error: 'Each of the students (A)/ have submitted (B)/ their assignments (C)/ on time (D).'", o: ["B — have should be 'has'", "A", "C", "D"], c: 0, e: "'Each' is singular → 'has submitted'; B is the error." },
];
function contentHash(stem, correct) { const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${norm(stem)}::${norm(correct)}`).digest("hex"); }
function shuffled(opts, ci) { const a = opts.map((text, i) => ({ text, correct: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  if (process.argv.includes("--verify")) { let n = 0; for (const q of ENGLISH) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); } console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const T of TARGETS) for (const q of ENGLISH) {
    const id = crypto.randomUUID();
    qRows.push({ id, examCode: T.examCode, sectionCode: T.sectionCode, subject: T.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true });
    shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i }));
  }
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 40 (brutal english) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
