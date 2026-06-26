// Tricky batch #19 — EXTREME-HARD QUANT + ENGLISH mix (topper level). Verified.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

const ENGLISH_TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "english", subject: "English" },
  { examCode: "ssc-chsl-tier1", sectionCode: "english", subject: "English" },
  { examCode: "ssc-cgl-tier2", sectionCode: "english", subject: "English" },
  { examCode: "ibps-po-prelims", sectionCode: "english", subject: "English" },
];
const QUANT_TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "ssc-chsl-tier1", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "ibps-po-prelims", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "maths", subject: "Mathematics" },
  { examCode: "ssc-cgl-tier2", sectionCode: "math", subject: "Quantitative Aptitude" },
];

const QUANT = [
  { t: "Mensuration", d: "EXPERT", q: "In a right-angled triangle, the legs are 6 cm and 8 cm. Find the length of the altitude drawn from the right angle to the hypotenuse.", o: ["4.8 cm", "5 cm", "4 cm", "5.6 cm"], c: 0, e: "Hypotenuse = 10; altitude = (6×8)/10 = 4.8 cm." },
  { t: "Algebra", d: "EXPERT", q: "Four numbers a, b, c, d are in continued proportion (a/b = b/c = c/d). If a = 8 and d = 27, find b.", o: ["12", "18", "16", "24"], c: 0, e: "a = 8, common ratio r where a·r³ = d → r³ = 27/8 → r = 3/2 → b = 8×3/2 = 12." },
  { t: "Number System", d: "EXPERT", q: "Find the sum of all the factors of 360.", o: ["1170", "1024", "1080", "1200"], c: 0, e: "360 = 2³·3²·5 → (1+2+4+8)(1+3+9)(1+5) = 15×13×6 = 1170." },
  { t: "Simplification", d: "EXPERT", q: "Find the value of √(12 + √(12 + √(12 + …))).", o: ["4", "3", "6", "5"], c: 0, e: "x² = 12 + x → x² − x − 12 = 0 → x = 4." },
  { t: "Trigonometry", d: "EXPERT", q: "If cosec θ − sin θ = a and sec θ − cos θ = b, then the value of a²b²(a² + b² + 3) is:", o: ["1", "0", "2", "a + b"], c: 0, e: "This is a standard identity that simplifies exactly to 1." },
  { t: "Algebra", d: "EXPERT", q: "If x = (√3 + 1)/(√3 − 1) and y = (√3 − 1)/(√3 + 1), then the value of x² + y² is:", o: ["14", "12", "10", "16"], c: 0, e: "x = 2+√3, y = 2−√3 → x²+y² = 2(4+3) = 14." },
  { t: "Mensuration", d: "EXPERT", q: "The sides of a triangle are 9 cm, 12 cm and 15 cm. Find the length of the median drawn to the longest side.", o: ["7.5 cm", "8 cm", "6 cm", "9 cm"], c: 0, e: "It is a right triangle (9-12-15); the median to the hypotenuse = half of it = 7.5 cm." },
  { t: "Number System", d: "EXPERT", q: "Find the total number of zeros at the end of the product 50! × 40!.", o: ["21", "20", "24", "18"], c: 0, e: "Zeros in 50! = 12, in 40! = 9 → 12 + 9 = 21." },
];

const ENGLISH = [
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: INDEFATIGABLE", o: ["Tireless", "Lazy", "Indefinite", "Defeated"], c: 0, e: "Indefatigable = incapable of being tired → tireless." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: SOPORIFIC", o: ["Sleep-inducing", "Energetic", "Superior", "Soothing"], c: 0, e: "Soporific = tending to induce sleep." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: INTREPID", o: ["Fearless", "Timid", "Intricate", "Tepid"], c: 0, e: "Intrepid = fearless and bold. 'Tepid' is a sound-alike trap." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: PROFLIGATE", o: ["Thrifty", "Wasteful", "Extravagant", "Reckless"], c: 0, e: "Profligate = recklessly wasteful; antonym thrifty." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: NEFARIOUS", o: ["Virtuous", "Wicked", "Evil", "Sinful"], c: 0, e: "Nefarious = extremely wicked; antonym virtuous." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A form of government in which religious leaders rule in the name of God'", o: ["Theocracy", "Autocracy", "Aristocracy", "Plutocracy"], c: 0, e: "Theocracy = government by religious authority." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'A red herring'", o: ["A misleading clue that distracts from the real issue", "A rare fish", "A red flag of danger", "A clever solution"], c: 0, e: "A red herring is something used to divert attention." },
  { t: "Vocabulary", d: "EXPERT", q: "Choose the correct meaning of the phrase 'per se'.", o: ["By or in itself; intrinsically", "According to plan", "For each person", "As usual"], c: 0, e: "Per se (Latin) = by itself; intrinsically." },
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
    for (const [label, list] of [["QUANT", QUANT], ["ENGLISH", ENGLISH]]) {
      console.log(`\n===== ${label} (${list.length}) =====`);
      for (const q of list) { n++; console.log(`${n}. [${q.t}·${q.d}] ${q.q}\n    ✓ ${q.o[q.c]}`); }
    }
    console.log(`\nTotal: ${n} extreme questions.`);
    await prisma.$disconnect();
    return;
  }
  const qRows = [], oRows = [];
  const addAll = (list, targets) => {
    for (const t of targets) for (const q of list) {
      const id = crypto.randomUUID();
      qRows.push({ id, examCode: t.examCode, sectionCode: t.sectionCode, subject: t.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true });
      shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i }));
    }
  };
  addAll(QUANT, QUANT_TARGETS);
  addAll(ENGLISH, ENGLISH_TARGETS);
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const insertedIds = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  const liveOpts = oRows.filter((o) => insertedIds.has(o.questionId));
  await chunk(liveOpts, 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 19 (extreme mix) inserted ${insertedIds.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
