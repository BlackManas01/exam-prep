// Tricky batch #15 — QUANT & REASONING heavy. All NEW concepts. Hand-verified.
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
  { t: "Probability", d: "HARD", q: "Two dice are thrown together. What is the probability that the sum of the numbers is 7?", o: ["1/6", "1/9", "5/36", "1/12"], c: 0, e: "Favourable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 → 6/36 = 1/6." },
  { t: "Probability", d: "MEDIUM", q: "A bag contains 4 red and 6 blue balls. One ball is drawn at random. What is the probability that it is red?", o: ["2/5", "3/5", "4/6", "1/2"], c: 0, e: "4/(4+6) = 4/10 = 2/5." },
  { t: "Permutation & Combination", d: "HARD", q: "How many three-digit numbers can be formed using the digits 1, 2, 3, 4, 5 without repetition?", o: ["60", "125", "120", "243"], c: 0, e: "5 × 4 × 3 = 60." },
  { t: "Permutation & Combination", d: "EXPERT", q: "From 5 men and 4 women, in how many ways can a group of 2 men and 2 women be selected?", o: ["60", "120", "40", "20"], c: 0, e: "C(5,2) × C(4,2) = 10 × 6 = 60." },
  { t: "Coordinate Geometry", d: "HARD", q: "Find the midpoint of the line segment joining the points (2, 3) and (6, 7).", o: ["(4, 5)", "(4, 4)", "(3, 5)", "(8, 10)"], c: 0, e: "((2+6)/2, (3+7)/2) = (4, 5)." },
  { t: "Statistics", d: "MEDIUM", q: "Find the mode of the data: 2, 3, 3, 4, 5, 3, 6.", o: ["3", "4", "5", "2"], c: 0, e: "3 occurs most frequently → mode = 3." },
  { t: "Algebra", d: "HARD", q: "For what value of k does the equation x² − kx + 9 = 0 have equal roots?", o: ["±6", "±3", "±9", "±12"], c: 0, e: "Discriminant = k² − 36 = 0 → k = ±6." },
  { t: "Profit and Loss", d: "EXPERT", q: "A man sells an article at a 10% loss. Had he bought it for 20% less and sold it for ₹40 more, he would have made a 25% profit. Find the cost price.", o: ["₹400", "₹350", "₹450", "₹500"], c: 0, e: "0.8x×1.25 = 0.9x + 40 → x − 0.9x = 40 → 0.1x = 40 → x = ₹400." },
  { t: "Mensuration", d: "HARD", q: "Find the area of a regular hexagon whose side is 4 cm.", o: ["24√3 cm²", "16√3 cm²", "32√3 cm²", "48√3 cm²"], c: 0, e: "Area = (3√3/2)×side² = (3√3/2)×16 = 24√3 cm²." },
  { t: "Simplification", d: "MEDIUM", q: "Which of the following is greater: √5 + √3 or √6 + √2?", o: ["√5 + √3", "√6 + √2", "They are equal", "Cannot be determined"], c: 0, e: "(√5+√3)² = 8+2√15 ≈ 15.75 > (√6+√2)² = 8+2√12 ≈ 14.93." },
  { t: "Algebra", d: "HARD", q: "If x + y = 12 and x − y = 4, find the value of xy.", o: ["32", "36", "24", "48"], c: 0, e: "x = 8, y = 4 → xy = 32." },
  { t: "Time, Speed & Distance", d: "EXPERT", q: "A train crosses a bridge 300 m long in 30 seconds and another bridge 200 m long in 24 seconds. Find the length of the train.", o: ["200 m", "150 m", "250 m", "180 m"], c: 0, e: "(L+300)/30 = (L+200)/24 → 24L+7200 = 30L+6000 → L = 200 m." },
  { t: "Clocks", d: "HARD", q: "How many minutes past 5 o'clock will the hands of a clock be at a right angle for the first time?", o: ["10 10/11 min", "10 min", "12 min", "11 min"], c: 0, e: "|30×5 − 5.5m| = 90 → 150 − 5.5m = 90 → m = 60/5.5 = 10 10/11 min." },
  { t: "Mensuration", d: "MEDIUM", q: "The diameter of a circle is 14 cm. Find its circumference. (π = 22/7)", o: ["44 cm", "22 cm", "88 cm", "66 cm"], c: 0, e: "Circumference = πd = (22/7)×14 = 44 cm." },
  { t: "Number System", d: "HARD", q: "The product of two numbers is 2160 and their HCF is 6. How many such pairs of numbers are possible?", o: ["4", "3", "2", "5"], c: 0, e: "36ab = 2160 → ab = 60; coprime pairs (1,60),(3,20),(4,15),(5,12) → 4 pairs." },
  { t: "Mixture & Alligation", d: "EXPERT", q: "How many litres of water must be added to 60 litres of a milk-water mixture in the ratio 2 : 1 to make the ratio 1 : 1?", o: ["20 litres", "15 litres", "30 litres", "25 litres"], c: 0, e: "Milk 40, water 20; need water = milk = 40 → add 20 litres." },
];

const REASONING = [
  { t: "Number Series", d: "HARD", q: "Find the next term: 6, 13, 28, 59, ?", o: ["122", "118", "120", "124"], c: 0, e: "×2 and add 1,2,3,…: 59×2 + 4 = 122." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 5, 10, 15, 20, ?", o: ["25", "30", "22", "24"], c: 0, e: "Add 5 each time → 25." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 4, 6, 12, 14, 28, 30, ?", o: ["60", "58", "62", "45"], c: 0, e: "Alternately +2 and ×2 → 30 × 2 = 60." },
  { t: "Analogy", d: "MEDIUM", q: "Hammer : Tool :: Rose : ?", o: ["Flower", "Garden", "Thorn", "Red"], c: 0, e: "A hammer is a kind of tool; a rose is a kind of flower." },
  { t: "Coding-Decoding", d: "HARD", q: "If 'COLD' is coded as 'DPME' and 'WARM' as 'XBSN', how is 'HEAT' coded?", o: ["IFBU", "IFBT", "IGBU", "JFBU"], c: 0, e: "Each letter +1: H→I, E→F, A→B, T→U → IFBU." },
  { t: "Classification", d: "MEDIUM", q: "Find the odd one out: Apple, Orange, Grapes, Carrot, Mango", o: ["Carrot", "Apple", "Orange", "Mango"], c: 0, e: "Carrot is a vegetable; the rest are fruits." },
  { t: "Blood Relations", d: "MEDIUM", q: "Sita is the wife of Ram. Ram is the son of Mohan. How is Mohan related to Sita?", o: ["Father-in-law", "Father", "Brother-in-law", "Uncle"], c: 0, e: "Mohan is Ram's father, so he is Sita's father-in-law." },
  { t: "Seating Arrangement", d: "HARD", q: "A, B, C and D sit around a table facing the centre. A is opposite C and B is to the immediate right of A. Who is opposite B?", o: ["D", "A", "C", "B"], c: 0, e: "B is right of A, so D is left of A; B and D are opposite each other → D is opposite B." },
  { t: "Direction Sense", d: "MEDIUM", q: "Rohan walks 12 m towards East, then turns right and walks 5 m. How far is he from the starting point?", o: ["13 m", "17 m", "7 m", "15 m"], c: 0, e: "√(12² + 5²) = √169 = 13 m." },
  { t: "Ranking & Order", d: "HARD", q: "In a class, Rohit ranks 9th from the top and 38th from the bottom. How many students are there in the class?", o: ["46", "47", "45", "48"], c: 0, e: "9 + 38 − 1 = 46." },
  { t: "Calendar", d: "MEDIUM", q: "A leap year occurs once every how many years (normally)?", o: ["4 years", "2 years", "5 years", "10 years"], c: 0, e: "A leap year normally occurs every 4 years." },
  { t: "Clocks", d: "HARD", q: "What is the angle between the hour and minute hands of a clock at 2:30?", o: ["105°", "120°", "90°", "100°"], c: 0, e: "|30×2 − 5.5×30| = |60 − 165| = 105°." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A painted cube is cut into 64 equal smaller cubes. How many of the smaller cubes have no face painted?", o: ["8", "16", "24", "27"], c: 0, e: "Inner cubes = (4−2)³ = 8." },
  { t: "Syllogism", d: "HARD", q: "Statements: Some pens are pencils. No pencil is an eraser. Conclusions: I. Some pens are not erasers. II. Some pens are erasers. Which conclusion(s) follow?", o: ["Only I follows", "Only II follows", "Both follow", "Neither follows"], c: 0, e: "The pens that are pencils cannot be erasers → some pens are not erasers (I)." },
  { t: "Letter Series", d: "MEDIUM", q: "Find the next term: Z, X, V, T, ?", o: ["R", "S", "U", "Q"], c: 0, e: "Each letter moves back by 2 → T − 2 = R." },
  { t: "Number Series", d: "HARD", q: "Find the missing term: 7, 14, 28, ?, 112", o: ["56", "42", "64", "70"], c: 0, e: "Each term is doubled → 28 × 2 = 56." },
];

const ENGLISH = [
  { t: "Synonyms", d: "MEDIUM", q: "Select the most appropriate synonym of: ANCIENT", o: ["Old", "Modern", "Recent", "Ancestral"], c: 0, e: "Ancient = very old. 'Modern' is the opposite trap." },
  { t: "Synonyms", d: "MEDIUM", q: "Select the most appropriate synonym of: RAPID", o: ["Swift", "Slow", "Rough", "Rare"], c: 0, e: "Rapid = fast → swift." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: ARRIVE", o: ["Depart", "Reach", "Come", "Land"], c: 0, e: "Arrive; antonym depart. The rest are synonyms." },
  { t: "Antonyms", d: "MEDIUM", q: "Select the most appropriate antonym of: INCREASE", o: ["Decrease", "Expand", "Grow", "Rise"], c: 0, e: "Increase; antonym decrease. The rest are synonyms." },
  { t: "One Word Substitution", d: "MEDIUM", q: "One-word substitution: 'A person who cannot read or write'", o: ["Illiterate", "Ignorant", "Innocent", "Amateur"], c: 0, e: "An illiterate person cannot read or write." },
  { t: "One Word Substitution", d: "MEDIUM", q: "One-word substitution: 'A place where bread and cakes are baked or sold'", o: ["Bakery", "Pantry", "Grocery", "Dairy"], c: 0, e: "A bakery is where bread and cakes are made/sold." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To hit the books'", o: ["To study hard", "To throw books", "To read for fun", "To buy books"], c: 0, e: "To study with great effort." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'Once bitten, twice shy'", o: ["To be cautious after a bad experience", "To avoid animals", "To be afraid of everything", "To learn quickly"], c: 0, e: "After being hurt once, one becomes more careful." },
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
  console.log(`Batch 15 inserted ${insertedIds.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
