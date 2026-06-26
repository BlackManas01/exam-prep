// Hand-authored TRICKY batch #2 — new distinct templates, each answer verified.
// Tagged across MEDIUM / HARD / EXPERT so they populate every level (Real pulls
// HARD+EXPERT mostly, with some MEDIUM). ssc-cgl-tier1 listed FIRST (priority).
//   node scripts/add-tricky2.cjs            (insert)
//   node scripts/add-tricky2.cjs --verify   (print only)
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

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
  { t: "Profit and Loss", d: "MEDIUM", q: "By selling 33 articles, a trader gains the cost price of 11 articles. What is his profit percent?", o: ["33⅓%", "30%", "25%", "11%"], c: 0, e: "Gain = 11/33 = 1/3 = 33⅓%." },
  { t: "Profit and Loss", d: "HARD", q: "A man sells an article at a loss of 10%. Had he sold it for ₹90 more, he would have gained 8%. What is the cost price?", o: ["₹500", "₹450", "₹600", "₹550"], c: 0, e: "The ₹90 equals 18% of CP → CP = 90/0.18 = ₹500." },
  { t: "Compound Interest", d: "HARD", q: "The simple interest on a sum for 3 years at 8% per annum is ₹2400. Find the compound interest on the same sum at the same rate for 2 years.", o: ["₹1664", "₹1600", "₹1728", "₹1632"], c: 0, e: "SI/yr = 800 → P = 10000; CI = 10000(1.08²−1) = ₹1664." },
  { t: "Profit and Loss", d: "MEDIUM", q: "If the cost price of 12 articles equals the selling price of 9 articles, what is the profit percent?", o: ["33⅓%", "25%", "30%", "20%"], c: 0, e: "Profit = (12−9)/9 = 1/3 = 33⅓%." },
  { t: "Boats & Streams", d: "HARD", q: "A man rows 9 km/h in still water. It takes him twice as long to row up as to row down a river. Find the speed of the stream.", o: ["3 km/h", "4.5 km/h", "2 km/h", "6 km/h"], c: 0, e: "Down = 2×Up → 9+s = 2(9−s) → 3s = 9 → s = 3 km/h." },
  { t: "Time, Speed & Distance", d: "EXPERT", q: "Two trains start at the same time from stations A and B towards each other. After crossing, they take 9 hours and 16 hours respectively to reach their destinations. Find the ratio of their speeds.", o: ["4 : 3", "3 : 4", "16 : 9", "2 : 1"], c: 0, e: "Speed ratio = √16 : √9 = 4 : 3." },
  { t: "Compound Interest", d: "HARD", q: "A sum of money amounts to ₹2420 in 2 years and ₹2662 in 3 years at compound interest. Find the rate of interest per annum.", o: ["10%", "12%", "8%", "11%"], c: 0, e: "Interest in 3rd year = 242 on 2420 → 242/2420 = 10%." },
  { t: "Averages", d: "MEDIUM", q: "The average of 5 consecutive odd numbers is 27. What is the largest of these numbers?", o: ["31", "29", "33", "35"], c: 0, e: "Middle = 27 → 23,25,27,29,31 → largest 31." },
  { t: "Ages", d: "HARD", q: "The ratio of the present ages of A and B is 5 : 7. Four years ago the ratio was 2 : 3. What is B's present age?", o: ["28 years", "20 years", "35 years", "24 years"], c: 0, e: "(5x−4)/(7x−4)=2/3 → x=4 → B = 28." },
  { t: "Time & Work", d: "EXPERT", q: "A and B together can do a work in 12 days, B and C in 15 days, and C and A in 20 days. In how many days can all three together complete it?", o: ["10 days", "12 days", "9 days", "8 days"], c: 0, e: "2(a+b+c)=1/12+1/15+1/20=1/5 → a+b+c=1/10 → 10 days." },
  { t: "Time & Work", d: "HARD", q: "A can do a piece of work in 15 days and B in 10 days. They start together but A leaves 5 days before the work is completed. In how many days was the work completed?", o: ["8 days", "9 days", "7 days", "10 days"], c: 0, e: "(T−5)/15 + T/10 = 1 → 2(T−5)+3T=30 → 5T=40 → T=8." },
  { t: "Time, Speed & Distance", d: "MEDIUM", q: "A train 180 m long passes a man running at 9 km/h in the opposite direction in 6 seconds. Find the speed of the train.", o: ["99 km/h", "108 km/h", "90 km/h", "117 km/h"], c: 0, e: "Relative speed = 180/6 = 30 m/s = 108 km/h → train = 108−9 = 99 km/h." },
  { t: "Number System", d: "EXPERT", q: "The HCF and LCM of two numbers are 12 and 144 respectively. If one of the numbers is 36, find the other.", o: ["48", "44", "60", "72"], c: 0, e: "Product = HCF×LCM = 12×144; other = 1728/36 = 48." },
  { t: "Number System", d: "HARD", q: "A number when divided by 296 leaves a remainder 75. When the same number is divided by 37, what is the remainder?", o: ["1", "11", "0", "37"], c: 0, e: "296 = 8×37, so 75 mod 37 = 75−74 = 1." },
  { t: "Number System", d: "MEDIUM", q: "Find the least number which when divided by 12, 16 and 24 leaves a remainder of 5 in each case.", o: ["53", "48", "29", "55"], c: 0, e: "LCM(12,16,24)=48 → 48+5 = 53." },
  { t: "Number System", d: "HARD", q: "Three bells toll at intervals of 9, 12 and 15 minutes respectively. If they toll together at 8:00 a.m., at what time will they next toll together?", o: ["11:00 a.m.", "10:30 a.m.", "9:30 a.m.", "11:30 a.m."], c: 0, e: "LCM = 180 min = 3 hours → 11:00 a.m." },
  { t: "Algebra", d: "EXPERT", q: "If x² + y² = 25 and xy = 12, then the value of (x + y) is:", o: ["7", "5", "49", "13"], c: 0, e: "(x+y)² = x²+y²+2xy = 25+24 = 49 → 7." },
  { t: "Algebra", d: "HARD", q: "If a + 1/a = 2, then the value of a¹⁰⁰ + 1/a¹⁰⁰ is:", o: ["2", "0", "1", "100"], c: 0, e: "a + 1/a = 2 forces a = 1 → 1 + 1 = 2." },
  { t: "Algebra", d: "HARD", q: "Simplify: (√5 + √3) / (√5 − √3)", o: ["4 + √15", "4 − √15", "8 + √15", "2 + √15"], c: 0, e: "Multiply by (√5+√3): (√5+√3)²/(5−3) = (8+2√15)/2 = 4+√15." },
  { t: "Mensuration", d: "MEDIUM", q: "The angles of a triangle are in the ratio 2 : 3 : 4. What is the measure of the largest angle?", o: ["80°", "90°", "70°", "100°"], c: 0, e: "Total 9 parts = 180° → largest = 4×20° = 80°." },
  { t: "Mensuration", d: "HARD", q: "The perimeter of a rhombus is 52 cm and one of its diagonals is 24 cm. Find its area.", o: ["120 cm²", "240 cm²", "60 cm²", "130 cm²"], c: 0, e: "Side 13, half-diagonals 12 and √(169−144)=5 → diagonals 24 & 10 → area ½×24×10 = 120." },
  { t: "Mensuration", d: "EXPERT", q: "A solid metallic cylinder of radius 6 cm and height 8 cm is melted and recast into a cone of the same radius. Find the height of the cone.", o: ["24 cm", "8 cm", "16 cm", "12 cm"], c: 0, e: "Volume equal: ⅓r²H = r²h → H = 3h = 24 cm." },
  { t: "Trigonometry", d: "HARD", q: "If cosec θ − cot θ = 1/3, then cosec θ + cot θ = ?", o: ["3", "1/3", "1", "9"], c: 0, e: "(cosecθ−cotθ)(cosecθ+cotθ)=cosec²θ−cot²θ=1 → cosecθ+cotθ = 3." },
  { t: "Trigonometry", d: "HARD", q: "If tan θ = 3/4, then the value of (sin θ + cos θ)/(sin θ − cos θ) is:", o: ["−7", "7", "−1", "1/7"], c: 0, e: "Divide by cos θ: (tanθ+1)/(tanθ−1) = (7/4)/(−1/4) = −7." },
  { t: "Trigonometry", d: "EXPERT", q: "If sec θ + tan θ = 2, then sec θ − tan θ = ?", o: ["1/2", "2", "1", "1/4"], c: 0, e: "(secθ+tanθ)(secθ−tanθ)=sec²θ−tan²θ=1 → secθ−tanθ = 1/2." },
  { t: "Profit and Loss", d: "HARD", q: "A shopkeeper allows a discount of 20% on the marked price and still gains 20%. If the cost price is ₹400, find the marked price.", o: ["₹600", "₹560", "₹640", "₹500"], c: 0, e: "SP = 480; MP×0.8 = 480 → MP = ₹600." },
  { t: "Profit and Loss", d: "EXPERT", q: "A man buys 2 articles for ₹1 and sells 3 articles for ₹2. What is his profit or loss percent?", o: ["33⅓% profit", "33⅓% loss", "50% profit", "25% loss"], c: 0, e: "CP/article = ₹0.50, SP/article = ₹0.667 → profit 33⅓%." },
  { t: "Ratio & Proportion", d: "MEDIUM", q: "If 15% of A is equal to 20% of B, then A : B is:", o: ["4 : 3", "3 : 4", "5 : 4", "20 : 15"], c: 0, e: "0.15A = 0.20B → A/B = 20/15 = 4:3." },
  { t: "Percentage", d: "MEDIUM", q: "A shopkeeper first raises the price of an item by 25% and then offers a discount of 25%. What is the net effect on the price?", o: ["6.25% loss", "No change", "6.25% gain", "5% loss"], c: 0, e: "1.25×0.75 = 0.9375 → 6.25% loss." },
  { t: "Profit and Loss", d: "HARD", q: "The marked price of a watch is ₹1600. After two successive discounts it is sold for ₹1224. If the first discount is 10%, find the second discount.", o: ["15%", "12%", "20%", "14%"], c: 0, e: "1600×0.9 = 1440; 1224/1440 = 0.85 → second discount 15%." },
  { t: "Pipes & Cisterns", d: "EXPERT", q: "Pipe A fills a tank in 10 hours and pipe B in 15 hours. Both are opened together, but A is closed after 4 hours. In how much more time will B fill the rest?", o: ["5 hours", "6 hours", "4 hours", "7 hours"], c: 0, e: "In 4 h: 4/10+4/15 = 2/3 filled; remaining 1/3 by B (1/15 per h) → 5 hours." },
  { t: "Ratio & Proportion", d: "HARD", q: "Two numbers are in the ratio 3 : 5. If 9 is subtracted from each, the ratio becomes 12 : 23. Find the smaller number.", o: ["33", "30", "36", "27"], c: 0, e: "(3x−9)/(5x−9)=12/23 → 9x=99 → x=11 → smaller = 33." },
];

const REASONING = [
  { t: "Syllogism", d: "HARD", q: "Statements: All cats are dogs. All dogs are animals. Conclusions: I. All cats are animals. II. Some animals are cats. Which conclusion(s) follow?", o: ["Both I and II follow", "Only I follows", "Only II follows", "Neither follows"], c: 0, e: "All cats→animals (I). Cats exist and are animals, so some animals are cats (II)." },
  { t: "Analogy", d: "MEDIUM", q: "Doctor : Hospital :: Teacher : ?", o: ["School", "Student", "Book", "Class"], c: 0, e: "A doctor works in a hospital; a teacher works in a school." },
  { t: "Coding-Decoding", d: "HARD", q: "If the code for a word is the sum of the positions of its letters, and RED = 27, what is the code for BLUE?", o: ["40", "38", "42", "44"], c: 0, e: "B(2)+L(12)+U(21)+E(5) = 40." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 4, 27, 256, ?", o: ["3125", "625", "729", "3025"], c: 0, e: "Pattern nⁿ: 1¹, 2², 3³, 4⁴, 5⁵ = 3125." },
  { t: "Number Series", d: "HARD", q: "Find the next term: 7, 26, 63, 124, ?", o: ["215", "210", "218", "208"], c: 0, e: "Pattern n³−1: 2³−1, 3³−1, 4³−1, 5³−1, 6³−1 = 215." },
  { t: "Classification", d: "MEDIUM", q: "Find the odd one out: Dog, Cat, Lion, Sparrow", o: ["Sparrow", "Lion", "Cat", "Dog"], c: 0, e: "Sparrow is a bird; the rest are mammals." },
  { t: "Blood Relations", d: "HARD", q: "If 'A + B' means A is the father of B, and 'A × B' means A is the brother of B, then what does 'P + Q × R' mean?", o: ["P is the father of R", "P is the brother of R", "P is the uncle of R", "P is the son of R"], c: 0, e: "P is father of Q, Q is brother of R → P is the father of R." },
  { t: "Direction Sense", d: "EXPERT", q: "A man walks 3 km North, 4 km East, 3 km North and 4 km East. How far is he from the starting point?", o: ["10 km", "14 km", "7 km", "8 km"], c: 0, e: "Net North 6, net East 8 → √(36+64) = 10 km." },
  { t: "Ranking & Order", d: "MEDIUM", q: "In a class of 35 students, Rahul ranks 12th from the top. What is his rank from the bottom?", o: ["24th", "23rd", "25th", "22nd"], c: 0, e: "35 − 12 + 1 = 24th from bottom." },
  { t: "Calendar", d: "HARD", q: "What day of the week was 15 August 1947 (India's Independence Day)?", o: ["Friday", "Thursday", "Saturday", "Wednesday"], c: 0, e: "15 August 1947 was a Friday." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: Z1A, Y2B, X3C, ?", o: ["W4D", "W3D", "V4D", "W4E"], c: 0, e: "Letters from end (Z,Y,X,W), numbers 1,2,3,4, letters from start (A,B,C,D) → W4D." },
  { t: "Coding-Decoding", d: "MEDIUM", q: "In a certain code, MONDAY is written as NPOEBZ. How is FRIDAY written in that code?", o: ["GSJEBZ", "GSJEBY", "GSIEBZ", "GTJEBZ"], c: 0, e: "Each letter +1: F→G, R→S, I→J, D→E, A→B, Y→Z → GSJEBZ." },
  { t: "Coding-Decoding", d: "HARD", q: "In a certain language, 'pit dar tol' means 'you are good' and 'dar nil sim' means 'they are bad'. Which word means 'are'?", o: ["dar", "pit", "nil", "tol"], c: 0, e: "'dar' is the only word common to both sentences, and 'are' is the common word." },
  { t: "Analogy", d: "HARD", q: "11 : 121 :: 13 : ?", o: ["169", "144", "156", "196"], c: 0, e: "121 = 11², so 13² = 169." },
  { t: "Letter Series", d: "MEDIUM", q: "Find the next term: AZ, BY, CX, ?", o: ["DW", "DV", "EW", "DX"], c: 0, e: "First letters A,B,C,D; second letters Z,Y,X,W → DW." },
  { t: "Mathematical Operations", d: "HARD", q: "If 3 * 4 = 25 and 4 * 5 = 41, then 5 * 6 = ?", o: ["61", "59", "63", "55"], c: 0, e: "Pattern a*b = a² + b²: 5² + 6² = 61." },
  { t: "Clocks", d: "EXPERT", q: "When a clock shows 6 o'clock, the minute hand points East. In which direction does the hour hand point?", o: ["West", "East", "North", "South"], c: 0, e: "The face is rotated so 12 (minute hand) = East; 6 (hour hand) is opposite → West." },
  { t: "Ranking & Order", d: "HARD", q: "In a row, P is 7th from the left and Q is 9th from the right. If they interchange positions, P becomes 12th from the left. How many people are in the row?", o: ["20", "18", "21", "19"], c: 0, e: "After swap P takes Q's position = 12th from left → Q was 12th from left and 9th from right → total = 12+9−1 = 20." },
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
    for (const [label, list] of [["QUANT", QUANT], ["REASONING", REASONING]]) {
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
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const insertedIds = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  const liveOpts = oRows.filter((o) => insertedIds.has(o.questionId));
  await chunk(liveOpts, 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Inserted ${insertedIds.size} new tricky questions (of ${qRows.length} attempted; rest duplicates).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
