// Tricky batch #11 — QUANT & REASONING heavy. All NEW concepts. Hand-verified.
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
  { t: "Mensuration", d: "HARD", q: "The length of the tangent drawn from a point 13 cm away from the centre of a circle of radius 5 cm is:", o: ["12 cm", "8 cm", "10 cm", "9 cm"], c: 0, e: "Tangent = √(13² − 5²) = √144 = 12 cm." },
  { t: "Number System", d: "MEDIUM", q: "Find the sum of the first 20 odd natural numbers.", o: ["400", "420", "380", "441"], c: 0, e: "Sum of first n odd numbers = n² = 20² = 400." },
  { t: "Mensuration", d: "HARD", q: "In a cyclic quadrilateral ABCD, angle A = 110°. What is the measure of angle C?", o: ["70°", "110°", "90°", "80°"], c: 0, e: "Opposite angles of a cyclic quadrilateral are supplementary → 180° − 110° = 70°." },
  { t: "Pipes & Cisterns", d: "EXPERT", q: "Two pipes A and B can fill a tank in 36 and 45 minutes respectively. Both are opened together, and after some time A is closed; the tank is full in 30 minutes total. After how many minutes was A closed?", o: ["12 minutes", "10 minutes", "15 minutes", "8 minutes"], c: 0, e: "B in 30 min fills 30/45 = 2/3; remaining 1/3 by A → t/36 = 1/3 → t = 12 min." },
  { t: "Ratio & Proportion", d: "HARD", q: "The third proportional to 9 and 12 is:", o: ["16", "15", "18", "10.5"], c: 0, e: "Third proportional = 12²/9 = 144/9 = 16." },
  { t: "Ratio & Proportion", d: "MEDIUM", q: "The mean proportional between 4 and 9 is:", o: ["6", "6.5", "13", "36"], c: 0, e: "Mean proportional = √(4×9) = √36 = 6." },
  { t: "Simple Interest", d: "HARD", q: "A sum of money doubles itself in 10 years at simple interest. What is the rate of interest per annum?", o: ["10%", "12%", "8%", "5%"], c: 0, e: "SI = P in 10 yr → rate = 100/10 = 10%." },
  { t: "Partnership", d: "EXPERT", q: "A and B start a business with ₹3000 and ₹4000. After 4 months, A invests ₹2000 more. Find the ratio of their profits at the end of the year.", o: ["13 : 12", "3 : 4", "5 : 6", "1 : 1"], c: 0, e: "A = 3000×4 + 5000×8 = 52000; B = 4000×12 = 48000 → 13 : 12." },
  { t: "Ratio & Proportion", d: "HARD", q: "If a : b = 3 : 4 and b : c = 8 : 9, then a : b : c is:", o: ["6 : 8 : 9", "3 : 4 : 9", "3 : 8 : 9", "6 : 4 : 9"], c: 0, e: "a:b = 6:8, b:c = 8:9 → 6 : 8 : 9." },
  { t: "Mensuration", d: "MEDIUM", q: "Find the area of a trapezium whose parallel sides are 12 cm and 20 cm and the distance between them is 5 cm.", o: ["80 cm²", "100 cm²", "70 cm²", "160 cm²"], c: 0, e: "Area = ½(12+20)×5 = ½×32×5 = 80 cm²." },
  { t: "Trigonometry", d: "EXPERT", q: "The angles of elevation of the top of a tower from two points at distances 4 m and 9 m from its base (on the same line) are complementary. Find the height of the tower.", o: ["6 m", "5 m", "6.5 m", "13 m"], c: 0, e: "Height = √(4×9) = √36 = 6 m." },
  { t: "Algebra", d: "HARD", q: "If x = √7 − √6, then the value of (x + 1/x) is:", o: ["2√7", "2√6", "√7", "2"], c: 0, e: "1/x = √7 + √6 → x + 1/x = 2√7." },
  { t: "Profit and Loss", d: "EXPERT", q: "A shopkeeper sells an article at 10% profit. Had he bought it for 10% less and sold it for ₹2 more, he would have gained 25%. Find the cost price.", o: ["₹80", "₹100", "₹75", "₹90"], c: 0, e: "0.9x×1.25 = 1.1x + 2 → 1.125x − 1.1x = 2 → 0.025x = 2 → x = ₹80." },
  { t: "Simple Interest", d: "MEDIUM", q: "Find the simple interest on ₹2000 at 5% per annum for 3 years.", o: ["₹300", "₹250", "₹350", "₹200"], c: 0, e: "SI = 2000×5×3/100 = ₹300." },
  { t: "Time, Speed & Distance", d: "HARD", q: "A train running at 41 km/h crosses a man walking in the same direction at 5 km/h in 10 seconds. Find the length of the train.", o: ["100 m", "120 m", "90 m", "110 m"], c: 0, e: "Relative speed 36 km/h = 10 m/s → length = 10×10 = 100 m." },
  { t: "Mensuration", d: "EXPERT", q: "If the radius of a sphere is increased by 50%, by what percent does its volume increase?", o: ["237.5%", "150%", "125%", "337.5%"], c: 0, e: "1.5³ = 3.375 → 237.5% increase." },
];

const REASONING = [
  { t: "Number Series", d: "HARD", q: "Find the next term: 2, 5, 10, 17, 26, 37, ?", o: ["50", "48", "52", "46"], c: 0, e: "Differences 3,5,7,9,11,13 → 37 + 13 = 50." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 1, 8, 27, 64, 125, ?", o: ["216", "196", "150", "225"], c: 0, e: "Perfect cubes → 6³ = 216." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 3, 4, 8, 17, 33, ?", o: ["58", "56", "60", "54"], c: 0, e: "Differences are squares 1,4,9,16 → next 25 → 33 + 25 = 58." },
  { t: "Analogy", d: "MEDIUM", q: "Triangle : 3 :: Pentagon : ?", o: ["5", "6", "4", "8"], c: 0, e: "A triangle has 3 sides; a pentagon has 5." },
  { t: "Analogy", d: "HARD", q: "DEF : 456 :: PQR : ?", o: ["16 17 18", "15 16 17", "17 18 19", "16 18 20"], c: 0, e: "D,E,F = 4,5,6; P,Q,R = 16,17,18." },
  { t: "Classification", d: "MEDIUM", q: "Find the odd one out: BD, FH, JL, MN", o: ["MN", "BD", "FH", "JL"], c: 0, e: "BD, FH, JL have a gap of 2 letters; MN has a gap of 1." },
  { t: "Coding-Decoding", d: "HARD", q: "If 'DOG' = 26 and 'CAT' = 24 (sum of letter positions), then 'COW' = ?", o: ["41", "38", "40", "45"], c: 0, e: "C(3)+O(15)+W(23) = 41." },
  { t: "Blood Relations", d: "HARD", q: "A is the mother of B. B is the sister of C. C is the son of D. How is D related to A?", o: ["Husband", "Brother", "Father", "Son"], c: 0, e: "A is mother and D is father of B and C → D is A's husband." },
  { t: "Direction Sense", d: "EXPERT", q: "Two friends start from the same point. One walks 3 km East then 4 km North; the other walks 4 km West then 3 km South. What is the distance between them?", o: ["7√2 km", "5 km", "10 km", "7 km"], c: 0, e: "Positions (3,4) and (−4,−3) → distance √(7²+7²) = 7√2 km." },
  { t: "Ranking & Order", d: "HARD", q: "In a row of 50 students, A is 20th from the left and B is 25th from the right. How many students are there between A and B?", o: ["5", "6", "4", "7"], c: 0, e: "50 − 20 − 25 = 5 students between them." },
  { t: "Calendar", d: "MEDIUM", q: "If today is Wednesday, what day of the week will it be after 100 days?", o: ["Friday", "Thursday", "Saturday", "Monday"], c: 0, e: "100 mod 7 = 2 → Wednesday + 2 = Friday." },
  { t: "Clocks", d: "MEDIUM", q: "What is the angle between the hands of a clock at 6:00?", o: ["180°", "90°", "120°", "150°"], c: 0, e: "At 6:00 the hands are exactly opposite → 180°." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If a @ b = a² − b² and b # c = b + c, then the value of (5 @ 3) # 4 is:", o: ["20", "18", "16", "24"], c: 0, e: "5@3 = 25 − 9 = 16; 16#4 = 16 + 4 = 20." },
  { t: "Syllogism", d: "HARD", q: "Statements: All pens are blue. Some blue are red. Conclusions: I. Some pens are red. II. Some red are blue. Which conclusion(s) follow?", o: ["Only II follows", "Only I follows", "Both follow", "Neither follows"], c: 0, e: "'Some blue are red' gives 'some red are blue' (II). I is not guaranteed." },
  { t: "Letter Series", d: "MEDIUM", q: "Find the next term: C, E, G, I, ?", o: ["K", "J", "L", "H"], c: 0, e: "Alternate letters (+2) → I + 2 = K." },
  { t: "Coding-Decoding", d: "HARD", q: "Which of these letters looks the same as its mirror image (reflected left-right)?", o: ["A", "B", "F", "G"], c: 0, e: "A is symmetric about a vertical axis; B, F and G are not." },
];

const ENGLISH = [
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: WEARY", o: ["Tired", "Alert", "Wary", "Wealthy"], c: 0, e: "Weary = tired. 'Wary' is a sound-alike trap." },
  { t: "Synonyms", d: "MEDIUM", q: "Select the most appropriate synonym of: ROBUST", o: ["Strong", "Weak", "Rude", "Rusty"], c: 0, e: "Robust = strong and healthy." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: HUMBLE", o: ["Arrogant", "Modest", "Meek", "Simple"], c: 0, e: "Humble = modest; antonym arrogant. The rest are synonyms." },
  { t: "Antonyms", d: "MEDIUM", q: "Select the most appropriate antonym of: CONDEMN", o: ["Praise", "Blame", "Criticise", "Accuse"], c: 0, e: "Condemn = criticise harshly; antonym praise." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A form of government in which one person has unlimited power'", o: ["Autocracy", "Democracy", "Oligarchy", "Theocracy"], c: 0, e: "Autocracy = rule by one person with absolute power." },
  { t: "One Word Substitution", d: "MEDIUM", q: "One-word substitution: 'A person who mends shoes'", o: ["Cobbler", "Carpenter", "Blacksmith", "Tailor"], c: 0, e: "A cobbler repairs shoes." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To make ends meet'", o: ["To manage within one's income", "To finish a task", "To meet someone", "To join two ends"], c: 0, e: "To earn just enough to cover one's expenses." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'At the eleventh hour'", o: ["At the last possible moment", "Late at night", "Very early", "Exactly on time"], c: 0, e: "At the last moment before a deadline." },
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
  console.log(`Batch 11 inserted ${insertedIds.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
