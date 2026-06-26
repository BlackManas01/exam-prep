// Tricky batch #7 — QUANT & REASONING heavy (then a little English). All NEW
// concepts, no overlap with batches 1-6. Every answer hand-verified.
//   node scripts/add-tricky7.cjs            (insert)
//   node scripts/add-tricky7.cjs --verify   (print only)
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
  { t: "Percentage", d: "HARD", q: "A's marks are 10% less than B's marks. By what percent are B's marks more than A's?", o: ["11⅑%", "10%", "9%", "12%"], c: 0, e: "A = 0.9B → B exceeds A by 0.1B/0.9B = 11⅑%." },
  { t: "Mensuration", d: "HARD", q: "If the side of a square is increased by 30%, by what percent does its area increase?", o: ["69%", "60%", "90%", "65%"], c: 0, e: "1.3² = 1.69 → 69% increase." },
  { t: "Profit and Loss", d: "EXPERT", q: "A shopkeeper sells an article at 15% profit. Had he sold it for ₹120 more, the profit would have been 35%. Find the cost price.", o: ["₹600", "₹500", "₹720", "₹650"], c: 0, e: "The ₹120 = 20% of CP → CP = 600." },
  { t: "Averages", d: "MEDIUM", q: "The average of 9 observations is 40. The average of the first five is 38 and that of the last five is 43. What is the fifth observation?", o: ["45", "40", "41", "44"], c: 0, e: "5×38 + 5×43 − 9×40 = 190+215−360 = 45." },
  { t: "Boats & Streams", d: "EXPERT", q: "A boat covers 24 km downstream and 16 km upstream in 6 hours; it also covers 36 km downstream and 40 km upstream in 13 hours. Find the speed of the boat in still water.", o: ["8 km/h", "10 km/h", "6 km/h", "12 km/h"], c: 0, e: "Solving: downstream 12 km/h, upstream 4 km/h → still water = (12+4)/2 = 8 km/h." },
  { t: "Time & Work", d: "HARD", q: "A is 25% more efficient than B. If A alone can finish a piece of work in 20 days, how many days will B alone take?", o: ["25 days", "16 days", "24 days", "30 days"], c: 0, e: "A = 1.25B → B's time = 20×1.25 = 25 days." },
  { t: "Pipes & Cisterns", d: "EXPERT", q: "Two pipes A and B can fill a tank in 24 and 32 minutes. Both are opened together; after how many minutes should B be closed so that the tank is full in 18 minutes?", o: ["8 minutes", "6 minutes", "10 minutes", "12 minutes"], c: 0, e: "A in 18 min fills 18/24 = 3/4; remaining 1/4 by B → t/32 = 1/4 → t = 8 min." },
  { t: "Number System", d: "HARD", q: "The sum of the digits of a two-digit number is 12. When the digits are reversed, the number increases by 18. Find the original number.", o: ["57", "75", "48", "39"], c: 0, e: "t+u=12, 9(u−t)=18 → u−t=2 → u=7, t=5 → 57." },
  { t: "Number System", d: "HARD", q: "The HCF of two numbers is 23, and the two other factors of their LCM are 13 and 14. Find the larger of the two numbers.", o: ["322", "299", "345", "308"], c: 0, e: "Numbers = 23×13 = 299 and 23×14 = 322 → larger 322." },
  { t: "Number System", d: "EXPERT", q: "Find the remainder when 15! is divided by 17.", o: ["1", "16", "0", "15"], c: 0, e: "By Wilson's theorem 16! ≡ −1 (mod 17); 16!=16·15! ≡ (−1)·15! → 15! ≡ 1." },
  { t: "Ratio & Proportion", d: "MEDIUM", q: "The ratio of two numbers is 5 : 8 and their LCM is 280. Find the smaller number.", o: ["35", "40", "56", "25"], c: 0, e: "Numbers 5k, 8k → LCM 40k = 280 → k = 7 → smaller = 35." },
  { t: "Algebra", d: "MEDIUM", q: "If a/b + b/a = 2, then the value of (a − b) is:", o: ["0", "1", "2", "−1"], c: 0, e: "a/b + b/a = 2 → (a−b)² = 0 → a = b → a − b = 0." },
  { t: "Algebra", d: "EXPERT", q: "If x = 2 − √3, then the value of x³ + 1/x³ is:", o: ["52", "48", "64", "56"], c: 0, e: "1/x = 2+√3, x+1/x = 4 → x³+1/x³ = 4³ − 3×4 = 52." },
  { t: "Mensuration", d: "MEDIUM", q: "Find the area of a sector of a circle of radius 7 cm with a central angle of 90°. (π = 22/7)", o: ["38.5 cm²", "44 cm²", "49 cm²", "77 cm²"], c: 0, e: "(90/360)×(22/7)×7² = ¼×154 = 38.5 cm²." },
  { t: "Mensuration", d: "HARD", q: "The volume of a sphere is 36π cm³. Find its surface area.", o: ["36π cm²", "27π cm²", "48π cm²", "12π cm²"], c: 0, e: "(4/3)πr³ = 36π → r³ = 27 → r = 3; SA = 4πr² = 36π cm²." },
  { t: "Trigonometry", d: "HARD", q: "If sec θ = 13/5, then the value of (sin θ − cos θ)/(sin θ + cos θ) is:", o: ["7/17", "5/17", "12/13", "7/13"], c: 0, e: "cos θ = 5/13, sin θ = 12/13 → (12−5)/(12+5) = 7/17." },
  { t: "Trigonometry", d: "EXPERT", q: "What is the value of (1 + tan² θ)(1 − sin² θ)?", o: ["1", "0", "2", "sin² θ"], c: 0, e: "(sec²θ)(cos²θ) = 1." },
  { t: "Time, Speed & Distance", d: "MEDIUM", q: "Walking at 5 km/h, a man reaches his office at 10:00 a.m. Walking at 6 km/h, he reaches at 9:48 a.m. Find the distance to his office.", o: ["6 km", "5 km", "8 km", "4 km"], c: 0, e: "d/5 − d/6 = 12 min = 1/5 h → d/30 = 1/5 → d = 6 km." },
  { t: "Partnership", d: "HARD", q: "A, B and C invest in the ratio 2 : 3 : 5. If B's share of the annual profit is ₹1500, what is the total profit?", o: ["₹5000", "₹4500", "₹6000", "₹5500"], c: 0, e: "B's share = 3/10 of profit = 1500 → profit = ₹5000." },
  { t: "Percentage", d: "HARD", q: "The price of petrol rises by 20%. By what percent must a man cut his consumption so that his expenditure rises by only 8%?", o: ["10%", "12%", "8%", "15%"], c: 0, e: "New consumption factor = 1.08/1.20 = 0.9 → reduce by 10%." },
  { t: "Mixture & Alligation", d: "EXPERT", q: "A container holds 80 litres of pure milk. 8 litres are drawn out and replaced with water; this is done three times in all. Find the quantity of milk remaining.", o: ["58.32 litres", "64 litres", "54 litres", "60 litres"], c: 0, e: "80×(1−8/80)³ = 80×0.9³ = 80×0.729 = 58.32 L." },
  { t: "Number System", d: "MEDIUM", q: "What is the smallest number that must be added to 1056 to make it exactly divisible by 23?", o: ["2", "3", "18", "21"], c: 0, e: "1056 ÷ 23 = 45 r 21 → next multiple 46×23 = 1058 → add 2." },
];

const REASONING = [
  { t: "Coding-Decoding", d: "HARD", q: "If 'RAT' is coded as 'IZG' (each letter replaced by its opposite in the alphabet), how is 'DOG' coded?", o: ["WLT", "WLU", "VLT", "WMT"], c: 0, e: "Opposite letters: D↔W, O↔L, G↔T → WLT." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 5, 10, 20, 40, ?", o: ["80", "60", "70", "100"], c: 0, e: "Each term is doubled → 40×2 = 80." },
  { t: "Number Series", d: "HARD", q: "Find the next term: 6, 11, 21, 36, 56, ?", o: ["81", "76", "80", "84"], c: 0, e: "Differences +5, +10, +15, +20, +25 → 56 + 25 = 81." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 0, 6, 24, 60, 120, ?", o: ["210", "180", "200", "216"], c: 0, e: "Pattern n³ − n: 1−1, 8−2, 27−3, 64−4, 125−5, 216−6 = 210." },
  { t: "Analogy", d: "MEDIUM", q: "Painter : Brush :: Carpenter : ?", o: ["Saw", "Wood", "Chair", "Nail"], c: 0, e: "A painter uses a brush; a carpenter uses a saw (a tool)." },
  { t: "Analogy", d: "HARD", q: "ACE : 135 :: BDF : ?", o: ["246", "234", "245", "248"], c: 0, e: "A,C,E = positions 1,3,5; B,D,F = 2,4,6 → 246." },
  { t: "Classification", d: "MEDIUM", q: "Find the odd one out: Lion, Tiger, Leopard, Wolf", o: ["Wolf", "Lion", "Tiger", "Leopard"], c: 0, e: "Lion, tiger and leopard belong to the cat family; a wolf is a canine." },
  { t: "Blood Relations", d: "EXPERT", q: "Pointing to a woman, a man said, 'Her father is the only son of my father.' How is the woman related to the man?", o: ["Daughter", "Sister", "Niece", "Mother"], c: 0, e: "The only son of the man's father is the man himself → the woman's father is the man → she is his daughter." },
  { t: "Direction Sense", d: "HARD", q: "A man walks 5 km East, then turns left and walks 5 km, turns left and walks 5 km, turns left and walks 5 km, and finally turns left and walks 5 km. How far is he from the start?", o: ["5 km", "0 km", "10 km", "5√2 km"], c: 0, e: "After four 5 km legs he is back at the start; the fifth leg (East) leaves him 5 km away." },
  { t: "Ranking & Order", d: "HARD", q: "In a class of 45 students, Rohit is 18th from the top. Suman's rank is 7 below Rohit's. What is Suman's rank from the bottom?", o: ["21st", "20th", "22nd", "19th"], c: 0, e: "Suman is 25th from top → from bottom = 45 − 25 + 1 = 21st." },
  { t: "Calendar", d: "EXPERT", q: "If 26 January 2020 was a Sunday, what day of the week was 26 January 2021?", o: ["Tuesday", "Monday", "Wednesday", "Sunday"], c: 0, e: "The period includes 29 Feb 2020 (366 days) → 2 odd days → Sunday + 2 = Tuesday." },
  { t: "Letter Series", d: "MEDIUM", q: "Find the next term: Z, W, T, Q, ?", o: ["N", "O", "M", "P"], c: 0, e: "Each letter moves back by 3 → Q − 3 = N." },
  { t: "Mathematical Operations", d: "HARD", q: "If 6 # 2 = 16, 8 # 4 = 24 and 9 # 3 = 24, then 12 # 6 = ?", o: ["36", "30", "32", "40"], c: 0, e: "Pattern (a + b) × 2: (12 + 6) × 2 = 36." },
  { t: "Syllogism", d: "EXPERT", q: "Statements: All roses are red. No red is blue. Conclusions: I. No rose is blue. II. Some red things are roses. Which conclusion(s) follow?", o: ["Both I and II follow", "Only I follows", "Only II follows", "Neither follows"], c: 0, e: "Roses are red and no red is blue → no rose is blue (I); roses being red means some red things are roses (II)." },
  { t: "Coding-Decoding", d: "HARD", q: "If 'BAD' = 7 and 'CAB' = 6 (sum of letter positions), then 'DAD' = ?", o: ["9", "8", "10", "7"], c: 0, e: "D(4)+A(1)+D(4) = 9." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 1, 3, 6, 10, 15, ?", o: ["21", "20", "18", "24"], c: 0, e: "Triangular numbers (add 2, 3, 4, 5, 6) → 15 + 6 = 21." },
  { t: "Direction Sense", d: "HARD", q: "If South-East becomes North and North-East becomes West, then what will West become?", o: ["South-East", "North-East", "South-West", "North-West"], c: 0, e: "The directions rotate 135° anticlockwise; West (270°) − 135° = 135° = South-East." },
  { t: "Seating Arrangement", d: "HARD", q: "A, B, C, D and E sit in a row. C is exactly in the middle, D is immediately to the right of C, A is at the left end, and B is between A and C. Who sits at the right end?", o: ["E", "D", "B", "A"], c: 0, e: "Order: A, B, C, D, E → E is at the right end." },
];

const ENGLISH = [
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: CULPABLE", o: ["Guilty", "Innocent", "Capable", "Blameless"], c: 0, e: "Culpable = deserving blame → guilty. 'Capable' is the sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: DORMANT", o: ["Inactive", "Active", "Hidden", "Sleepy"], c: 0, e: "Dormant = temporarily inactive." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: COMPULSORY", o: ["Optional", "Mandatory", "Required", "Forced"], c: 0, e: "Compulsory = required; antonym optional. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: ASCEND", o: ["Descend", "Climb", "Rise", "Mount"], c: 0, e: "Ascend = go up; antonym descend. The rest are synonyms." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A person who does not believe in the existence of God'", o: ["Atheist", "Theist", "Agnostic", "Heretic"], c: 0, e: "Atheist denies God; an agnostic is unsure (trap)." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A place where money (coins) is manufactured'", o: ["Mint", "Treasury", "Bank", "Vault"], c: 0, e: "A mint produces coins." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To add insult to injury'", o: ["To make a bad situation worse", "To apologise sincerely", "To injure someone badly", "To insult openly"], c: 0, e: "To worsen an already bad situation, often with humiliation." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'A snake in the grass'", o: ["A hidden enemy or treacherous person", "A clever idea", "A dangerous place", "An unexpected gift"], c: 0, e: "A secretly treacherous person." },
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
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
