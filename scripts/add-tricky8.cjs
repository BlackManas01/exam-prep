// Tricky batch #8 — QUANT & REASONING heavy. All NEW concepts, no overlap with
// batches 1-7. Every answer hand-verified.
//   node scripts/add-tricky8.cjs            (insert)
//   node scripts/add-tricky8.cjs --verify   (print only)
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
  { t: "Percentage", d: "HARD", q: "In a town, 60% of the people are males. If 40% of the males and 30% of the females are literate, what percent of the total population is literate?", o: ["36%", "35%", "34%", "70%"], c: 0, e: "0.4×60 + 0.3×40 = 24 + 12 = 36%." },
  { t: "Profit and Loss", d: "EXPERT", q: "A trader marks his goods 25% above cost price. He sells half the stock at the marked price and the rest at a 10% discount. What is his overall profit percent?", o: ["18.75%", "20%", "15%", "22.5%"], c: 0, e: "On CP 200: SP = 125 + 112.5 = 237.5 → profit = 37.5/200 = 18.75%." },
  { t: "Averages", d: "MEDIUM", q: "The average of 20 numbers is 15. If each number is increased by 4, what is the new average?", o: ["19", "15", "23", "60"], c: 0, e: "Adding 4 to each raises the average by 4 → 19." },
  { t: "Ratio & Proportion", d: "HARD", q: "If (a+b) : (b+c) : (c+a) = 6 : 7 : 8 and a + b + c = 14, find the value of c.", o: ["6", "8", "7", "5"], c: 0, e: "Sum of ratios 21 = 2(a+b+c) → unit = 28/21 = 4/3; a+b = 8 → c = 14 − 8 = 6." },
  { t: "Compound Interest", d: "HARD", q: "A sum invested at compound interest amounts to ₹2304 in 2 years and ₹2764.80 in 3 years. Find the rate of interest per annum.", o: ["20%", "18%", "25%", "15%"], c: 0, e: "Interest in 3rd year = 460.80 on 2304 → 460.8/2304 = 20%." },
  { t: "Time & Work", d: "EXPERT", q: "20 men can complete a work in 30 days working 8 hours a day. In how many days can 25 men complete the same work working 6 hours a day?", o: ["32 days", "30 days", "36 days", "28 days"], c: 0, e: "Man-hours = 20×30×8 = 4800; 25×6 = 150/day → 4800/150 = 32 days." },
  { t: "Pipes & Cisterns", d: "HARD", q: "A tank is filled by pipe A in 6 hours and emptied by pipe B in 8 hours. If the tank is half full and both pipes are opened, how long will it take to fill it completely?", o: ["12 hours", "10 hours", "8 hours", "14 hours"], c: 0, e: "Net rate = 1/6 − 1/8 = 1/24; half tank → 0.5 ÷ (1/24) = 12 hours." },
  { t: "Number System", d: "MEDIUM", q: "What is the unit (ones) digit of (217)⁴¹³?", o: ["7", "1", "3", "9"], c: 0, e: "7 has cycle 7,9,3,1; 413 mod 4 = 1 → unit digit 7." },
  { t: "Number System", d: "HARD", q: "The product of two consecutive even numbers is 168. What is the larger number?", o: ["14", "12", "16", "10"], c: 0, e: "12×14 = 168 → larger is 14." },
  { t: "Number System", d: "EXPERT", q: "What are the last two digits of 7²⁰⁰⁸?", o: ["01", "07", "49", "43"], c: 0, e: "7⁴ = 2401 ≡ 01 (mod 100); 2008 = 4×502 → (7⁴)⁵⁰² ≡ 01." },
  { t: "Algebra", d: "HARD", q: "If x + y = 7 and xy = 12, then the value of x³ + y³ is:", o: ["91", "84", "98", "105"], c: 0, e: "x³+y³ = (x+y)³ − 3xy(x+y) = 343 − 252 = 91." },
  { t: "Algebra", d: "MEDIUM", q: "If 2ˣ = 8, then the value of 4ˣ is:", o: ["64", "16", "32", "256"], c: 0, e: "2ˣ = 8 → x = 3 → 4³ = 64." },
  { t: "Algebra", d: "EXPERT", q: "If a² + b² + c² = ab + bc + ca and a = 3, then the value of (b + c) is:", o: ["6", "3", "9", "0"], c: 0, e: "The condition forces a = b = c → b = c = 3 → b + c = 6." },
  { t: "Mensuration", d: "HARD", q: "In a triangle, two of the angles are 50° and 60°. Find the angle between the internal bisectors of these two angles.", o: ["125°", "115°", "120°", "130°"], c: 0, e: "Angle between bisectors = 90° + (third angle)/2 = 90° + 70°/2 = 125°." },
  { t: "Mensuration", d: "MEDIUM", q: "The four angles of a quadrilateral are in the ratio 1 : 2 : 3 : 4. Find the largest angle.", o: ["144°", "120°", "108°", "150°"], c: 0, e: "Sum 360° over 10 parts → largest = 4×36° = 144°." },
  { t: "Mensuration", d: "MEDIUM", q: "A cylinder and a cone have the same radius and the same height. What is the ratio of their volumes?", o: ["3 : 1", "1 : 3", "2 : 1", "1 : 1"], c: 0, e: "Cylinder πr²h vs cone ⅓πr²h → 3 : 1." },
  { t: "Mensuration", d: "HARD", q: "The radii of two spheres are in the ratio 2 : 3. What is the ratio of their volumes?", o: ["8 : 27", "4 : 9", "2 : 3", "6 : 9"], c: 0, e: "Volume ∝ radius³ → 2³ : 3³ = 8 : 27." },
  { t: "Trigonometry", d: "HARD", q: "If sin θ + cosec θ = 2, then the value of sin⁵ θ + cosec⁵ θ is:", o: ["2", "32", "10", "1"], c: 0, e: "sin θ + cosec θ = 2 forces sin θ = 1 → 1 + 1 = 2." },
  { t: "Trigonometry", d: "MEDIUM", q: "What is the value of tan 1° · tan 2° · tan 3° · … · tan 89°?", o: ["1", "0", "89", "Undefined"], c: 0, e: "Pairing tan θ · tan(90°−θ) = 1; the middle tan 45° = 1 → product = 1." },
  { t: "Time, Speed & Distance", d: "HARD", q: "A train running at 72 km/h crosses a platform in 30 seconds and a man standing on the platform in 18 seconds. Find the length of the platform.", o: ["240 m", "360 m", "300 m", "200 m"], c: 0, e: "Speed 20 m/s; train = 20×18 = 360 m; platform = 20×30 − 360 = 240 m." },
  { t: "Time, Speed & Distance", d: "EXPERT", q: "Two trains of equal length run on parallel tracks in the same direction at 46 km/h and 36 km/h. The faster train passes the slower one in 36 seconds. Find the length of each train.", o: ["50 m", "72 m", "80 m", "100 m"], c: 0, e: "Relative speed 10 km/h = 25/9 m/s; combined length = 25/9×36 = 100 m → each = 50 m." },
  { t: "Profit and Loss", d: "MEDIUM", q: "A man buys oranges at 3 for ₹2 and sells them at 2 for ₹3. What is his profit percent?", o: ["125%", "100%", "50%", "75%"], c: 0, e: "CP/orange = ₹2/3, SP/orange = ₹3/2 → profit = (3/2 − 2/3)/(2/3) = 125%." },
];

const REASONING = [
  { t: "Coding-Decoding", d: "HARD", q: "If the value of a word is the product of its letter positions, and 'BAD' = 8, then 'CAB' = ?", o: ["6", "9", "5", "8"], c: 0, e: "C(3)×A(1)×B(2) = 6." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 3, 7, 15, 31, ?", o: ["63", "62", "60", "47"], c: 0, e: "Each term ×2 + 1 → 31×2 + 1 = 63." },
  { t: "Number Series", d: "HARD", q: "Find the next term: 2, 12, 36, 80, ?", o: ["150", "120", "100", "160"], c: 0, e: "Pattern n³ + n²: 1+1, 8+4, 27+9, 64+16, 125+25 = 150." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 1, 2, 6, 24, 120, ?", o: ["720", "600", "480", "240"], c: 0, e: "Multiply by 2, 3, 4, 5, 6 → 120×6 = 720." },
  { t: "Analogy", d: "MEDIUM", q: "Lawyer : Court :: Chef : ?", o: ["Kitchen", "Food", "Knife", "Restaurant"], c: 0, e: "A lawyer works in a court; a chef works in a kitchen." },
  { t: "Analogy", d: "HARD", q: "5 : 36 :: 6 : ?", o: ["49", "48", "42", "64"], c: 0, e: "(5+1)² = 36, so (6+1)² = 49." },
  { t: "Classification", d: "MEDIUM", q: "Find the odd one out: Apple, Mango, Potato, Banana", o: ["Potato", "Apple", "Mango", "Banana"], c: 0, e: "Potato is a vegetable; the others are fruits." },
  { t: "Blood Relations", d: "EXPERT", q: "A and B are brothers. C and D are sisters. A's son is D's brother. How is B related to C?", o: ["Uncle", "Father", "Brother", "Cousin"], c: 0, e: "A's son is D's brother → D (and C) are A's daughters; B is A's brother → B is C's uncle." },
  { t: "Direction Sense", d: "HARD", q: "A clock is placed such that at 12:00 its hour hand points North-East. In which direction will the hour hand point at 3:00?", o: ["South-East", "North-West", "South-West", "North-East"], c: 0, e: "From 12 to 3 the hour hand turns 90° clockwise; North-East (45°) + 90° = 135° = South-East." },
  { t: "Ranking & Order", d: "MEDIUM", q: "In a row of girls, Priya is 10th from the left and 11th from the right. How many girls are there in the row?", o: ["20", "21", "19", "22"], c: 0, e: "10 + 11 − 1 = 20." },
  { t: "Calendar", d: "HARD", q: "What was the day of the week on 1 January 2000?", o: ["Saturday", "Sunday", "Friday", "Monday"], c: 0, e: "1 January 2000 was a Saturday." },
  { t: "Letter Series", d: "EXPERT", q: "Find the next term: C3X, F6U, I9R, ?", o: ["L12O", "L12P", "K12O", "L11O"], c: 0, e: "Letters +3 (C,F,I,L); numbers +3 (3,6,9,12); last letters −3 (X,U,R,O) → L12O." },
  { t: "Mathematical Operations", d: "HARD", q: "If 5 $ 3 = 34, 7 $ 2 = 53 and 6 $ 4 = 52, then 8 $ 5 = ?", o: ["89", "80", "79", "84"], c: 0, e: "Pattern a² + b²: 8² + 5² = 64 + 25 = 89." },
  { t: "Letter Series", d: "MEDIUM", q: "Find the next term: B, D, G, K, ?", o: ["P", "O", "N", "Q"], c: 0, e: "Gaps +2, +3, +4, +5 → K(11) + 5 = 16 = P." },
  { t: "Syllogism", d: "HARD", q: "Statements: All A are B. Some B are C. Conclusions: I. Some A are C. II. Some C are B. Which conclusion(s) follow?", o: ["Only II follows", "Only I follows", "Both follow", "Neither follows"], c: 0, e: "'Some B are C' gives 'some C are B' (II). 'Some A are C' is not guaranteed." },
  { t: "Coding-Decoding", d: "MEDIUM", q: "If 'CODE' is written as 'DPEF' (each letter +1), how is 'BYTE' written?", o: ["CZUF", "CYUF", "DZUF", "CZUG"], c: 0, e: "Each letter +1: B→C, Y→Z, T→U, E→F → CZUF." },
  { t: "Direction Sense", d: "HARD", q: "A man starts walking North. After 4 km he turns right and walks 3 km, then turns right and walks 4 km. How far and in which direction is he from the start?", o: ["3 km East", "3 km West", "5 km East", "4 km South"], c: 0, e: "North 4 and South 4 cancel; net 3 km East." },
];

const ENGLISH = [
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: VENERATE", o: ["Revere", "Despise", "Ventilate", "Question"], c: 0, e: "Venerate = to regard with deep respect → revere. 'Ventilate' is a sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: AFFLUENT", o: ["Wealthy", "Fluent", "Poor", "Flowing"], c: 0, e: "Affluent = rich → wealthy. 'Fluent' is a sound-alike trap." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: ABOLISH", o: ["Establish", "Cancel", "End", "Remove"], c: 0, e: "Abolish = put an end to; antonym establish. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: HUMANE", o: ["Cruel", "Kind", "Gentle", "Merciful"], c: 0, e: "Humane = compassionate; antonym cruel. The rest are synonyms." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A person who works for the welfare of mankind'", o: ["Philanthropist", "Misanthrope", "Egoist", "Patron"], c: 0, e: "Philanthropist promotes human welfare; a misanthrope hates mankind (trap)." },
  { t: "One Word Substitution", d: "MEDIUM", q: "One-word substitution: 'A complete list of items, especially of books'", o: ["Catalogue", "Index", "Glossary", "Inventory"], c: 0, e: "A catalogue is a complete, often descriptive, list of items." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To bury the hatchet'", o: ["To make peace and end a quarrel", "To hide a weapon", "To dig a grave", "To forget a plan"], c: 0, e: "To settle a dispute and become friendly again." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To go to the dogs'", o: ["To deteriorate or be ruined", "To go for a walk", "To behave badly", "To become wild"], c: 0, e: "To decline badly in quality or condition." },
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
