// Tricky batch #14 — QUANT & REASONING heavy. All NEW concepts. Hand-verified.
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
  { t: "Probability", d: "HARD", q: "A fair die is thrown once. What is the probability of getting a prime number?", o: ["1/2", "1/3", "2/3", "1/6"], c: 0, e: "Primes on a die: 2, 3, 5 → 3/6 = 1/2." },
  { t: "Probability", d: "MEDIUM", q: "A card is drawn at random from a well-shuffled pack of 52 cards. What is the probability that it is a king?", o: ["1/13", "1/4", "1/26", "4/13"], c: 0, e: "4 kings → 4/52 = 1/13." },
  { t: "Permutation & Combination", d: "HARD", q: "In how many ways can the letters of the word 'LEADER' be arranged?", o: ["360", "720", "120", "240"], c: 0, e: "6!/2! = 720/2 = 360 (E repeats twice)." },
  { t: "Permutation & Combination", d: "EXPERT", q: "In how many ways can a committee of 3 members be chosen from 8 people?", o: ["56", "336", "24", "112"], c: 0, e: "C(8,3) = 8!/(3!·5!) = 56." },
  { t: "Coordinate Geometry", d: "HARD", q: "Find the distance between the points (3, 4) and (7, 1).", o: ["5", "7", "25", "√7"], c: 0, e: "√((7−3)² + (1−4)²) = √(16+9) = √25 = 5." },
  { t: "Statistics", d: "MEDIUM", q: "Find the median of the data: 7, 3, 9, 5, 11.", o: ["7", "9", "5", "8"], c: 0, e: "Sorted: 3,5,7,9,11 → the middle value is 7." },
  { t: "Algebra", d: "HARD", q: "If α and β are the roots of x² − 5x + 6 = 0, find the value of α² + β².", o: ["13", "25", "12", "1"], c: 0, e: "α+β = 5, αβ = 6 → α²+β² = 25 − 12 = 13." },
  { t: "Profit and Loss", d: "EXPERT", q: "A dishonest dealer professes to sell goods at cost price but uses a weight of 800 g for 1 kg. Find his profit percent.", o: ["25%", "20%", "12.5%", "16⅔%"], c: 0, e: "Gain = 200/800 = 25%." },
  { t: "Mensuration", d: "HARD", q: "Find the area of an equilateral triangle whose side is 6 cm.", o: ["9√3 cm²", "12√3 cm²", "6√3 cm²", "18√3 cm²"], c: 0, e: "(√3/4)×6² = (√3/4)×36 = 9√3 cm²." },
  { t: "Simplification", d: "MEDIUM", q: "Express the recurring decimal 0.4444… as a fraction.", o: ["4/9", "2/5", "4/11", "1/2"], c: 0, e: "0.4̄ = 4/9." },
  { t: "Algebra", d: "HARD", q: "If a − b = 3 and ab = 10, find the value of a² + b².", o: ["29", "19", "39", "23"], c: 0, e: "a²+b² = (a−b)² + 2ab = 9 + 20 = 29." },
  { t: "Time, Speed & Distance", d: "EXPERT", q: "A train 200 m long overtakes another train 160 m long running in the same direction in 36 seconds. If the faster train runs at 50 km/h, find the speed of the slower train.", o: ["14 km/h", "16 km/h", "12 km/h", "18 km/h"], c: 0, e: "Relative speed = 360 m/36 s = 10 m/s = 36 km/h → slower = 50 − 36 = 14 km/h." },
  { t: "Clocks", d: "HARD", q: "At what time between 4 and 5 o'clock do the two hands of a clock coincide?", o: ["21 9/11 min past 4", "20 min past 4", "22 min past 4", "21 min past 4"], c: 0, e: "Coincidence at (4×60)/11 = 240/11 = 21 9/11 minutes past 4." },
  { t: "Mensuration", d: "MEDIUM", q: "The volume of a cube is 64 cm³. Find its total surface area.", o: ["96 cm²", "64 cm²", "128 cm²", "48 cm²"], c: 0, e: "Side = 4 cm → TSA = 6×4² = 96 cm²." },
  { t: "Number System", d: "HARD", q: "How many numbers between 1 and 100 are divisible by 3 but not by 5?", o: ["27", "33", "26", "20"], c: 0, e: "Divisible by 3: 33; by 15: 6 → 33 − 6 = 27." },
  { t: "Mixture & Alligation", d: "EXPERT", q: "A mixture of 40 litres contains milk and water in the ratio 3 : 1. How much water must be added so that the ratio becomes 3 : 2?", o: ["10 litres", "8 litres", "12 litres", "6 litres"], c: 0, e: "Milk 30, water 10; 30/(10+x) = 3/2 → 60 = 30 + 3x → x = 10 litres." },
];

const REASONING = [
  { t: "Number Series", d: "HARD", q: "Find the next term: 2, 5, 8, 11, 14, ?", o: ["17", "16", "18", "15"], c: 0, e: "Add 3 each time → 14 + 3 = 17." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 1, 4, 9, 16, 25, ?", o: ["36", "30", "49", "35"], c: 0, e: "Perfect squares → 6² = 36." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 2, 4, 7, 11, 16, ?", o: ["22", "21", "23", "20"], c: 0, e: "Differences 1,2,3,4,5,6 → 16 + 6 = 22." },
  { t: "Analogy", d: "MEDIUM", q: "Cat : Kitten :: Dog : ?", o: ["Puppy", "Bone", "Bark", "Pet"], c: 0, e: "A young cat is a kitten; a young dog is a puppy." },
  { t: "Coding-Decoding", d: "HARD", q: "If the letter positions of a word are written in reverse, 'BAD' (2,1,4) becomes (4,1,2). How is 'FED' written this way?", o: ["4 5 6", "6 5 4", "4 6 5", "5 4 6"], c: 0, e: "F,E,D = 6,5,4; reversed order of the word D,E,F = 4,5,6." },
  { t: "Classification", d: "HARD", q: "Find the odd pair: (2, 8), (3, 27), (4, 64), (5, 30)", o: ["(5, 30)", "(2, 8)", "(3, 27)", "(4, 64)"], c: 0, e: "8=2³, 27=3³, 64=4³ are cubes; 30 ≠ 5³ = 125." },
  { t: "Blood Relations", d: "MEDIUM", q: "If 'A + B' means A is the father of B, then in 'P + Q', P is Q's:", o: ["Father", "Son", "Brother", "Uncle"], c: 0, e: "By the given rule, P is the father of Q." },
  { t: "Seating Arrangement", d: "HARD", q: "Five people A, B, C, D and E sit in a row. A is immediately to the left of C, and D is immediately to the right of C. B is at the right end. Who is at the left end?", o: ["A", "E", "C", "D"], c: 0, e: "A-C-D form a block; B is at the right end → order A, C, D, E, B → A is at the left end." },
  { t: "Direction Sense", d: "EXPERT", q: "At 5 p.m. a boy stands facing the setting sun. He then turns 90° clockwise. Which direction is he facing now?", o: ["North", "South", "East", "West"], c: 0, e: "The setting sun is in the West; a 90° clockwise turn from West faces North." },
  { t: "Ranking & Order", d: "HARD", q: "A is taller than B, C is taller than A, D is shorter than B, and E is taller than C. Who is the tallest?", o: ["E", "C", "A", "B"], c: 0, e: "E > C > A > B > D → E is the tallest." },
  { t: "Calendar", d: "MEDIUM", q: "How many days are there in the month of February in a leap year?", o: ["29", "28", "30", "31"], c: 0, e: "February has 29 days in a leap year." },
  { t: "Clocks", d: "HARD", q: "What is the mirror image of the time 3:30 as seen in a mirror?", o: ["8:30", "9:30", "8:00", "6:30"], c: 0, e: "Mirror time = 11:60 − 3:30 = 8:30." },
  { t: "Cubes & Dice", d: "EXPERT", q: "A cube is painted red on all faces and cut into 27 equal smaller cubes. How many smaller cubes have exactly one face painted?", o: ["6", "8", "12", "1"], c: 0, e: "Face-centre cubes = 6 × (3−2)² = 6." },
  { t: "Syllogism", d: "HARD", q: "Statements: All roses are flowers. No flower is permanent. Conclusions: I. No rose is permanent. II. Some roses are permanent. Which conclusion(s) follow?", o: ["Only I follows", "Only II follows", "Both follow", "Neither follows"], c: 0, e: "Roses are flowers and no flower is permanent → no rose is permanent (I)." },
  { t: "Letter Series", d: "MEDIUM", q: "AB : CD :: EF : ?", o: ["GH", "FG", "HI", "GI"], c: 0, e: "Consecutive letter pairs → after EF comes GH." },
  { t: "Number Series", d: "HARD", q: "Find the missing term: 4, 9, 16, ?, 36, 49", o: ["25", "20", "24", "30"], c: 0, e: "Squares of 2,3,4,5,6,7 → missing is 5² = 25." },
];

const ENGLISH = [
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: BRAVE", o: ["Courageous", "Cowardly", "Boastful", "Brash"], c: 0, e: "Brave = courageous. 'Cowardly' is the opposite trap." },
  { t: "Synonyms", d: "MEDIUM", q: "Select the most appropriate synonym of: CALM", o: ["Serene", "Stormy", "Anxious", "Clammy"], c: 0, e: "Calm = peaceful → serene." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: VICTORY", o: ["Defeat", "Triumph", "Win", "Conquest"], c: 0, e: "Victory; antonym defeat. The rest are synonyms." },
  { t: "Antonyms", d: "MEDIUM", q: "Select the most appropriate antonym of: PRESENT", o: ["Absent", "Gift", "Current", "Here"], c: 0, e: "Present (in attendance); antonym absent." },
  { t: "One Word Substitution", d: "MEDIUM", q: "One-word substitution: 'A person who writes poems'", o: ["Poet", "Author", "Novelist", "Lyricist"], c: 0, e: "A poet writes poems." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A person who is unable to speak'", o: ["Mute", "Deaf", "Blind", "Lame"], c: 0, e: "A mute person cannot speak; a deaf person cannot hear (trap)." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To play with fire'", o: ["To take a dangerous risk", "To enjoy oneself", "To start a quarrel", "To act bravely"], c: 0, e: "To do something dangerous or risky." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To cry over spilt milk'", o: ["To regret what cannot be undone", "To waste food", "To complain loudly", "To be very sad"], c: 0, e: "To waste time regretting something that has already happened." },
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
  console.log(`Batch 14 inserted ${insertedIds.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
