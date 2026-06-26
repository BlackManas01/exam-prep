// Tricky batch #12 — QUANT & REASONING heavy. All NEW concepts. Hand-verified.
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
const REASONING_TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-chsl-tier1", sectionCode: "general-intelligence", subject: "General Intelligence" },
  { examCode: "ibps-po-prelims", sectionCode: "reasoning", subject: "Reasoning Ability" },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-cgl-tier2", sectionCode: "reasoning", subject: "Reasoning" },
];

const QUANT = [
  { t: "Number System", d: "HARD", q: "The sum of the first n natural numbers is 210. Find the value of n.", o: ["20", "21", "19", "15"], c: 0, e: "n(n+1)/2 = 210 → n(n+1) = 420 → n = 20." },
  { t: "Number System", d: "MEDIUM", q: "Find the value of 1² + 2² + 3² + … + 10².", o: ["385", "350", "405", "330"], c: 0, e: "n(n+1)(2n+1)/6 = 10×11×21/6 = 385." },
  { t: "Percentage", d: "HARD", q: "A number is increased by 25% and then the result is decreased by 25%. What is the net percentage change?", o: ["6.25% decrease", "No change", "6.25% increase", "5% decrease"], c: 0, e: "1.25×0.75 = 0.9375 → 6.25% decrease." },
  { t: "Time & Work", d: "EXPERT", q: "A can do a work in 24 days. He works alone for 6 days, then B finishes the rest in 12 days. In how many days can A and B together complete the whole work?", o: ["9.6 days", "10 days", "8 days", "12 days"], c: 0, e: "A does 1/4 in 6 days; B does 3/4 in 12 days → B's rate 1/16; together 1/24+1/16 = 5/48 → 9.6 days." },
  { t: "Number System", d: "HARD", q: "Two numbers are in the ratio 4 : 5 and their HCF is 8. Find their LCM.", o: ["160", "120", "200", "80"], c: 0, e: "Numbers 32 and 40 → LCM = 160." },
  { t: "Simplification", d: "MEDIUM", q: "Find the value of √0.0064.", o: ["0.08", "0.8", "0.008", "0.064"], c: 0, e: "√0.0064 = 0.08 (since 0.08² = 0.0064)." },
  { t: "Algebra", d: "HARD", q: "If 2^(x+1) = 32, then the value of x is:", o: ["4", "5", "6", "3"], c: 0, e: "2^(x+1) = 2⁵ → x + 1 = 5 → x = 4." },
  { t: "Profit and Loss", d: "EXPERT", q: "A shopkeeper offers '1 article free on the purchase of 9 articles'. What is the effective discount percentage?", o: ["10%", "11.11%", "9%", "12.5%"], c: 0, e: "10 articles for the price of 9 → discount = 1/10 = 10%." },
  { t: "Percentage", d: "HARD", q: "A man spends 75% of his income. If his income increases by 20% and expenditure by 10%, by what percent do his savings increase?", o: ["50%", "40%", "45%", "55%"], c: 0, e: "Savings 25 → 120 − 82.5 = 37.5 → increase 12.5/25 = 50%." },
  { t: "Mensuration", d: "MEDIUM", q: "Find the perimeter of a semicircle of radius 7 cm. (π = 22/7)", o: ["36 cm", "22 cm", "44 cm", "29 cm"], c: 0, e: "Perimeter = πr + 2r = 22 + 14 = 36 cm." },
  { t: "Mensuration", d: "HARD", q: "The ratio of the areas of two similar triangles is 16 : 25. What is the ratio of their corresponding sides?", o: ["4 : 5", "16 : 25", "2 : 3", "8 : 10"], c: 0, e: "Ratio of sides = √(16:25) = 4 : 5." },
  { t: "Algebra", d: "EXPERT", q: "If x² − 7x + 1 = 0, then the value of x² + 1/x² is:", o: ["47", "49", "45", "51"], c: 0, e: "x + 1/x = 7 → x² + 1/x² = 49 − 2 = 47." },
  { t: "Races", d: "HARD", q: "In a 100 m race, A beats B by 20 m. If A's time for the race is 20 seconds, by how many seconds does A beat B?", o: ["5 seconds", "4 seconds", "6 seconds", "8 seconds"], c: 0, e: "B runs 80 m in 20 s → speed 4 m/s → needs 5 s for the last 20 m → A beats B by 5 s." },
  { t: "Clocks", d: "MEDIUM", q: "A clock gains 5 minutes every hour. How much time will it gain in 12 hours?", o: ["60 minutes", "55 minutes", "50 minutes", "65 minutes"], c: 0, e: "5 × 12 = 60 minutes." },
  { t: "Percentage", d: "HARD", q: "After two successive increases of 10% and 20%, the price of an article becomes ₹660. What was its original price?", o: ["₹500", "₹550", "₹480", "₹600"], c: 0, e: "660/(1.1×1.2) = 660/1.32 = ₹500." },
  { t: "Mixture & Alligation", d: "EXPERT", q: "In what ratio must tea costing ₹60 per kg be mixed with tea costing ₹90 per kg so that the mixture is worth ₹75 per kg?", o: ["1 : 1", "2 : 3", "3 : 2", "1 : 2"], c: 0, e: "(90−75) : (75−60) = 15 : 15 = 1 : 1." },
];

const REASONING = [
  { t: "Number Series", d: "HARD", q: "Find the next term: 5, 11, 23, 47, 95, ?", o: ["191", "190", "189", "192"], c: 0, e: "Each term ×2 + 1 → 95×2 + 1 = 191." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 121, 144, 169, 196, ?", o: ["225", "210", "256", "200"], c: 0, e: "Squares of 11,12,13,14 → 15² = 225." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 2, 6, 21, 88, ?", o: ["445", "440", "450", "356"], c: 0, e: "×1+1, ×2+2, ×3+3, ×4+4, ×5+5 → 88×5 + 5 = 445." },
  { t: "Analogy", d: "MEDIUM", q: "Day : Night :: Light : ?", o: ["Dark", "Bright", "Lamp", "Sun"], c: 0, e: "Day and night are opposites; light and dark are opposites." },
  { t: "Analogy", d: "HARD", q: "16 : 25 :: 36 : ?", o: ["49", "48", "64", "42"], c: 0, e: "4² : 5² → 6² : 7² = 49." },
  { t: "Classification", d: "MEDIUM", q: "Find the odd one out: 11, 13, 17, 19, 21", o: ["21", "11", "13", "17"], c: 0, e: "21 = 3×7 is not prime; the rest are prime numbers." },
  { t: "Coding-Decoding", d: "HARD", q: "If 'APPLE' is coded as 'BQQMF' (each letter +1), then 'CBU' decodes to:", o: ["BAT", "CAT", "BAR", "BAD"], c: 0, e: "Each letter −1: C→B, B→A, U→T → BAT." },
  { t: "Blood Relations", d: "HARD", q: "P is Q's father. Q is R's brother. R is S's daughter. How is P related to S?", o: ["Husband", "Father", "Son", "Brother"], c: 0, e: "S is the mother of Q and R; P is their father → P is S's husband." },
  { t: "Direction Sense", d: "EXPERT", q: "A man walks 4 km South, turns left and walks 6 km, turns left and walks 4 km, then turns right and walks 2 km. Which direction is he facing now?", o: ["East", "West", "North", "South"], c: 0, e: "South → (left) East → (left) North → (right) East." },
  { t: "Ranking & Order", d: "HARD", q: "In a class of 40 students, Ravi's rank is 12th from the top. Sita's rank is 5 places below Ravi's. What is Sita's rank from the bottom?", o: ["24th", "23rd", "25th", "22nd"], c: 0, e: "Sita is 17th from top → from bottom = 40 − 17 + 1 = 24th." },
  { t: "Calendar", d: "MEDIUM", q: "If 14 February 2023 was a Tuesday, what day of the week was 14 March 2023?", o: ["Tuesday", "Wednesday", "Monday", "Thursday"], c: 0, e: "February 2023 has 28 days → 14 Feb to 14 Mar = 28 days = 0 odd days → Tuesday." },
  { t: "Clocks", d: "HARD", q: "How many times do the hands of a clock form a right angle in a 12-hour period?", o: ["22", "24", "11", "44"], c: 0, e: "The hands are at right angles 22 times in 12 hours." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If P means +, Q means −, R means × and S means ÷, then 12 R 3 S 4 P 5 Q 2 = ?", o: ["12", "10", "14", "15"], c: 0, e: "12×3÷4 + 5 − 2 = 9 + 5 − 2 = 12." },
  { t: "Syllogism", d: "HARD", q: "Statements: Some doctors are engineers. All engineers are graduates. Conclusions: I. Some doctors are graduates. II. All doctors are graduates. Which conclusion(s) follow?", o: ["Only I follows", "Only II follows", "Both follow", "Neither follows"], c: 0, e: "The doctors who are engineers are graduates (I). 'All doctors' is not established (II)." },
  { t: "Letter Series", d: "MEDIUM", q: "Find the next term: B, D, F, H, ?", o: ["J", "I", "K", "G"], c: 0, e: "Alternate letters (+2) → H + 2 = J." },
  { t: "Direction Sense", d: "HARD", q: "A man goes 5 m North, 5 m East, 5 m North, 5 m East and 5 m North. What is his straight-line displacement from the start?", o: ["5√13 m", "15 m", "25 m", "10 m"], c: 0, e: "Net North 15 m, net East 10 m → √(15²+10²) = √325 = 5√13 m." },
];

const ENGLISH = [
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: HOSTILE", o: ["Unfriendly", "Welcoming", "Hospitable", "Hasty"], c: 0, e: "Hostile = unfriendly/antagonistic. 'Hospitable' is the opposite trap." },
  { t: "Synonyms", d: "MEDIUM", q: "Select the most appropriate synonym of: VIVID", o: ["Bright", "Dull", "Vague", "Violent"], c: 0, e: "Vivid = bright and clear." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: PERMANENT", o: ["Temporary", "Lasting", "Stable", "Enduring"], c: 0, e: "Permanent = lasting; antonym temporary. The rest are synonyms." },
  { t: "Antonyms", d: "MEDIUM", q: "Select the most appropriate antonym of: SUPERIOR", o: ["Inferior", "Better", "Higher", "Greater"], c: 0, e: "Superior; antonym inferior. The rest are synonyms." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A book or document written by hand'", o: ["Manuscript", "Transcript", "Inscription", "Scripture"], c: 0, e: "A manuscript is a hand-written document." },
  { t: "One Word Substitution", d: "MEDIUM", q: "One-word substitution: 'A person who studies and writes about history'", o: ["Historian", "Archaeologist", "Anthropologist", "Geologist"], c: 0, e: "A historian studies and writes about history." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To keep an eye on'", o: ["To watch carefully", "To wink", "To ignore", "To admire"], c: 0, e: "To watch someone or something carefully." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To be in the same boat'", o: ["To be in the same difficult situation", "To travel together", "To agree completely", "To be close friends"], c: 0, e: "To share the same difficult circumstances." },
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
    for (const [label, list] of [["QUANT", QUANT], ["REASONING", REASONING], ["ENGLISH", ENGLISH]]) {
      console.log(`\n===== ${label} (${list.length}) =====`);
      for (const q of list) { n++; console.log(`${n}. [${q.t}·${q.d}] ${q.q}\n    ✓ ${q.o[q.c]}`); }
    }
    console.log(`\nTotal: ${n} new tricky questions.`);
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
  addAll(REASONING, REASONING_TARGETS);
  addAll(ENGLISH, ENGLISH_TARGETS);
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const insertedIds = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  const liveOpts = oRows.filter((o) => insertedIds.has(o.questionId));
  await chunk(liveOpts, 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 12 inserted ${insertedIds.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
