// Tricky batch #16 — QUANT & REASONING heavy. All NEW concepts. Hand-verified.
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
  { t: "Probability", d: "HARD", q: "A number is chosen at random from 1 to 20. What is the probability that it is a multiple of 4?", o: ["1/4", "1/5", "1/10", "1/2"], c: 0, e: "Multiples of 4: 4,8,12,16,20 = 5 → 5/20 = 1/4." },
  { t: "Probability", d: "MEDIUM", q: "What is the probability of getting a head in a single toss of a fair coin?", o: ["1/2", "1", "1/4", "2/3"], c: 0, e: "One favourable out of two outcomes → 1/2." },
  { t: "Permutation & Combination", d: "MEDIUM", q: "In how many ways can 5 people be seated in a row?", o: ["120", "60", "25", "720"], c: 0, e: "5! = 120." },
  { t: "Permutation & Combination", d: "EXPERT", q: "In how many ways can a cricket team of 11 players be chosen from 15 players?", o: ["1365", "1320", "455", "32760"], c: 0, e: "C(15,11) = C(15,4) = 1365." },
  { t: "Coordinate Geometry", d: "HARD", q: "Find the slope of the line joining the points (1, 2) and (3, 6).", o: ["2", "1", "3", "1/2"], c: 0, e: "Slope = (6−2)/(3−1) = 4/2 = 2." },
  { t: "Statistics", d: "MEDIUM", q: "Find the range of the data: 12, 7, 15, 9, 20, 5.", o: ["15", "20", "13", "10"], c: 0, e: "Range = highest − lowest = 20 − 5 = 15." },
  { t: "Algebra", d: "HARD", q: "What is the sum of the roots of the equation 2x² − 8x + 6 = 0?", o: ["4", "3", "8", "−4"], c: 0, e: "Sum of roots = −(−8)/2 = 4." },
  { t: "Simple Interest", d: "EXPERT", q: "A sum of ₹12000 is lent partly at 10% and partly at 15% per annum simple interest. If the total annual interest is ₹1500, find the sum lent at 10%.", o: ["₹6000", "₹5000", "₹7000", "₹8000"], c: 0, e: "0.1x + 0.15(12000−x) = 1500 → −0.05x = −300 → x = ₹6000." },
  { t: "Mensuration", d: "HARD", q: "The area of a rhombus is 120 cm² and one of its diagonals is 24 cm. Find the length of the other diagonal.", o: ["10 cm", "12 cm", "8 cm", "5 cm"], c: 0, e: "½ × 24 × d = 120 → d = 10 cm." },
  { t: "Simplification", d: "MEDIUM", q: "Find the value of (3/4 + 1/2 − 1/4).", o: ["1", "3/4", "1/2", "5/4"], c: 0, e: "(3 + 2 − 1)/4 = 4/4 = 1." },
  { t: "Algebra", d: "HARD", q: "If a² + b² = 41 and ab = 20, find the value of (a + b), where a and b are positive.", o: ["9", "7", "81", "11"], c: 0, e: "(a+b)² = 41 + 40 = 81 → a+b = 9." },
  { t: "Boats & Streams", d: "EXPERT", q: "A man rows to a place 48 km away and back in 14 hours. He can row 4 km with the stream in the same time as 3 km against it. Find the speed of the stream.", o: ["1 km/h", "2 km/h", "1.5 km/h", "2.5 km/h"], c: 0, e: "Down:Up = 4:3 → down 8, up 6 km/h (since 48/4k + 48/3k = 14 → k = 2) → stream = (8−6)/2 = 1 km/h." },
  { t: "Time & Work", d: "HARD", q: "A and B can complete a work in 10 and 15 days respectively. They work together and receive ₹3000 for the whole job. Find A's share.", o: ["₹1800", "₹1500", "₹2000", "₹1200"], c: 0, e: "Work ratio = 1/10 : 1/15 = 3 : 2 → A's share = 3000 × 3/5 = ₹1800." },
  { t: "Mensuration", d: "MEDIUM", q: "Find the curved surface area of a cylinder of radius 7 cm and height 10 cm. (π = 22/7)", o: ["440 cm²", "220 cm²", "880 cm²", "308 cm²"], c: 0, e: "CSA = 2πrh = 2×(22/7)×7×10 = 440 cm²." },
  { t: "Number System", d: "HARD", q: "Find the unit (ones) digit of 3⁴⁵ + 4⁴⁵.", o: ["7", "3", "1", "9"], c: 0, e: "3⁴⁵ → unit 3 (cycle 3,9,7,1; 45 mod 4 = 1); 4⁴⁵ → unit 4 (odd power); 3+4 = 7." },
  { t: "Percentage", d: "EXPERT", q: "In an election, 10% of the votes were declared invalid. A candidate secured 60% of the valid votes and won by 7200 votes. Find the total number of votes polled.", o: ["40000", "36000", "45000", "48000"], c: 0, e: "Margin = 20% of valid = 0.20×0.9T = 0.18T = 7200 → T = 40000." },
];

const REASONING = [
  { t: "Number Series", d: "HARD", q: "Find the next term: 3, 6, 11, 18, 27, ?", o: ["38", "36", "40", "37"], c: 0, e: "Differences 3,5,7,9,11 → 27 + 11 = 38." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 100, 95, 85, 70, 50, ?", o: ["25", "30", "20", "35"], c: 0, e: "Differences −5,−10,−15,−20,−25 → 50 − 25 = 25." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 2, 8, 18, 32, 50, ?", o: ["72", "64", "68", "70"], c: 0, e: "Pattern 2n²: 2,8,18,32,50,72." },
  { t: "Analogy", d: "MEDIUM", q: "Book : Author :: Painting : ?", o: ["Artist", "Colour", "Canvas", "Frame"], c: 0, e: "A book is created by an author; a painting by an artist." },
  { t: "Coding-Decoding", d: "HARD", q: "If 'TEACHER' is coded as 'VGCEJGT' (each letter +2), how is 'STUDENT' coded?", o: ["UVWFGPV", "UVWFGPW", "UWWFGPV", "UVXFGPV"], c: 0, e: "Each letter +2: S→U, T→V, U→W, D→F, E→G, N→P, T→V → UVWFGPV." },
  { t: "Classification", d: "HARD", q: "Find the odd one out: 24, 36, 48, 64, 72", o: ["64", "24", "36", "72"], c: 0, e: "24, 36, 48, 72 are multiples of 12; 64 is not." },
  { t: "Blood Relations", d: "MEDIUM", q: "Reena is the daughter of Ramesh. Ramesh is the brother of Suresh. How is Suresh related to Reena?", o: ["Uncle", "Father", "Brother", "Cousin"], c: 0, e: "Suresh is the brother of Reena's father → her uncle." },
  { t: "Seating Arrangement", d: "HARD", q: "Seven people A–G sit in a row. D is exactly in the centre. A is at the left end and F is immediately to the right of D. Who is fourth from the right end?", o: ["D", "F", "E", "G"], c: 0, e: "Row of 7: D is at position 4 (centre) → 4th from the right end is also position 4 → D." },
  { t: "Direction Sense", d: "EXPERT", q: "Two persons start from the same point. One walks 6 km North and the other walks 8 km East. What is the shortest distance between them now?", o: ["10 km", "14 km", "7 km", "12 km"], c: 0, e: "√(6² + 8²) = √100 = 10 km." },
  { t: "Ranking & Order", d: "MEDIUM", q: "In a row of 60 children, R is 17th from the right end. What is R's position from the left end?", o: ["44th", "43rd", "45th", "42nd"], c: 0, e: "60 − 17 + 1 = 44th from the left." },
  { t: "Calendar", d: "HARD", q: "If 1 January 2024 was a Monday and 2024 is a leap year, what day was 1 January 2025?", o: ["Wednesday", "Tuesday", "Thursday", "Monday"], c: 0, e: "2024 has 366 days → 2 odd days → Monday + 2 = Wednesday." },
  { t: "Clocks", d: "HARD", q: "What is the angle between the hour and minute hands of a clock at 8:00?", o: ["120°", "240°", "150°", "90°"], c: 0, e: "|30×8| = 240°; the smaller angle = 360° − 240° = 120°." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A 3×3×3 cube is painted on all faces and cut into unit cubes. How many unit cubes have at least one face painted?", o: ["26", "27", "20", "24"], c: 0, e: "Total 27 − inner 1 = 26." },
  { t: "Syllogism", d: "HARD", q: "Statements: All cats are animals. Some animals are wild. Conclusions: I. Some cats are wild. II. Some wild things are animals. Which conclusion(s) follow?", o: ["Only II follows", "Only I follows", "Both follow", "Neither follows"], c: 0, e: "'Some animals are wild' gives 'some wild are animals' (II). I is not guaranteed." },
  { t: "Letter Series", d: "MEDIUM", q: "Find the next term: P, R, T, V, ?", o: ["X", "W", "Y", "U"], c: 0, e: "Alternate letters (+2) → V + 2 = X." },
  { t: "Logical Sequence", d: "HARD", q: "Arrange in a logical sequence: 1. Seed  2. Plant  3. Flower  4. Fruit  5. Tree", o: ["1, 2, 5, 3, 4", "1, 2, 3, 4, 5", "1, 5, 2, 3, 4", "2, 1, 5, 3, 4"], c: 0, e: "Seed → Plant → Tree → Flower → Fruit = 1, 2, 5, 3, 4." },
];

const ENGLISH = [
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: WICKED", o: ["Evil", "Kind", "Witty", "Weak"], c: 0, e: "Wicked = evil/morally bad. 'Witty' is a sound-alike trap." },
  { t: "Synonyms", d: "MEDIUM", q: "Select the most appropriate synonym of: FERTILE", o: ["Productive", "Barren", "Fragile", "Faithful"], c: 0, e: "Fertile = productive. 'Barren' is the opposite trap." },
  { t: "Antonyms", d: "MEDIUM", q: "Select the most appropriate antonym of: BRAVE", o: ["Cowardly", "Bold", "Daring", "Heroic"], c: 0, e: "Brave; antonym cowardly. The rest are synonyms." },
  { t: "Antonyms", d: "MEDIUM", q: "Select the most appropriate antonym of: WISE", o: ["Foolish", "Clever", "Sensible", "Prudent"], c: 0, e: "Wise; antonym foolish. The rest are synonyms." },
  { t: "One Word Substitution", d: "MEDIUM", q: "One-word substitution: 'A person who sells flowers'", o: ["Florist", "Gardener", "Botanist", "Grocer"], c: 0, e: "A florist sells flowers." },
  { t: "One Word Substitution", d: "MEDIUM", q: "One-word substitution: 'A glass tank in which fish are kept'", o: ["Aquarium", "Vivarium", "Terrarium", "Reservoir"], c: 0, e: "An aquarium holds fish and aquatic life." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To let bygones be bygones'", o: ["To forget past quarrels", "To remember the past", "To delay a decision", "To repeat history"], c: 0, e: "To forgive and forget past disagreements." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To take something with a pinch of salt'", o: ["To not believe it completely", "To add flavour", "To accept fully", "To be cautious of food"], c: 0, e: "To regard a statement with some doubt." },
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
  console.log(`Batch 16 inserted ${insertedIds.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
