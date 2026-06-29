// Tricky batch #60 — BRUTAL ENGLISH. Hand-verified. All EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'INTREPID':", o: ["Fearless", "Timid", "Lazy", "Weak"], c: 0, e: "Intrepid = fearless/brave." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'PROLIFIC':", o: ["Unproductive", "Fertile", "Rich", "Active"], c: 0, e: "Prolific = productive; antonym = unproductive." },
  { t: "One Word Substitution", d: "EXPERT", q: "A place where money is coined:", o: ["Mint", "Bank", "Treasury", "Vault"], c: 0, e: "Mint = where coins are made." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'WANE':", o: ["Decline", "Grow", "Shine", "Rise"], c: 0, e: "Wane = decrease/decline." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'At the eleventh hour' means:", o: ["At the last moment", "At 11 o'clock", "Too early", "Never"], c: 0, e: "At the last possible moment." },
  { t: "One Word Substitution", d: "EXPERT", q: "One who cannot read or write:", o: ["Illiterate", "Ignorant", "Novice", "Amateur"], c: 0, e: "Illiterate = unable to read/write." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'HUMILITY':", o: ["Arrogance", "Modesty", "Pride", "Calm"], c: 0, e: "Humility ↔ arrogance." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'CLANDESTINE':", o: ["Secret", "Open", "Loud", "Public"], c: 0, e: "Clandestine = secret/hidden." },
  { t: "One Word Substitution", d: "EXPERT", q: "Animals active at night:", o: ["Nocturnal", "Diurnal", "Aquatic", "Arboreal"], c: 0, e: "Nocturnal = active at night; diurnal = day." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'To smell a rat' means:", o: ["Suspect something wrong", "Find a pest", "Be hungry", "Get scared"], c: 0, e: "To sense that something is wrong." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'EMINENT':", o: ["Distinguished", "Common", "Hidden", "Low"], c: 0, e: "Eminent = famous/distinguished." },
  { t: "Confusable Words", d: "EXPERT", q: "'Eminent' vs 'Imminent' — 'A storm is ___ ; he is an ___ scientist':", o: ["imminent; eminent", "eminent; imminent", "eminent; eminent", "imminent; imminent"], c: 0, e: "Imminent = about to happen; eminent = famous." },
  { t: "One Word Substitution", d: "EXPERT", q: "Speech to oneself:", o: ["Soliloquy", "Dialogue", "Monologue", "Eulogy"], c: 0, e: "Soliloquy = speaking one's thoughts aloud alone." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'CONDENSE':", o: ["Expand", "Shrink", "Thicken", "Reduce"], c: 0, e: "Condense ↔ expand." },
  { t: "Error Spotting", d: "EXPERT", q: "Find the error: 'I prefer tea (A)/ than (B)/ coffee in (C)/ winter (D).'", o: ["B — 'than' should be 'to'", "A", "C", "D"], c: 0, e: "'Prefer' takes 'to', not 'than'." },
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
  console.log(`Batch 60 (brutal english) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
