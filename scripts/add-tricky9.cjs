// Tricky batch #9 — QUANT & REASONING heavy. All NEW concepts, no overlap with
// batches 1-8. Every answer hand-verified.
//   node scripts/add-tricky9.cjs            (insert)
//   node scripts/add-tricky9.cjs --verify   (print only)
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
  { t: "Percentage", d: "HARD", q: "If 40% of a number exceeds 25% of the same number by 30, find the number.", o: ["200", "150", "250", "180"], c: 0, e: "(40−25)% = 15% of the number = 30 → number = 30/0.15 = 200." },
  { t: "Profit and Loss", d: "EXPERT", q: "A sells an article to B at 20% profit and B sells it to C at 25% profit. If C pays ₹450, what did A pay for it?", o: ["₹300", "₹320", "₹360", "₹280"], c: 0, e: "450 = A × 1.2 × 1.25 = 1.5A → A = ₹300." },
  { t: "Averages", d: "MEDIUM", q: "What is the average of the first 10 natural numbers?", o: ["5.5", "5", "6", "10"], c: 0, e: "(1+2+…+10)/10 = 55/10 = 5.5." },
  { t: "Ratio & Proportion", d: "HARD", q: "₹1900 is divided among A, B and C such that 4 times A's share = 6 times B's share = 9 times C's share. Find A's share.", o: ["₹900", "₹600", "₹400", "₹750"], c: 0, e: "A:B:C = 1/4:1/6:1/9 = 9:6:4 (sum 19) → A = 1900×9/19 = ₹900." },
  { t: "Mixture & Alligation", d: "EXPERT", q: "A vessel contains a solution with 20% alcohol. When 5 litres are removed and replaced with water, the alcohol becomes 15%. Find the original volume of the solution.", o: ["20 litres", "25 litres", "15 litres", "30 litres"], c: 0, e: "0.2(V−5)/V = 0.15 → 0.2V − 1 = 0.15V → 0.05V = 1 → V = 20 L." },
  { t: "Time & Work", d: "EXPERT", q: "A and B together can do a work in 12 days. They work together for 8 days, then A leaves and B finishes the remaining work in 10 more days. In how many days can B alone do the whole work?", o: ["30 days", "24 days", "36 days", "20 days"], c: 0, e: "8 days = 2/3 done; remaining 1/3 by B in 10 days → B's rate 1/30 → 30 days." },
  { t: "Pipes & Cisterns", d: "EXPERT", q: "Two taps can fill a tank in 20 and 30 minutes. A waste pipe drains 40 litres per minute. With all three open, the tank fills in 60 minutes. Find the capacity of the tank.", o: ["600 litres", "500 litres", "720 litres", "480 litres"], c: 0, e: "Fill rate 1/12 per min; net 1/60 → waste = 1/12 − 1/60 = 1/15 of tank/min = 40 L → capacity 600 L." },
  { t: "Number System", d: "MEDIUM", q: "What is the LCM of 12, 15 and 20?", o: ["60", "120", "180", "240"], c: 0, e: "LCM(12,15,20) = 60." },
  { t: "Number System", d: "HARD", q: "Find the greatest number that divides 43, 91 and 183 leaving the same remainder in each case.", o: ["4", "7", "9", "13"], c: 0, e: "HCF of the differences (48, 92, 140) = 4." },
  { t: "Algebra", d: "HARD", q: "If x − 1/x = 4, then the value of x³ − 1/x³ is:", o: ["76", "64", "52", "88"], c: 0, e: "x³−1/x³ = (x−1/x)³ + 3(x−1/x) = 64 + 12 = 76." },
  { t: "Mensuration", d: "HARD", q: "Two angles of a triangle are equal and the third angle is 80°. Find the measure of each of the equal angles.", o: ["50°", "40°", "60°", "45°"], c: 0, e: "(180° − 80°)/2 = 50°." },
  { t: "Mensuration", d: "MEDIUM", q: "The circumference of a circle is 44 cm. Find its area. (π = 22/7)", o: ["154 cm²", "144 cm²", "176 cm²", "121 cm²"], c: 0, e: "2πr = 44 → r = 7 → area = πr² = 154 cm²." },
  { t: "Mensuration", d: "HARD", q: "The length of the diagonal of a cube is 6√3 cm. Find the volume of the cube.", o: ["216 cm³", "125 cm³", "343 cm³", "512 cm³"], c: 0, e: "Diagonal = a√3 = 6√3 → a = 6 → volume = 216 cm³." },
  { t: "Trigonometry", d: "HARD", q: "If 2cos²θ − 1 = 0 and θ is acute, find θ.", o: ["45°", "30°", "60°", "90°"], c: 0, e: "2cos²θ − 1 = cos2θ = 0 → 2θ = 90° → θ = 45°." },
  { t: "Trigonometry", d: "EXPERT", q: "If sin θ = 3/5, then the value of (1 + cos θ)/sin θ + sin θ/(1 + cos θ) is:", o: ["10/3", "5/3", "3/5", "6/5"], c: 0, e: "The expression simplifies to 2/sin θ = 2 cosec θ = 2×5/3 = 10/3." },
  { t: "Time, Speed & Distance", d: "MEDIUM", q: "A man covers 12 km in 90 minutes. What is his speed in km/h?", o: ["8 km/h", "9 km/h", "7.5 km/h", "10 km/h"], c: 0, e: "90 min = 1.5 h → 12/1.5 = 8 km/h." },
  { t: "Simple Interest", d: "HARD", q: "In what time will ₹8000 yield ₹2520 as simple interest at 9% per annum?", o: ["3.5 years", "3 years", "4 years", "2.5 years"], c: 0, e: "2520 = 8000×9×t/100 = 720t → t = 3.5 years." },
  { t: "Percentage", d: "HARD", q: "A reduction of 20% in the price of sugar enables a man to buy 4 kg more for ₹160. Find the reduced price per kg.", o: ["₹8", "₹10", "₹6", "₹9"], c: 0, e: "Saving = 20% of 160 = ₹32 buys 4 kg → reduced price = 32/4 = ₹8 per kg." },
];

const REASONING = [
  { t: "Coding-Decoding", d: "HARD", q: "If the code of a word is the sum of its letter positions, and 'RED' = 27, then 'GREEN' = ?", o: ["49", "47", "51", "45"], c: 0, e: "G(7)+R(18)+E(5)+E(5)+N(14) = 49." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 100, 50, 25, 12.5, ?", o: ["6.25", "6", "5", "10"], c: 0, e: "Each term is halved → 12.5/2 = 6.25." },
  { t: "Number Series", d: "HARD", q: "Find the next term: 1, 5, 14, 30, 55, ?", o: ["91", "85", "90", "100"], c: 0, e: "Sum of consecutive squares: 55 + 6² = 55 + 36 = 91." },
  { t: "Number Series", d: "EXPERT", q: "Find the next term: 2, 3, 5, 9, 17, ?", o: ["33", "32", "34", "31"], c: 0, e: "Each term ×2 − 1: 17×2 − 1 = 33." },
  { t: "Analogy", d: "MEDIUM", q: "Bird : Fly :: Fish : ?", o: ["Swim", "Water", "Fin", "Gill"], c: 0, e: "A bird flies; a fish swims." },
  { t: "Analogy", d: "HARD", q: "BOOK : KOOB :: WORD : ?", o: ["DROW", "DORW", "WROD", "DROV"], c: 0, e: "The letters are reversed: WORD → DROW." },
  { t: "Classification", d: "MEDIUM", q: "Find the odd one out: Square, Rectangle, Rhombus, Triangle", o: ["Triangle", "Square", "Rectangle", "Rhombus"], c: 0, e: "A triangle has three sides; the others are quadrilaterals." },
  { t: "Blood Relations", d: "HARD", q: "Q is the brother of R. S is the sister of Q. T is the brother of S. How many brothers does R have?", o: ["2", "1", "3", "4"], c: 0, e: "R's brothers are Q and T (S is a sister) → 2 brothers." },
  { t: "Direction Sense", d: "MEDIUM", q: "A man walks 6 km North, 8 km East, 6 km South and then 8 km West. Where is he relative to the start?", o: ["At the starting point", "8 km East", "6 km North", "10 km away"], c: 0, e: "The opposite legs cancel, so he returns to the start." },
  { t: "Ranking & Order", d: "HARD", q: "A is taller than B but shorter than C. D is taller than A but shorter than C. Who is the tallest?", o: ["C", "A", "D", "B"], c: 0, e: "C is taller than both A and D, so C is the tallest." },
  { t: "Calendar", d: "HARD", q: "How many odd days are there in 100 years?", o: ["5", "4", "6", "3"], c: 0, e: "100 years have 24 leap years → (76 + 2×24) = 124 odd days → 124 mod 7 = 5." },
  { t: "Letter Series", d: "MEDIUM", q: "Find the next term: AZ, CX, EV, ?", o: ["GT", "GU", "HT", "FT"], c: 0, e: "First letters A,C,E,G (+2); second letters Z,X,V,T (−2) → GT." },
  { t: "Mathematical Operations", d: "HARD", q: "If P means ÷, Q means ×, R means − and S means +, then 36 P 6 Q 2 S 4 R 1 = ?", o: ["15", "12", "17", "14"], c: 0, e: "36÷6×2 + 4 − 1 = 12 + 4 − 1 = 15." },
  { t: "Syllogism", d: "EXPERT", q: "Statements: All cups are plates. Some plates are bowls. Conclusions: I. Some cups are bowls. II. Some bowls are plates. Which conclusion(s) follow?", o: ["Only II follows", "Only I follows", "Both follow", "Neither follows"], c: 0, e: "'Some plates are bowls' gives 'some bowls are plates' (II). I is not guaranteed." },
  { t: "Coding-Decoding", d: "HARD", q: "If 'CAT' is coded as '3120' (letter positions joined), how is 'DOG' coded?", o: ["4157", "4150", "3157", "4167"], c: 0, e: "D=4, O=15, G=7 → 4157." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next letter: J, F, M, A, M, ?", o: ["J", "A", "S", "O"], c: 0, e: "Initials of the months January–June → next is June (J)." },
];

const ENGLISH = [
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: SCRUTINIZE", o: ["Examine", "Ignore", "Scatter", "Scrub"], c: 0, e: "Scrutinize = examine closely. 'Scrub' is a sound-alike trap." },
  { t: "Synonyms", d: "MEDIUM", q: "Select the most appropriate synonym of: FRAGILE", o: ["Delicate", "Strong", "Flexible", "Fragrant"], c: 0, e: "Fragile = easily broken → delicate. 'Fragrant' is a sound-alike trap." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: TRANQUIL", o: ["Agitated", "Calm", "Peaceful", "Serene"], c: 0, e: "Tranquil = calm; antonym agitated. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: GENEROUS", o: ["Miserly", "Charitable", "Kind", "Liberal"], c: 0, e: "Generous = giving; antonym miserly. The rest are synonyms." },
  { t: "One Word Substitution", d: "MEDIUM", q: "One-word substitution: 'A doctor who specialises in treating teeth'", o: ["Dentist", "Optician", "Surgeon", "Therapist"], c: 0, e: "A dentist treats teeth." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A place where dead bodies are kept'", o: ["Mortuary", "Cemetery", "Crematorium", "Sanatorium"], c: 0, e: "A mortuary stores dead bodies; a cemetery is for burial (trap)." },
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
