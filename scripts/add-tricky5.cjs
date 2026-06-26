// Tricky batch #5 — all NEW concepts (no overlap with batches 1-4). English-
// heavy. Every answer hand-verified. Tagged MEDIUM/HARD/EXPERT. Tier 1 first.
//   node scripts/add-tricky5.cjs            (insert)
//   node scripts/add-tricky5.cjs --verify   (print only)
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

const ENGLISH = [
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: ARDUOUS", o: ["Difficult", "Ardent", "Easy", "Lengthy"], c: 0, e: "Arduous = requiring great effort → difficult. 'Ardent' is the sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: COPIOUS", o: ["Abundant", "Copied", "Scarce", "Brief"], c: 0, e: "Copious = plentiful → abundant. 'Copied' is the sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: DEFT", o: ["Skilful", "Deaf", "Clumsy", "Slow"], c: 0, e: "Deft = skilful/nimble. 'Deaf' is the sound-alike trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: FICKLE", o: ["Changeable", "Loyal", "Steady", "Weak"], c: 0, e: "Fickle = inconstant → changeable. 'Loyal/Steady' are opposite traps." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: JOVIAL", o: ["Cheerful", "Jealous", "Royal", "Gloomy"], c: 0, e: "Jovial = good-humoured → cheerful. 'Royal' is the sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: LUCID", o: ["Clear", "Lucky", "Vague", "Bright"], c: 0, e: "Lucid = easily understood → clear. 'Lucky' is the sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: OBSTINATE", o: ["Stubborn", "Obvious", "Obedient", "Flexible"], c: 0, e: "Obstinate = stubborn. 'Obvious/Obedient' are sound-alike traps." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: RESILIENT", o: ["Adaptable", "Fragile", "Rigid", "Reluctant"], c: 0, e: "Resilient = able to recover quickly → adaptable. 'Fragile' is the opposite trap." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: DILIGENT", o: ["Negligent", "Hardworking", "Careful", "Industrious"], c: 0, e: "Diligent = hardworking; antonym negligent. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: FERTILE", o: ["Barren", "Productive", "Rich", "Fruitful"], c: 0, e: "Fertile = productive; antonym barren. The rest are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: PROFOUND", o: ["Superficial", "Deep", "Wise", "Intense"], c: 0, e: "Profound = deep; antonym superficial. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: OPTIMIST", o: ["Pessimist", "Hopeful", "Positive", "Dreamer"], c: 0, e: "Optimist = hopeful person; antonym pessimist. The rest are related/synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: FLEXIBLE", o: ["Rigid", "Elastic", "Supple", "Adaptable"], c: 0, e: "Flexible = bendable; antonym rigid. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: BOLD", o: ["Timid", "Brave", "Daring", "Fearless"], c: 0, e: "Bold = brave; antonym timid. The rest are synonyms." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person who can use both hands equally well'", o: ["Ambidextrous", "Ambivalent", "Dexterous", "Versatile"], c: 0, e: "Ambidextrous. 'Ambivalent' = having mixed feelings (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A speech made by a character to himself'", o: ["Soliloquy", "Monologue", "Dialogue", "Oration"], c: 0, e: "Soliloquy (to oneself). A monologue is addressed to others (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'The scientific study of human races and cultures'", o: ["Ethnology", "Etymology", "Ecology", "Ethology"], c: 0, e: "Ethnology. Etymology = study of word origins (trap)." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'An animal that eats both plants and flesh'", o: ["Omnivorous", "Carnivorous", "Herbivorous", "Voracious"], c: 0, e: "Omnivorous eats both. 'Voracious' = greedy eater (trap)." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'Government run by officials and departments'", o: ["Bureaucracy", "Democracy", "Aristocracy", "Autocracy"], c: 0, e: "Bureaucracy = rule by administrative officials." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A remedy for all diseases or problems'", o: ["Panacea", "Antidote", "Placebo", "Remedy"], c: 0, e: "Panacea = universal cure. An antidote counters one poison (trap)." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To break the ice'", o: ["To initiate conversation in a social setting", "To cause trouble", "To end a friendship", "To cool down"], c: 0, e: "To ease initial tension and start talking." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To cost an arm and a leg'", o: ["To be very expensive", "To cause an injury", "To demand hard labour", "To be risky"], c: 0, e: "To be extremely costly." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To be on cloud nine'", o: ["To be extremely happy", "To be confused", "To be daydreaming", "To be lost"], c: 0, e: "To be very happy and elated." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: \"To steal someone's thunder\"", o: ["To take credit for another's idea or achievement", "To frighten someone", "To make a loud noise", "To rob someone"], c: 0, e: "To win praise by using someone else's idea first." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To read between the lines'", o: ["To understand a hidden meaning", "To read very fast", "To skip portions", "To read aloud"], c: 0, e: "To perceive a meaning that is implied but not stated." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'The ball is in your court'", o: ["It is your turn to take action", "You are winning", "You are at fault", "You must play a game"], c: 0, e: "The decision or next step rests with you." },
  { t: "Error Spotting", d: "HARD", q: "Identify the part with the error: Myself and my friend (A) / went to the market (B) / to buy some groceries. (C) / No error (D)", o: ["A", "B", "C", "D"], c: 0, e: "Correct form is 'My friend and I' as the subject." },
  { t: "Error Spotting", d: "HARD", q: "Identify the part with the error: He is one of the best (A) / player in the (B) / entire team. (C) / No error (D)", o: ["B", "A", "C", "D"], c: 0, e: "'One of the best' needs a plural noun: 'players'." },
  { t: "Fill in the Blanks", d: "HARD", q: "Fill in the blank: 'I am not certain ______ he will accept the offer or not.'", o: ["whether", "weather", "wether", "whither"], c: 0, e: "Whether = expressing doubt. 'Weather' = climate (trap)." },
  { t: "Fill in the Blanks", d: "HARD", q: "Fill in the blank: 'My teacher gave me valuable ______ about my future studies.'", o: ["advice", "advise", "advices", "advise's"], c: 0, e: "Advice = noun (uncountable). 'Advise' = the verb (trap)." },
];

const QUANT = [
  { t: "Pipes & Cisterns", d: "HARD", q: "A cistern has two inlet pipes that can fill it in 10 hours and 15 hours, and an outlet pipe that empties it in 12 hours. If all three are opened together, in how many hours will the cistern be filled?", o: ["12 hours", "10 hours", "15 hours", "8 hours"], c: 0, e: "Net = 1/10 + 1/15 − 1/12 = (6+4−5)/60 = 1/12 → 12 hours." },
  { t: "Number System", d: "MEDIUM", q: "What is the largest four-digit number exactly divisible by 88?", o: ["9944", "9999", "9900", "9876"], c: 0, e: "9999 ÷ 88 = 113.6 → 113×88 = 9944." },
  { t: "Number System", d: "EXPERT", q: "What is the unit (ones) digit of 7⁹⁵ × 3⁵⁸?", o: ["7", "1", "3", "9"], c: 0, e: "7⁹⁵ → unit 3 (cycle 7,9,3,1; 95 mod 4 = 3); 3⁵⁸ → unit 9; 3×9 = 27 → 7." },
  { t: "Percentage", d: "HARD", q: "A's salary is 20% more than B's, and C's salary is 25% more than A's. By what percent is C's salary more than B's?", o: ["50%", "45%", "55%", "40%"], c: 0, e: "C = 1.25 × 1.2 B = 1.5 B → 50% more." },
  { t: "Ratio & Proportion", d: "EXPERT", q: "A bag contains ₹1, 50-paise and 25-paise coins in the ratio 5 : 6 : 8, amounting to ₹210. How many 25-paise coins are there?", o: ["168", "126", "105", "144"], c: 0, e: "Value per unit = 5(1)+6(0.5)+8(0.25) = ₹10; units = 210/10 = 21 → 25p coins = 8×21 = 168." },
  { t: "Averages", d: "MEDIUM", q: "The average of 6 numbers is 8. If each number is multiplied by 3 and then 5 is added, what is the new average?", o: ["29", "24", "34", "27"], c: 0, e: "New average = 8×3 + 5 = 29." },
  { t: "Profit and Loss", d: "HARD", q: "By selling an article for ₹450, a man loses 10%. At what price should he sell it to gain 20%?", o: ["₹600", "₹540", "₹560", "₹620"], c: 0, e: "CP = 450/0.9 = 500; SP for 20% gain = 500×1.2 = ₹600." },
  { t: "Time & Work", d: "EXPERT", q: "If 8 men or 12 women can complete a work in 25 days, in how many days can 6 men and 11 women together complete it?", o: ["15 days", "18 days", "20 days", "12 days"], c: 0, e: "8M = 12W → M = 1.5W; total = 12W×25 = 300; 6M+11W = 20W → 300/20 = 15 days." },
  { t: "Compound Interest", d: "HARD", q: "The compound interest on a sum for 2 years at 10% per annum is ₹420. Find the simple interest on the same sum for the same period and rate.", o: ["₹400", "₹420", "₹380", "₹410"], c: 0, e: "0.21P = 420 → P = 2000; SI = 2000×0.1×2 = ₹400." },
  { t: "Mensuration", d: "HARD", q: "The area of an equilateral triangle is 16√3 cm². Find the length of its side.", o: ["8 cm", "4 cm", "16 cm", "6 cm"], c: 0, e: "(√3/4)a² = 16√3 → a² = 64 → a = 8 cm." },
  { t: "Mensuration", d: "HARD", q: "A wire bent in the form of a circle of radius 28 cm is re-bent into a square. Find the side of the square. (π = 22/7)", o: ["44 cm", "42 cm", "40 cm", "48 cm"], c: 0, e: "Circumference = 2×(22/7)×28 = 176 cm = perimeter of square → side = 44 cm." },
  { t: "Algebra", d: "MEDIUM", q: "If a + b = 10 and ab = 21, then the value of a² + b² is:", o: ["58", "64", "42", "79"], c: 0, e: "a²+b² = (a+b)² − 2ab = 100 − 42 = 58." },
  { t: "Trigonometry", d: "MEDIUM", q: "If sin θ = 12/13, then the value of tan θ is:", o: ["12/5", "5/12", "13/12", "5/13"], c: 0, e: "cos θ = 5/13 → tan θ = sin/cos = 12/5." },
  { t: "Time, Speed & Distance", d: "MEDIUM", q: "Two cars start from the same point and move in opposite directions at 40 km/h and 50 km/h. After how many hours will they be 270 km apart?", o: ["3 hours", "2.5 hours", "4 hours", "3.5 hours"], c: 0, e: "Combined separation rate 90 km/h → 270/90 = 3 hours." },
];

const REASONING = [
  { t: "Coding-Decoding", d: "HARD", q: "If 'CAB' is coded as '312' (using letter positions), how is 'FACE' coded?", o: ["6135", "6134", "5135", "6125"], c: 0, e: "F=6, A=1, C=3, E=5 → 6135." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 4, 9, 16, 25, ?", o: ["36", "30", "49", "34"], c: 0, e: "Perfect squares: 2², 3², 4², 5², 6² = 36." },
  { t: "Number Series", d: "HARD", q: "Find the next term: 3, 6, 18, 72, ?", o: ["360", "144", "216", "288"], c: 0, e: "Multiply by 2, 3, 4, 5: 72×5 = 360." },
  { t: "Analogy", d: "MEDIUM", q: "Hand : Glove :: Foot : ?", o: ["Shoe", "Toe", "Leg", "Sock"], c: 0, e: "A glove covers a hand; a shoe covers a foot." },
  { t: "Classification", d: "MEDIUM", q: "Find the odd one out: Triangle, Square, Circle, Rectangle", o: ["Circle", "Triangle", "Square", "Rectangle"], c: 0, e: "A circle has no straight sides or corners; the others are polygons." },
  { t: "Blood Relations", d: "HARD", q: "P is the brother of Q. Q is the sister of R. R is the son of S. How is P related to S?", o: ["Son", "Brother", "Nephew", "Father"], c: 0, e: "P and R are siblings (P brother of Q, Q sister of R); R is S's son → P is S's son." },
  { t: "Direction Sense", d: "MEDIUM", q: "A man walks 10 m South, turns left and walks 10 m, turns left again and walks 10 m, then turns left and walks 10 m. Where is he now?", o: ["At the starting point", "10 m South", "10 m East", "10 m North"], c: 0, e: "Four 10 m legs each turning left form a square → he returns to the start." },
  { t: "Ranking & Order", d: "MEDIUM", q: "In a queue, Ram is 7th from the front and 13th from the back. How many people are there in the queue?", o: ["19", "20", "18", "21"], c: 0, e: "7 + 13 − 1 = 19." },
  { t: "Calendar", d: "HARD", q: "How many days are there in 4 consecutive years if exactly one of them is a leap year?", o: ["1461", "1460", "1462", "1465"], c: 0, e: "365×3 + 366 = 1095 + 366 = 1461 days." },
  { t: "Letter Series", d: "HARD", q: "Find the next term: BD, FH, JL, ?", o: ["NP", "MO", "NO", "MP"], c: 0, e: "Letters at positions 2-4, 6-8, 10-12, 14-16 → N(14)P(16)." },
  { t: "Mathematical Operations", d: "EXPERT", q: "If '×' means '+', '÷' means '−', '+' means '÷', and '−' means '×', then 16 × 4 ÷ 8 + 2 − 3 = ?", o: ["8", "10", "12", "6"], c: 0, e: "Translate: 16 + 4 − 8 ÷ 2 × 3 = 16 + 4 − 12 = 8." },
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
    for (const [label, list] of [["ENGLISH", ENGLISH], ["QUANT", QUANT], ["REASONING", REASONING]]) {
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
  addAll(ENGLISH, ENGLISH_TARGETS);
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
