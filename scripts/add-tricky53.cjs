// Tricky batch #53 — BRUTAL ENGLISH. Hand-verified. All EXPERT.
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
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'OPULENT':", o: ["Wealthy", "Poor", "Empty", "Plain"], c: 0, e: "Opulent = rich/luxurious." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'AMATEUR':", o: ["Professional", "Beginner", "Player", "Fan"], c: 0, e: "Amateur ↔ professional." },
  { t: "One Word Substitution", d: "EXPERT", q: "A word opposite in meaning to another:", o: ["Antonym", "Synonym", "Homonym", "Acronym"], c: 0, e: "Antonym = opposite meaning." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'METICULOUS':", o: ["Careful", "Careless", "Quick", "Lazy"], c: 0, e: "Meticulous = very precise/careful." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'Break the ice' means:", o: ["Start a conversation", "Cool down", "Win a game", "Break glass"], c: 0, e: "To ease initial tension/start talking." },
  { t: "One Word Substitution", d: "EXPERT", q: "A person who travels on foot:", o: ["Pedestrian", "Pilgrim", "Tourist", "Nomad"], c: 0, e: "Pedestrian = one who walks." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'COMPULSORY':", o: ["Optional", "Forced", "Needed", "Strict"], c: 0, e: "Compulsory ↔ optional." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'VIVID':", o: ["Bright", "Dull", "Faint", "Dark"], c: 0, e: "Vivid = bright/clear." },
  { t: "One Word Substitution", d: "EXPERT", q: "One who loves books:", o: ["Bibliophile", "Bibliography", "Philatelist", "Numismatist"], c: 0, e: "Bibliophile = book lover; philatelist = stamps; numismatist = coins." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "'Burn the midnight oil' means:", o: ["Work late into the night", "Waste fuel", "Sleep early", "Cook food"], c: 0, e: "Study/work late." },
  { t: "Synonyms", d: "EXPERT", q: "Synonym of 'ZENITH':", o: ["Peak", "Bottom", "Middle", "Edge"], c: 0, e: "Zenith = highest point." },
  { t: "Confusable Words", d: "EXPERT", q: "'Their, There, They're' — choose: '___ going to ___ house.':", o: ["They're; their", "Their; there", "There; they're", "They're; there"], c: 0, e: "They're (they are) going to their (possessive) house." },
  { t: "One Word Substitution", d: "EXPERT", q: "A collector of coins:", o: ["Numismatist", "Philatelist", "Bibliophile", "Florist"], c: 0, e: "Numismatist = coins." },
  { t: "Antonyms", d: "EXPERT", q: "Antonym of 'EXPAND':", o: ["Contract", "Grow", "Widen", "Stretch"], c: 0, e: "Expand ↔ contract." },
  { t: "Error Spotting", d: "EXPERT", q: "Find the error: 'The team (A)/ are playing (B)/ very well (C)/ today (D).'", o: ["B — 'are' should be 'is'", "A", "C", "D"], c: 0, e: "'Team' as a unit is singular → 'is playing'." },
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
  console.log(`Batch 53 (brutal english) inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
