// Hand-authored "trap" questions — genuinely tricky, exceed-the-real-exam SSC CGL
// level, where the obvious approach gives a WRONG (trap) answer. Every answer is
// hand-verified correct. Each question is a DISTINCT concept/twist (not a numeric
// clone), inserted once per target exam (source="MANUAL", survives reseeds).
//
//   node scripts/add-tricky.cjs            (insert)
//   node scripts/add-tricky.cjs --verify   (print all, no DB write)
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

// ---------------- QUANT TRAPS (each verified) ----------------
const QUANT = [
  { t: "Percentage", d: "HARD", s: "A's income is 25% more than B's income. By what percent is B's income less than A's?",
    o: ["20%", "25%", "16⅔%", "33⅓%"], c: 0, e: "A=1.25B. B is less by 0.25B/1.25B = 1/5 = 20%. The 25% is the trap." },
  { t: "Percentage", d: "HARD", s: "The price of rice rises by 25%. By what percent must a household cut its consumption so that the money spent on rice is unchanged?",
    o: ["20%", "25%", "15%", "16⅔%"], c: 0, e: "Reduction % = 25/(100+25) = 20%." },
  { t: "Profit and Loss", d: "HARD", s: "A shopkeeper offers two successive discounts of 20% and 25% on an article marked ₹2000. What is the selling price?",
    o: ["₹1200", "₹1100", "₹1300", "₹1400"], c: 0, e: "2000×0.80×0.75 = ₹1200. Adding 20%+25%=45% (₹1100) is the trap." },
  { t: "Percentage", d: "HARD", s: "The length of a rectangle is increased by 30% and its breadth is decreased by 30%. What is the percentage change in area?",
    o: ["9% decrease", "No change", "6% decrease", "9% increase"], c: 0, e: "1.3×0.7 = 0.91 → 9% decrease. 'No change' is the trap." },
  { t: "Averages", d: "EXPERT", s: "The average of 11 numbers is 60. The average of the first six is 58 and that of the last six is 63. What is the sixth number?",
    o: ["66", "60", "61", "72"], c: 0, e: "6×58 + 6×63 − 11×60 = 348+378−660 = 66 (the sixth is counted in both groups)." },
  { t: "Boats & Streams", d: "HARD", s: "A boat travels 36 km downstream in 3 hours and returns the same 36 km upstream in 6 hours. Find the speed of the stream.",
    o: ["3 km/h", "4 km/h", "2 km/h", "6 km/h"], c: 0, e: "Down=12, Up=6 km/h. Stream = (12−6)/2 = 3 km/h." },
  { t: "Ratio & Proportion", d: "HARD", s: "If a : b = 3 : 4 and b : c = 6 : 7, then a : b : c is:",
    o: ["9 : 12 : 14", "3 : 4 : 7", "9 : 12 : 7", "3 : 24 : 7"], c: 0, e: "Make b common (LCM 12): a:b=9:12, b:c=12:14 → 9:12:14." },
  { t: "Pipes & Cisterns", d: "HARD", s: "Pipe A fills a tank in 12 minutes and pipe B empties it in 18 minutes. If both are opened together on an empty tank, how long will it take to fill?",
    o: ["36 minutes", "30 minutes", "24 minutes", "45 minutes"], c: 0, e: "Net = 1/12 − 1/18 = 1/36 per minute → 36 minutes." },
  { t: "Compound Interest", d: "EXPERT", s: "The difference between the compound interest and the simple interest on a certain sum for 2 years at 10% per annum is ₹50. Find the sum.",
    o: ["₹5000", "₹2500", "₹10000", "₹4000"], c: 0, e: "Difference = P(r/100)² = P×0.01 = 50 → P = ₹5000." },
  { t: "Mixture & Alligation", d: "EXPERT", s: "From a 40-litre vessel full of milk, 8 litres are drawn out and replaced with water. This operation is performed twice in all. How much milk is left in the vessel?",
    o: ["25.6 litres", "32 litres", "28.8 litres", "24 litres"], c: 0, e: "40×(1−8/40)² = 40×0.8² = 40×0.64 = 25.6 L." },
  { t: "Partnership", d: "HARD", s: "A invests ₹8000 for 6 months and B invests ₹6000 for 8 months in a business. If the total profit is ₹960, what is B's share?",
    o: ["₹480", "₹540", "₹420", "₹360"], c: 0, e: "Capital×time: A=48000, B=48000 → equal → B gets ₹480 (B investing less money is the trap)." },
  { t: "Trigonometry", d: "HARD", s: "If sinθ + cosθ = √2, then the value of sinθ · cosθ is:",
    o: ["½", "1", "√2/2", "0"], c: 0, e: "Square: 1 + 2sinθcosθ = 2 → sinθcosθ = ½." },
  { t: "Number System", d: "HARD", s: "What is the remainder when 2¹⁰⁰ is divided by 7?",
    o: ["2", "4", "1", "6"], c: 0, e: "2³ ≡ 1 (mod 7); 100 = 3×33 + 1 → 2¹⁰⁰ ≡ 2¹ = 2." },
  { t: "Profit and Loss", d: "HARD", s: "A dishonest shopkeeper sells goods at their cost price but uses a weight of 900 g in place of 1 kg. What is his profit percent?",
    o: ["11⅑%", "10%", "9 1/11%", "12½%"], c: 0, e: "Gain = 100/900 = 11.11%. Using 10% (error/true weight) is the trap." },
  { t: "Ages", d: "HARD", s: "The ratio of the present ages of A and B is 4 : 5. Six years from now the ratio becomes 5 : 6. What is A's present age?",
    o: ["24 years", "20 years", "30 years", "18 years"], c: 0, e: "(4x+6)/(5x+6)=5/6 → 24x+36 = 25x+30 → x=6 → A = 24." },
  { t: "Clocks", d: "HARD", s: "What is the angle between the hour hand and the minute hand of a clock at 3:40?",
    o: ["130°", "140°", "120°", "150°"], c: 0, e: "|30×3 − 5.5×40| = |90 − 220| = 130°." },
  { t: "Time, Speed & Distance", d: "HARD", s: "A train 150 m long crosses a platform 350 m long in 20 seconds. What is the speed of the train?",
    o: ["90 km/h", "72 km/h", "100 km/h", "80 km/h"], c: 0, e: "(150+350)/20 = 25 m/s = 90 km/h." },
  { t: "Time, Speed & Distance", d: "HARD", s: "Two trains of lengths 120 m and 180 m run in opposite directions at 54 km/h and 36 km/h. How long do they take to cross each other?",
    o: ["12 seconds", "10 seconds", "15 seconds", "9 seconds"], c: 0, e: "Relative speed 90 km/h = 25 m/s; total length 300 m → 12 s." },
  { t: "Time & Work", d: "EXPERT", s: "A can do a piece of work in 9 days and B in 18 days. They work on alternate days starting with A. In how many days will the work be completed?",
    o: ["12 days", "11 days", "13 days", "12½ days"], c: 0, e: "2-day cycle = 1/9+1/18 = 1/6. After 10 days = 5/6; day 11 A adds 1/9; day 12 B finishes → 12 days." },
  { t: "Time, Speed & Distance", d: "HARD", s: "A car covers the first half of a distance at 40 km/h and the second half at 60 km/h. What is the average speed for the whole journey?",
    o: ["48 km/h", "50 km/h", "52 km/h", "45 km/h"], c: 0, e: "Average = 2×40×60/(40+60) = 48 km/h (50 is the trap)." },
  { t: "Percentage", d: "HARD", s: "In an election between two candidates, the winner secured 60% of the votes and won by 1600 votes. What was the total number of votes polled?",
    o: ["8000", "6400", "9600", "4000"], c: 0, e: "Margin = 60%−40% = 20% of total = 1600 → total = 8000." },
  { t: "Mixture & Alligation", d: "EXPERT", s: "Two vessels contain milk and water in the ratios 3 : 2 and 7 : 3. Equal volumes from each are mixed together. Find the ratio of milk to water in the final mixture.",
    o: ["13 : 7", "10 : 7", "5 : 3", "7 : 13"], c: 0, e: "Milk = 3/5 + 7/10 = 13/10 over 2 units → milk:water = 13:7." },
  { t: "Mensuration", d: "HARD", s: "The sides of a triangle are 7 cm, 24 cm and 25 cm. Find the radius of its inscribed circle.",
    o: ["3 cm", "4 cm", "3.5 cm", "6 cm"], c: 0, e: "Right triangle (7²+24²=25²): area 84, s=28, r = area/s = 84/28 = 3 cm." },
  { t: "Algebra", d: "HARD", s: "If x + 1/x = 3, then the value of x³ + 1/x³ is:",
    o: ["18", "27", "9", "21"], c: 0, e: "(x+1/x)³ = x³+1/x³ + 3(x+1/x) → 27 = X + 9 → X = 18." },
  { t: "Algebra", d: "EXPERT", s: "If x = 7 + 4√3, then the value of (√x + 1/√x) is:",
    o: ["4", "2√3", "2", "7"], c: 0, e: "x = (2+√3)²; √x = 2+√3, 1/√x = 2−√3 → sum = 4." },
  { t: "Number System", d: "EXPERT", s: "The product of two numbers is 2160 and their HCF is 12. How many such pairs of numbers are possible?",
    o: ["2", "3", "1", "4"], c: 0, e: "Numbers 12a,12b with a,b coprime: 144ab=2160 → ab=15 → coprime pairs (1,15),(3,5) → 2 pairs." },
  { t: "Number System", d: "HARD", s: "Find the remainder when 7⁷⁷ is divided by 100.",
    o: ["7", "43", "49", "1"], c: 0, e: "7⁴ = 2401 ≡ 1 (mod 100); 77 = 4×19+1 → 7⁷⁷ ≡ 7." },
  { t: "Mensuration", d: "HARD", s: "A solid sphere of radius 6 cm is melted and recast into small spheres each of radius 2 cm. How many small spheres are formed?",
    o: ["27", "9", "3", "18"], c: 0, e: "Number = (6/2)³ = 27 (volume scales with the cube of radius)." },
  { t: "Percentage", d: "HARD", s: "The population of a town rises by 10% in the first year and falls by 10% in the next. If the present population is 49500, what was it two years ago?",
    o: ["50000", "49500", "45000", "55000"], c: 0, e: "P×1.1×0.9 = 49500 → P×0.99 = 49500 → P = 50000." },
  { t: "Profit and Loss", d: "HARD", s: "A trader marks his goods 40% above cost price and then allows a discount of 10%. What is his profit percent?",
    o: ["26%", "30%", "25%", "28%"], c: 0, e: "1.40×0.90 = 1.26 → 26% (40−10=30% is the trap)." },
  { t: "Time, Speed & Distance", d: "HARD", s: "Without stoppages a bus runs at 60 km/h, and with stoppages it runs at 45 km/h. For how many minutes per hour does the bus stop?",
    o: ["15 minutes", "12 minutes", "20 minutes", "10 minutes"], c: 0, e: "Lost distance per hour 15 km at 60 km/h → 15 min." },
  { t: "Time & Work", d: "EXPERT", s: "A contractor employs 40 men to finish a work in 40 days. After 16 days, 8 men leave the job. How many extra days beyond the schedule will the work now take?",
    o: ["6 days", "5 days", "8 days", "4 days"], c: 0, e: "Total 1600 man-days; 640 done in 16 days; 960 left with 32 men = 30 days → 46 total → 6 days extra." },
  { t: "Trigonometry", d: "EXPERT", s: "The angle of elevation of the top of a tower from a point on the ground is 30°. On walking 40 m towards the tower the angle becomes 60°. Find the height of the tower.",
    o: ["20√3 m", "40√3 m", "20 m", "40 m"], c: 0, e: "h√3 − h/√3 = 40 → 2h/√3 = 40 → h = 20√3 m." },
  { t: "Algebra", d: "HARD", s: "If a + b = 7 and a² + b² = 29, then the value of ab is:",
    o: ["10", "12", "20", "9"], c: 0, e: "(a+b)² = a²+b²+2ab → 49 = 29 + 2ab → ab = 10." },
  { t: "Simplification", d: "HARD", s: "Simplify: 12 ÷ 4 × 3 + 6 − 2",
    o: ["13", "7", "1", "11"], c: 0, e: "BODMAS, left-to-right for ÷ and ×: 3×3 = 9, +6 = 15, −2 = 13." },
  { t: "Percentage", d: "HARD", s: "If the radius of a circle is increased by 20%, by what percent does its area increase?",
    o: ["44%", "40%", "20%", "21%"], c: 0, e: "1.2² = 1.44 → 44% increase (40% is the trap)." },
  { t: "Number System", d: "HARD", s: "How many trailing zeros are there at the end of 25! (factorial of 25)?",
    o: ["6", "5", "4", "7"], c: 0, e: "⌊25/5⌋ + ⌊25/25⌋ = 5 + 1 = 6." },
  { t: "Averages", d: "HARD", s: "The average age of 30 students is 12 years. If the teacher's age is included, the average increases by 1 year. What is the teacher's age?",
    o: ["43 years", "42 years", "31 years", "45 years"], c: 0, e: "New average 13 for 31 people → teacher = 13×31 − 12×30 = 403 − 360 = 43." },
];

const QUANT_CLEAN = QUANT;

// ---------------- REASONING TRAPS (each verified) ----------------
const REASONING = [
  { t: "Blood Relations", d: "HARD", s: "Pointing to a photograph, a man said, \"She is the daughter of my grandfather's only son.\" How is the woman in the photograph related to the man?",
    o: ["Sister", "Mother", "Aunt", "Cousin"], c: 0, e: "Grandfather's only son = the man's father; his daughter = the man's sister." },
  { t: "Direction Sense", d: "HARD", s: "A man walks 10 m North, turns right and walks 10 m, turns right again and walks 10 m, then turns left and walks 10 m. In which direction is he facing now?",
    o: ["East", "West", "North", "South"], c: 0, e: "N → (right) E → (right) S → (left) E. He faces East." },
  { t: "Coding-Decoding", d: "HARD", s: "In a certain code, 'TEACHER' is written as 'VGCEJGT'. How is 'CHILD' written in that code?",
    o: ["EJKNF", "EJKND", "DJKNF", "EIKNF"], c: 0, e: "Each letter shifts +2: C→E, H→J, I→K, L→N, D→F → EJKNF." },
  { t: "Number Series", d: "HARD", s: "Find the next term in the series: 2, 6, 12, 20, 30, ?",
    o: ["42", "40", "36", "44"], c: 0, e: "n(n+1): 1·2, 2·3, 3·4, 4·5, 5·6, 6·7 = 42." },
  { t: "Number Series", d: "EXPERT", s: "Find the next term in the series: 3, 5, 11, 29, 83, ?",
    o: ["245", "239", "251", "240"], c: 0, e: "Each term ×3 − 4: 83×3 − 4 = 245." },
  { t: "Clocks", d: "HARD", s: "How many times in a 12-hour period do the hands of a clock coincide (overlap)?",
    o: ["11", "12", "22", "24"], c: 0, e: "The hands overlap 11 times in 12 hours (once every 65 5/11 minutes)." },
  { t: "Calendar", d: "EXPERT", s: "If 1 January 2008 was a Tuesday, what day of the week was 1 January 2009?",
    o: ["Thursday", "Wednesday", "Friday", "Tuesday"], c: 0, e: "2008 is a leap year (366 days) → 2 odd days → Tuesday + 2 = Thursday." },
  { t: "Ranking & Order", d: "HARD", s: "In a row of 40 students, A is 11th from the left end and B is 15th from the right end. How many students are there between A and B?",
    o: ["14", "13", "15", "12"], c: 0, e: "Positions don't overlap: 40 − (11 + 15) = 14 students between them." },
  { t: "Ages", d: "HARD", s: "A is younger than B by 5 years. If the ratio of their ages is 5 : 6, what is A's age?",
    o: ["25 years", "30 years", "20 years", "35 years"], c: 0, e: "Difference = 1 part = 5 years → A = 5×5 = 25, B = 30." },
  { t: "Direction Sense", d: "HARD", s: "A man starts from a point, walks 5 m East and then 12 m North. How far is he from the starting point?",
    o: ["13 m", "17 m", "7 m", "8.5 m"], c: 0, e: "√(5² + 12²) = √169 = 13 m." },
  { t: "Letter Series", d: "EXPERT", s: "Find the next term in the series: B, E, J, Q, ?",
    o: ["Z", "Y", "X", "W"], c: 0, e: "Positions 2, 5, 10, 17 (add 3, 5, 7, 9) → 26 = Z." },
  { t: "Analogy", d: "HARD", s: "6 : 42 :: 8 : ?",
    o: ["72", "64", "56", "80"], c: 0, e: "6×7 = 42, so 8×9 = 72 (n × (n+1))." },
  { t: "Coding-Decoding", d: "HARD", s: "If 'CAT' = 24 and 'DOG' = 26, then 'COW' = ?",
    o: ["41", "38", "40", "45"], c: 0, e: "Sum of letter positions: C(3)+O(15)+W(23) = 41." },
  { t: "Classification", d: "HARD", s: "Find the odd one out: 121, 144, 169, 200",
    o: ["200", "121", "169", "144"], c: 0, e: "121, 144, 169 are perfect squares (11², 12², 13²); 200 is not." },
  { t: "Mathematical Operations", d: "EXPERT", s: "If '+' means ×, '−' means ÷, '×' means −, and '÷' means +, then 16 ÷ 4 − 2 × 8 = ?",
    o: ["10", "12", "8", "14"], c: 0, e: "Translate: 16 + 4 ÷ 2 − 8 = 16 + 2 − 8 = 10." },
  { t: "Seating Arrangement", d: "HARD", s: "Five friends P, Q, R, S and T sit in a row. P is to the left of Q but to the right of T. R is at the extreme right end. S sits between Q and R. Who sits in the middle?",
    o: ["Q", "P", "S", "T"], c: 0, e: "Order: T, P, Q, S, R → the middle (3rd) seat is Q." },
  { t: "Cubes & Dice", d: "EXPERT", s: "A cube painted on all its faces is cut into 64 identical smaller cubes. How many of these have exactly two faces painted?",
    o: ["24", "8", "36", "12"], c: 0, e: "Edge cubes with 2 faces = 12×(n−2) = 12×2 = 24, where n = 4." },
  { t: "Syllogism", d: "HARD", s: "Statements: All roses are flowers. Some flowers fade quickly. Conclusion: Some roses fade quickly. Does the conclusion follow?",
    o: ["Does not follow", "Definitely follows", "Both follow", "Either follows"], c: 0, e: "The 'some flowers' that fade need not be roses, so it does not necessarily follow." },
];
const REASONING_CLEAN = REASONING;

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
  const VERIFY = process.argv.includes("--verify");
  if (VERIFY) {
    let n = 0;
    for (const [label, list] of [["QUANT", QUANT_CLEAN], ["REASONING", REASONING_CLEAN]]) {
      console.log(`\n========== ${label} (${list.length}) ==========`);
      for (const q of list) {
        n++;
        console.log(`\n${n}. [${q.t} · ${q.d}] ${q.s}`);
        console.log(`   Options: ${q.o.join("  |  ")}`);
        console.log(`   ✓ ${q.o[q.c]}`);
        console.log(`   → ${q.e}`);
      }
    }
    console.log(`\nTotal: ${n} hand-authored trap questions.`);
    await prisma.$disconnect();
    return;
  }

  const qRows = [], oRows = [];
  const addAll = (list, targets) => {
    for (const t of targets) {
      for (const q of list) {
        const correctText = q.o[q.c];
        const id = crypto.randomUUID();
        qRows.push({
          id, examCode: t.examCode, sectionCode: t.sectionCode, subject: t.subject,
          topic: q.t, difficulty: q.d, stem: q.s, explanation: q.e,
          source: "MANUAL", contentHash: contentHash(q.s, correctText), isActive: true,
        });
        shuffled(q.o, q.c).forEach((opt, i) =>
          oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i }));
      }
    }
  };
  addAll(QUANT_CLEAN, QUANT_TARGETS);
  addAll(REASONING_CLEAN, REASONING_TARGETS);

  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  await chunk(oRows, 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Inserted ${qRows.length} trap questions (${QUANT_CLEAN.length} quant + ${REASONING_CLEAN.length} reasoning, ×${QUANT_TARGETS.length} exams).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
