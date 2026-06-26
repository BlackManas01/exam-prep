// Tricky batch #13 — QUANT & REASONING heavy. All NEW concepts. Hand-verified.
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
  { t: "Averages", d: "HARD", q: "The average of 5 numbers is 27. If one number is excluded, the average of the remaining becomes 25. Find the excluded number.", o: ["35", "30", "33", "37"], c: 0, e: "5×27 − 4×25 = 135 − 100 = 35." },
  { t: "Percentage", d: "MEDIUM", q: "What is 30% of 40% of 500?", o: ["60", "70", "50", "120"], c: 0, e: "0.3 × 0.4 × 500 = 60." },
  { t: "Compound Interest", d: "HARD", q: "A sum of money amounts to ₹9261 in 3 years at 5% per annum compound interest. Find the principal.", o: ["₹8000", "₹8200", "₹7500", "₹8500"], c: 0, e: "P = 9261/(1.05)³ = 9261/1.157625 = ₹8000." },
  { t: "Pipes & Cisterns", d: "EXPERT", q: "Pipe A can fill a tank in 15 hours. Pipes A and B together can fill it in 6 hours. In how many hours can pipe B alone fill the tank?", o: ["10 hours", "9 hours", "12 hours", "8 hours"], c: 0, e: "1/B = 1/6 − 1/15 = (5−2)/30 = 1/10 → 10 hours." },
  { t: "Percentage", d: "HARD", q: "A man's salary is increased by 25%. By what percentage must the increased salary be reduced to restore the original salary?", o: ["20%", "25%", "15%", "22%"], c: 0, e: "Reduction = 25/125 = 20%." },
  { t: "Compound Interest", d: "MEDIUM", q: "Find the compound interest on ₹5000 at 10% per annum for 2 years.", o: ["₹1050", "₹1000", "₹1100", "₹1025"], c: 0, e: "5000(1.1² − 1) = 5000 × 0.21 = ₹1050." },
  { t: "Mensuration", d: "HARD", q: "The perimeter of a rectangle is 40 cm and its length is 12 cm. Find its area.", o: ["96 cm²", "80 cm²", "100 cm²", "108 cm²"], c: 0, e: "Width = 20 − 12 = 8 cm → area = 12 × 8 = 96 cm²." },
  { t: "Profit and Loss", d: "EXPERT", q: "A shopkeeper allows a 20% discount on the marked price and still makes a 25% profit. If the cost price is ₹600, find the marked price.", o: ["₹937.50", "₹900", "₹960", "₹1000"], c: 0, e: "SP = 750; MP × 0.8 = 750 → MP = ₹937.50." },
  { t: "Time, Speed & Distance", d: "HARD", q: "Two trains 120 m and 80 m long run in opposite directions at 42 km/h and 30 km/h. How long do they take to cross each other?", o: ["10 seconds", "12 seconds", "9 seconds", "15 seconds"], c: 0, e: "Relative speed 72 km/h = 20 m/s; total length 200 m → 10 s." },
  { t: "Profit and Loss", d: "MEDIUM", q: "If the cost price is ₹80 and the selling price is ₹100, what is the profit percentage?", o: ["25%", "20%", "30%", "22%"], c: 0, e: "Profit = 20/80 = 25%." },
  { t: "Number System", d: "HARD", q: "The HCF and LCM of two numbers are 4 and 48 respectively. If one number is 16, find the other.", o: ["12", "16", "8", "24"], c: 0, e: "Other = (HCF×LCM)/one = (4×48)/16 = 12." },
  { t: "Algebra", d: "EXPERT", q: "If a + 1/a = √3, then the value of a³ + 1/a³ is:", o: ["0", "1", "3√3", "√3"], c: 0, e: "a³+1/a³ = (√3)³ − 3(√3) = 3√3 − 3√3 = 0." },
  { t: "Simplification", d: "HARD", q: "Find the value of 0.5 of 0.05 of 500.", o: ["12.5", "125", "1.25", "25"], c: 0, e: "0.5 × 0.05 × 500 = 12.5." },
  { t: "Time, Speed & Distance", d: "MEDIUM", q: "A car covers 150 km in 2.5 hours. What is its speed?", o: ["60 km/h", "50 km/h", "75 km/h", "55 km/h"], c: 0, e: "150/2.5 = 60 km/h." },
  { t: "Compound Interest", d: "HARD", q: "A sum of money doubles itself in 5 years at compound interest. In how many years will it become 8 times itself?", o: ["15 years", "20 years", "10 years", "25 years"], c: 0, e: "8 = 2³ → 3 doubling periods × 5 = 15 years." },
  { t: "Trigonometry", d: "EXPERT", q: "When the length of the shadow of a vertical pole is √3 times its height, what is the angle of elevation of the sun?", o: ["30°", "45°", "60°", "15°"], c: 0, e: "tan θ = height/shadow = 1/√3 → θ = 30°." },
];

const REASONING = [
  { t: "Number Series", d: "HARD", q: "Find the next term: 0, 3, 8, 15, 24, ?", o: ["35", "34", "36", "30"], c: 0, e: "Pattern n² − 1: 1−1, 4−1, 9−1, 16−1, 25−1, 36−1 = 35." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 2, 4, 8, 16, 32, ?", o: ["64", "48", "60", "128"], c: 0, e: "Each term is doubled → 32 × 2 = 64." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 3, 7, 13, 21, ?", o: ["31", "29", "33", "28"], c: 0, e: "Differences 2, 4, 6, 8, 10 → 21 + 10 = 31." },
  { t: "Analogy", d: "MEDIUM", q: "Hot : Cold :: Up : ?", o: ["Down", "High", "Top", "Above"], c: 0, e: "Hot/cold and up/down are pairs of opposites." },
  { t: "Analogy", d: "HARD", q: "3 : 27 :: 4 : ?", o: ["64", "16", "48", "81"], c: 0, e: "3³ = 27, so 4³ = 64." },
  { t: "Classification", d: "MEDIUM", q: "Find the odd one out: Dog, Cow, Tiger, Goat", o: ["Tiger", "Dog", "Cow", "Goat"], c: 0, e: "Tiger is a wild animal; the others are domestic animals." },
  { t: "Coding-Decoding", d: "HARD", q: "If 'CODE' is coded as 'FRGH' (each letter +3), how is 'BYTE' coded?", o: ["EBWH", "EAWH", "DBWH", "EBVH"], c: 0, e: "Each letter +3: B→E, Y→B, T→W, E→H → EBWH." },
  { t: "Blood Relations", d: "HARD", q: "Pointing to a boy, Sara said, 'He is the son of my grandfather's only child.' How is the boy related to Sara?", o: ["Brother", "Cousin", "Uncle", "Nephew"], c: 0, e: "Grandfather's only child = Sara's parent; the son of her parent is her brother." },
  { t: "Direction Sense", d: "EXPERT", q: "From his house, Ram goes 15 m West and then 15 m South to reach a shop. In which direction is his house from the shop?", o: ["North-East", "South-West", "North-West", "South-East"], c: 0, e: "The shop is south-west of the house, so the house is north-east of the shop." },
  { t: "Ranking & Order", d: "HARD", q: "In a queue, P is 15th from the front and 20th from the back. How many persons are there in the queue?", o: ["34", "35", "33", "36"], c: 0, e: "15 + 20 − 1 = 34." },
  { t: "Clocks", d: "HARD", q: "What is the reflex angle between the hands of a clock at 3:00?", o: ["270°", "90°", "180°", "240°"], c: 0, e: "Small angle = 90°; reflex = 360° − 90° = 270°." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If 18 # 6 = 4, 24 # 8 = 4 and 30 # 5 = 7, then 40 # 8 = ?", o: ["6", "5", "8", "7"], c: 0, e: "Pattern (a ÷ b) + 1: 40÷8 + 1 = 5 + 1 = 6." },
  { t: "Syllogism", d: "HARD", q: "Statements: All books are papers. All papers are white. Conclusions: I. All books are white. II. Some white things are books. Which conclusion(s) follow?", o: ["Both I and II follow", "Only I follows", "Only II follows", "Neither follows"], c: 0, e: "Books → papers → white (I); books are white so some white are books (II)." },
  { t: "Letter Series", d: "MEDIUM", q: "Find the next term: A, C, E, G, ?", o: ["I", "H", "J", "F"], c: 0, e: "Alternate letters (+2) → G + 2 = I." },
  { t: "Analogy", d: "HARD", q: "5 : 30 :: 8 : ?", o: ["72", "64", "56", "80"], c: 0, e: "5×6 = 30, so 8×9 = 72 (n × (n+1))." },
  { t: "Direction Sense", d: "MEDIUM", q: "A man facing North turns 90° clockwise and then walks 5 km. In which direction has he walked?", o: ["East", "West", "South", "North"], c: 0, e: "Facing North, a 90° clockwise turn faces East → he walks East." },
];

const ENGLISH = [
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: IMMENSE", o: ["Vast", "Tiny", "Immediate", "Intense"], c: 0, e: "Immense = extremely large → vast." },
  { t: "Synonyms", d: "MEDIUM", q: "Select the most appropriate synonym of: FATIGUE", o: ["Tiredness", "Energy", "Famine", "Fashion"], c: 0, e: "Fatigue = extreme tiredness." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: CRUEL", o: ["Kind", "Harsh", "Brutal", "Savage"], c: 0, e: "Cruel; antonym kind. The rest are synonyms." },
  { t: "Antonyms", d: "MEDIUM", q: "Select the most appropriate antonym of: INNOCENT", o: ["Guilty", "Pure", "Naive", "Blameless"], c: 0, e: "Innocent; antonym guilty. The rest are synonyms." },
  { t: "One Word Substitution", d: "MEDIUM", q: "One-word substitution: 'A person who flies an aircraft'", o: ["Pilot", "Navigator", "Sailor", "Driver"], c: 0, e: "A pilot operates an aircraft." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A place where animals are kept for public viewing'", o: ["Zoo", "Sanctuary", "Aquarium", "Stable"], c: 0, e: "A zoo keeps animals for public display." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To break the news'", o: ["To reveal something, usually unpleasant", "To stop a broadcast", "To tell a lie", "To start a rumour"], c: 0, e: "To make something (often bad) known to someone." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To be on the ball'", o: ["To be alert and competent", "To be playing a game", "To be lucky", "To be confused"], c: 0, e: "To be quick to understand and react." },
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
  console.log(`Batch 13 inserted ${insertedIds.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
