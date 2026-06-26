// Tricky batch #10 — QUANT & REASONING heavy. All NEW concepts, no overlap with
// batches 1-9. Every answer hand-verified.
//   node scripts/add-tricky10.cjs            (insert)
//   node scripts/add-tricky10.cjs --verify   (print only)
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
  { t: "Fractions", d: "HARD", q: "If the numerator of a fraction is increased by 20% and the denominator is decreased by 10%, the fraction becomes 16/21. Find the original fraction.", o: ["4/7", "3/7", "5/7", "2/3"], c: 0, e: "(1.2n)/(0.9d) = 16/21 → n/d = (16/21)(3/4) = 4/7." },
  { t: "Profit and Loss", d: "EXPERT", q: "A man sold two horses for ₹4000 each. On one he gained 25% and on the other he lost 20%. What is his overall loss?", o: ["₹200", "₹100", "No loss", "₹400"], c: 0, e: "CP = 4000/1.25 + 4000/0.8 = 3200 + 5000 = 8200; SP = 8000 → loss ₹200." },
  { t: "Averages", d: "MEDIUM", q: "The average of 6 numbers is 30. If one number is excluded, the average of the rest becomes 29. Find the excluded number.", o: ["35", "30", "29", "40"], c: 0, e: "6×30 − 5×29 = 180 − 145 = 35." },
  { t: "Ages", d: "HARD", q: "Ten years ago, the ratio of the ages of A and B was 3 : 5. Ten years from now, it will be 5 : 7. Find the present age of A.", o: ["40 years", "30 years", "45 years", "35 years"], c: 0, e: "(3x+20)/(5x+20)=5/7 → x=10 → A ten years ago = 30 → present 40." },
  { t: "Boats & Streams", d: "EXPERT", q: "A boat covers 35 km upstream and 55 km downstream in 12 hours. It also covers 30 km upstream and 44 km downstream in 10 hours. Find the speed of the boat in still water.", o: ["8 km/h", "6 km/h", "10 km/h", "9 km/h"], c: 0, e: "Solving gives upstream 5 km/h, downstream 11 km/h → still water = (5+11)/2 = 8 km/h." },
  { t: "Time & Work", d: "EXPERT", q: "12 men or 18 women can complete a work in 14 days. In how many days can 8 men and 16 women together complete the same work?", o: ["9 days", "10 days", "12 days", "8 days"], c: 0, e: "12M=18W → M=1.5W; total = 18W×14 = 252; 8M+16W = 28W → 252/28 = 9 days." },
  { t: "Pipes & Cisterns", d: "HARD", q: "Pipe A can fill a tank in 12 hours and pipe B in 8 hours. Both are opened together, but A is closed 3 hours before the tank is full. In how many hours is the tank filled?", o: ["6 hours", "5 hours", "7 hours", "4 hours"], c: 0, e: "(T−3)/12 + T/8 = 1 → 2(T−3)+3T = 24 → 5T = 30 → T = 6 hours." },
  { t: "Number System", d: "MEDIUM", q: "What is the smallest three-digit number exactly divisible by 7?", o: ["105", "100", "112", "98"], c: 0, e: "100 ÷ 7 = 14 r 2 → next multiple 15×7 = 105." },
  { t: "Number System", d: "HARD", q: "Find the HCF of (2³ × 3² × 5) and (2² × 3³ × 7).", o: ["36", "72", "18", "108"], c: 0, e: "Take the lowest powers of common primes: 2² × 3² = 4 × 9 = 36." },
  { t: "Algebra", d: "EXPERT", q: "If a + b = 5 and a² + b² = 13, then the value of a⁴ + b⁴ is:", o: ["97", "115", "91", "85"], c: 0, e: "ab = (25−13)/2 = 6; a⁴+b⁴ = (a²+b²)² − 2(ab)² = 169 − 72 = 97." },
  { t: "Mensuration", d: "HARD", q: "The exterior angle of a regular polygon is 40°. How many sides does the polygon have?", o: ["9", "8", "10", "12"], c: 0, e: "Number of sides = 360°/40° = 9." },
  { t: "Mensuration", d: "MEDIUM", q: "The area of a square is 144 cm². Find the length of its diagonal.", o: ["12√2 cm", "12 cm", "24 cm", "6√2 cm"], c: 0, e: "Side = 12 cm → diagonal = side√2 = 12√2 cm." },
  { t: "Mensuration", d: "HARD", q: "A cube of side 4 cm is painted on all faces and then cut into 1 cm cubes. How many of the small cubes have no face painted?", o: ["8", "16", "24", "27"], c: 0, e: "Inner cubes = (4−2)³ = 2³ = 8." },
  { t: "Trigonometry", d: "HARD", q: "If tan θ = 5/12, then the value of (sin θ + cos θ) is:", o: ["17/13", "7/13", "12/13", "5/13"], c: 0, e: "sin θ = 5/13, cos θ = 12/13 → sin θ + cos θ = 17/13." },
  { t: "Trigonometry", d: "EXPERT", q: "What is the value of (sin 35°/cos 55°) + (cos 35°/sin 55°)?", o: ["2", "1", "0", "√2"], c: 0, e: "cos 55° = sin 35° and sin 55° = cos 35° → 1 + 1 = 2." },
  { t: "Time, Speed & Distance", d: "MEDIUM", q: "A train 240 m long crosses a man standing on a platform in 12 seconds. Find its speed in km/h.", o: ["72 km/h", "60 km/h", "80 km/h", "66 km/h"], c: 0, e: "Speed = 240/12 = 20 m/s = 72 km/h." },
  { t: "Compound Interest", d: "HARD", q: "The difference between the compound interest and the simple interest on ₹8000 for 2 years is ₹20. Find the rate of interest per annum.", o: ["5%", "4%", "6%", "8%"], c: 0, e: "8000(r/100)² = 20 → (r/100)² = 1/400 → r = 5%." },
  { t: "Profit and Loss", d: "HARD", q: "If the selling price of an article is doubled, the profit triples. What is the original profit percentage?", o: ["100%", "50%", "75%", "66.67%"], c: 0, e: "Let CP=100, SP=x: 2x−100 = 3(x−100) → x = 200 → profit = 100%." },
];

const REASONING = [
  { t: "Coding-Decoding", d: "HARD", q: "If the code of a word is the sum of its letter positions and 'SUN' = 54, then 'MOON' = ?", o: ["57", "55", "60", "58"], c: 0, e: "M(13)+O(15)+O(15)+N(14) = 57." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 3, 9, 27, 81, ?", o: ["243", "162", "216", "324"], c: 0, e: "Powers of 3: 3¹, 3², 3³, 3⁴, 3⁵ = 243." },
  { t: "Number Series", d: "HARD", q: "Find the next term: 1, 4, 10, 22, 46, ?", o: ["94", "92", "90", "88"], c: 0, e: "Each term ×2 + 2: 46×2 + 2 = 94." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 5, 7, 11, 19, 35, ?", o: ["67", "65", "70", "63"], c: 0, e: "Differences 2, 4, 8, 16, 32 → 35 + 32 = 67." },
  { t: "Analogy", d: "MEDIUM", q: "Eye : See :: Ear : ?", o: ["Hear", "Sound", "Listen", "Nose"], c: 0, e: "An eye is used to see; an ear is used to hear." },
  { t: "Analogy", d: "HARD", q: "8 : 64 :: 11 : ?", o: ["121", "88", "144", "100"], c: 0, e: "8² = 64, so 11² = 121." },
  { t: "Classification", d: "MEDIUM", q: "Find the odd one out: Copper, Iron, Gold, Plastic", o: ["Plastic", "Copper", "Iron", "Gold"], c: 0, e: "Plastic is not a metal; the others are metals." },
  { t: "Blood Relations", d: "HARD", q: "Introducing a man, a woman said, 'He is the son of the woman who is the mother of my husband.' How is the man related to the woman?", o: ["Brother-in-law", "Husband", "Father-in-law", "Son"], c: 0, e: "Mother of her husband = mother-in-law; her son is the woman's brother-in-law." },
  { t: "Direction Sense", d: "EXPERT", q: "A person starts facing East, turns 90° clockwise, then 90° anticlockwise, and finally 180°. Which direction is the person facing now?", o: ["West", "East", "North", "South"], c: 0, e: "East → South → East → (180°) West." },
  { t: "Ranking & Order", d: "HARD", q: "In a class, B is 7th from the top and D is 7th from the bottom. If there are 3 students between B and D, how many students are there in the class?", o: ["17", "14", "16", "18"], c: 0, e: "7 (above B incl. B) + 3 (between) + 7 (D and below) = 17." },
  { t: "Calendar", d: "HARD", q: "If 1st March is a Monday in a non-leap year, what day of the week is 1st April of the same year?", o: ["Thursday", "Wednesday", "Friday", "Tuesday"], c: 0, e: "March has 31 days → 31 mod 7 = 3 → Monday + 3 = Thursday." },
  { t: "Letter Series", d: "MEDIUM", q: "Find the next term: DF, GI, JL, ?", o: ["MO", "MN", "NO", "LO"], c: 0, e: "First letters D,G,J,M (+3); second letters F,I,L,O (+3) → MO." },
  { t: "Mathematical Operations", d: "HARD", q: "If '+' means '×', '−' means '+', '×' means '÷' and '÷' means '−', then 8 + 2 − 4 × 2 ÷ 3 = ?", o: ["15", "13", "17", "12"], c: 0, e: "8×2 + 4÷2 − 3 = 16 + 2 − 3 = 15." },
  { t: "Syllogism", d: "EXPERT", q: "Statements: No student is lazy. All lazy people are poor. Conclusions: I. No student is poor. II. Some poor are lazy. Which conclusion(s) follow?", o: ["Only II follows", "Only I follows", "Both follow", "Neither follows"], c: 0, e: "'All lazy are poor' gives 'some poor are lazy' (II). I is not established." },
  { t: "Letter Series", d: "MEDIUM", q: "Find the next term: Z, Y, X, W, V, ?", o: ["U", "T", "S", "W"], c: 0, e: "Reverse alphabetical order → after V comes U." },
  { t: "Coding-Decoding", d: "HARD", q: "If 'CAB' is coded as 'XZY' (each letter replaced by its opposite), how is 'FED' coded?", o: ["UVW", "UWV", "VUW", "TVW"], c: 0, e: "Opposite letters: F→U, E→V, D→W → UVW." },
];

const ENGLISH = [
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: ABANDON", o: ["Forsake", "Adopt", "Keep", "Abound"], c: 0, e: "Abandon = to give up → forsake. 'Adopt' is the opposite trap." },
  { t: "Synonyms", d: "MEDIUM", q: "Select the most appropriate synonym of: RIGID", o: ["Stiff", "Flexible", "Soft", "Ragged"], c: 0, e: "Rigid = not bending → stiff. 'Ragged' is a sound-alike trap." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: PROSPERITY", o: ["Adversity", "Wealth", "Success", "Fortune"], c: 0, e: "Prosperity = success/wealth; antonym adversity. The rest are synonyms." },
  { t: "Antonyms", d: "MEDIUM", q: "Select the most appropriate antonym of: ACCEPT", o: ["Reject", "Receive", "Agree", "Approve"], c: 0, e: "Accept; antonym reject. The rest are synonyms." },
  { t: "One Word Substitution", d: "MEDIUM", q: "One-word substitution: 'A person who studies plants'", o: ["Botanist", "Zoologist", "Geologist", "Biologist"], c: 0, e: "A botanist studies plants; a zoologist studies animals (trap)." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A speech or piece of writing in praise of a person who has died'", o: ["Eulogy", "Elegy", "Epitaph", "Obituary"], c: 0, e: "A eulogy praises the deceased; an elegy is a mournful poem (trap)." },
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
  console.log(`Inserted ${insertedIds.size} new tricky questions (of ${qRows.length} attempted; rest duplicates).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
