// Tricky batch #4 — all NEW concepts (no overlap with batches 1-3). English-
// heavy. Every answer hand-verified. Tagged MEDIUM/HARD/EXPERT. Tier 1 first.
//   node scripts/add-tricky4.cjs            (insert)
//   node scripts/add-tricky4.cjs --verify   (print only)
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
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: TENACIOUS", o: ["Persistent", "Weak", "Temporary", "Loose"], c: 0, e: "Tenacious = holding firmly → persistent." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: BENEVOLENT", o: ["Kind", "Cruel", "Wealthy", "Violent"], c: 0, e: "Benevolent = well-meaning, kind. 'Cruel' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: INNOCUOUS", o: ["Harmless", "Innocent", "Harmful", "Guilty"], c: 0, e: "Innocuous = not harmful → harmless. 'Innocent' is the sound-alike trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: VINDICTIVE", o: ["Revengeful", "Justified", "Victorious", "Forgiving"], c: 0, e: "Vindictive = vengeful. 'Justified' (vindicated) and 'Victorious' are traps." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: AUDACIOUS", o: ["Bold", "Audible", "Timid", "Honest"], c: 0, e: "Audacious = daring → bold. 'Audible' is the sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: METICULOUS", o: ["Careful", "Careless", "Quick", "Messy"], c: 0, e: "Meticulous = very careful about detail. 'Careless' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: NEBULOUS", o: ["Vague", "Clear", "Heavenly", "Bright"], c: 0, e: "Nebulous = unclear → vague. 'Heavenly' (nebula) is the trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: SPURIOUS", o: ["Fake", "Genuine", "Spirited", "Sudden"], c: 0, e: "Spurious = not genuine → fake. 'Genuine' is the opposite trap." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: EXONERATE", o: ["Convict", "Acquit", "Pardon", "Release"], c: 0, e: "Exonerate = absolve; antonym convict. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: AMICABLE", o: ["Hostile", "Friendly", "Cordial", "Pleasant"], c: 0, e: "Amicable = friendly; antonym hostile. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: HUMILITY", o: ["Arrogance", "Modesty", "Shyness", "Meekness"], c: 0, e: "Humility = modesty; antonym arrogance. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: SCARCE", o: ["Abundant", "Rare", "Limited", "Few"], c: 0, e: "Scarce = in short supply; antonym abundant. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: CONCEAL", o: ["Reveal", "Hide", "Cover", "Mask"], c: 0, e: "Conceal = hide; antonym reveal. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: DETER", o: ["Encourage", "Prevent", "Discourage", "Hinder"], c: 0, e: "Deter = discourage from acting; antonym encourage. The rest are synonyms." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A person who studies the weather and atmosphere'", o: ["Meteorologist", "Astrologer", "Geologist", "Astronomer"], c: 0, e: "Meteorologist studies weather; astronomer studies stars (trap)." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A list of items to be discussed at a meeting'", o: ["Agenda", "Minutes", "Memorandum", "Schedule"], c: 0, e: "Agenda. 'Minutes' is the record made after (trap)." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A person who journeys to a sacred place'", o: ["Pilgrim", "Tourist", "Nomad", "Vagrant"], c: 0, e: "Pilgrim travels to a holy place." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A person who pretends to be what he is not'", o: ["Hypocrite", "Liar", "Traitor", "Cynic"], c: 0, e: "Hypocrite pretends to virtues he lacks." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'That which cannot be satisfied'", o: ["Insatiable", "Incurable", "Insufferable", "Inevitable"], c: 0, e: "Insatiable = impossible to satisfy." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A medicine that counteracts a poison'", o: ["Antidote", "Antiseptic", "Antibiotic", "Vaccine"], c: 0, e: "Antidote counters poison. Antiseptic prevents infection (trap)." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To turn a blind eye'", o: ["To deliberately ignore", "To lose one's sight", "To be unaware", "To forgive readily"], c: 0, e: "To pretend not to notice something wrong." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To make a mountain out of a molehill'", o: ["To exaggerate a minor problem", "To climb with effort", "To work very hard", "To achieve greatness"], c: 0, e: "To treat a trivial matter as very serious." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To hit the nail on the head'", o: ["To be exactly right", "To work with tools", "To act harshly", "To finish quickly"], c: 0, e: "To describe exactly what is causing a situation." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'A fish out of water'", o: ["Uncomfortable in unfamiliar surroundings", "A rare sight", "A wasted effort", "A free spirit"], c: 0, e: "Someone in an unfamiliar and uneasy situation." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: \"To pull someone's leg\"", o: ["To tease or joke with someone", "To trip someone", "To help someone up", "To delay someone"], c: 0, e: "To playfully deceive or tease someone." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To call it a day'", o: ["To stop work for the day", "To name an occasion", "To celebrate success", "To make a decision"], c: 0, e: "To decide to stop doing something for the time being." },
  { t: "Error Spotting", d: "EXPERT", q: "Identify the part with the error: Between you and I, (A) / this risky plan is bound (B) / to fail miserably. (C) / No error (D)", o: ["A", "B", "C", "D"], c: 0, e: "After a preposition use the object form: 'between you and me'." },
  { t: "Error Spotting", d: "HARD", q: "Identify the part with the error: The newly formed committee (A) / comprises of seven (B) / senior members. (C) / No error (D)", o: ["B", "A", "C", "D"], c: 0, e: "'Comprises' is not followed by 'of': 'comprises seven members'." },
  { t: "Fill in the Blanks", d: "HARD", q: "Fill in the blank: 'Smoking has an ______ effect on one's health.'", o: ["adverse", "averse", "adept", "adroit"], c: 0, e: "Adverse = harmful. 'Averse' = unwilling (trap)." },
  { t: "Fill in the Blanks", d: "HARD", q: "Fill in the blank: 'Everyone attended the function ______ Rohan, who was unwell.'", o: ["except", "accept", "expect", "excepting"], c: 0, e: "Except = apart from. 'Accept' = to receive (trap)." },
];

const QUANT = [
  { t: "Boats & Streams", d: "MEDIUM", q: "A man swims 30 km downstream and 18 km upstream, each in 3 hours. Find the speed of the stream.", o: ["2 km/h", "3 km/h", "4 km/h", "1 km/h"], c: 0, e: "Down = 10, Up = 6 → stream = (10−6)/2 = 2 km/h." },
  { t: "Partnership", d: "HARD", q: "A starts a business with ₹5000. After some months B joins with ₹6000 and stays for 5 months. At the year-end the profit is ₹9000 and A invested for the full 12 months. Find A's share.", o: ["₹6000", "₹4500", "₹5000", "₹3000"], c: 0, e: "A=5000×12=60000, B=6000×5=30000 → 2:1 → A = 9000×2/3 = ₹6000." },
  { t: "Percentage", d: "MEDIUM", q: "The price of an article is reduced by 20%. By what percent must it be increased to restore the original price?", o: ["25%", "20%", "22%", "30%"], c: 0, e: "Increase = 20/(100−20) = 25%." },
  { t: "Profit and Loss", d: "HARD", q: "A shopkeeper marks his goods 50% above cost and sells them at a discount of 20%. If his profit is ₹240, what is the cost price?", o: ["₹1200", "₹1000", "₹1500", "₹960"], c: 0, e: "1.5×0.8 = 1.2 → 20% profit = 240 → CP = ₹1200." },
  { t: "Number System", d: "HARD", q: "The sum of two numbers is 36 and their HCF is 6. How many such pairs of numbers are possible?", o: ["1", "2", "3", "4"], c: 0, e: "6a+6b=36 → a+b=6 with a,b coprime → only {1,5} → 1 pair." },
  { t: "Number System", d: "MEDIUM", q: "The product of two co-prime numbers is 117. What is their LCM?", o: ["117", "39", "13", "9"], c: 0, e: "Co-prime numbers have HCF 1, so LCM = product = 117." },
  { t: "Algebra", d: "EXPERT", q: "If x = √3 + √2, then the value of x² + 1/x² is:", o: ["10", "8", "12", "14"], c: 0, e: "x² = 5+2√6, 1/x² = 5−2√6 → sum = 10." },
  { t: "Algebra", d: "EXPERT", q: "If p + q + r = 0, then the value of (p² + q² + r²)/(pq + qr + rp) is:", o: ["−2", "2", "−1", "1"], c: 0, e: "p²+q²+r² = −2(pq+qr+rp) → ratio = −2." },
  { t: "Trigonometry", d: "HARD", q: "If 5 tan θ = 4, then the value of (5 sin θ − 3 cos θ)/(5 sin θ + 2 cos θ) is:", o: ["1/6", "1/3", "1/2", "2/3"], c: 0, e: "tan θ = 4/5 → (5·(4/5)−3)/(5·(4/5)+2) = (4−3)/(4+2) = 1/6." },
  { t: "Mensuration", d: "MEDIUM", q: "The volume of a cube is 1728 cm³. What is its total surface area?", o: ["864 cm²", "576 cm²", "1296 cm²", "432 cm²"], c: 0, e: "Side = ∛1728 = 12 → TSA = 6×12² = 864 cm²." },
  { t: "Time & Work", d: "HARD", q: "A is twice as efficient as B, and together they can finish a piece of work in 12 days. In how many days can A alone finish it?", o: ["18 days", "24 days", "16 days", "20 days"], c: 0, e: "Let B = x, A = 2x; 3x = 1/12 → A = 2/36 = 1/18 → 18 days." },
  { t: "Simple Interest", d: "HARD", q: "A sum of money doubles itself in 8 years at simple interest. In how many years will it become three times itself?", o: ["16 years", "24 years", "20 years", "12 years"], c: 0, e: "Doubling means SI = P in 8 yr; tripling needs SI = 2P → 16 years." },
  { t: "Averages", d: "MEDIUM", q: "What is the average of the first five multiples of 7?", o: ["21", "28", "17.5", "24.5"], c: 0, e: "(7+14+21+28+35)/5 = 105/5 = 21." },
  { t: "Time, Speed & Distance", d: "HARD", q: "Walking at three-fourths of his usual speed, a man reaches his office 20 minutes late. What is his usual time to reach the office?", o: ["60 minutes", "45 minutes", "50 minutes", "80 minutes"], c: 0, e: "(4/3)T = T + 20 → T/3 = 20 → T = 60 minutes." },
];

const REASONING = [
  { t: "Coding-Decoding", d: "HARD", q: "If 'FROG' is coded as 'COND' (each letter shifted back by 3), how is 'BIRD' coded?", o: ["YFOA", "YEOA", "ZFOA", "YFPA"], c: 0, e: "Each letter −3: B→Y, I→F, R→O, D→A → YFOA." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 2, 3, 5, 7, 11, 13, ?", o: ["17", "15", "19", "16"], c: 0, e: "These are consecutive prime numbers → next is 17." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 1, 1, 2, 3, 5, 8, ?", o: ["13", "11", "12", "14"], c: 0, e: "Fibonacci: each term is the sum of the previous two → 5+8 = 13." },
  { t: "Letter Series", d: "HARD", q: "Find the next term: A, C, F, J, O, ?", o: ["U", "T", "V", "S"], c: 0, e: "Gaps +2, +3, +4, +5, +6 → O(15)+6 = 21 = U." },
  { t: "Analogy", d: "MEDIUM", q: "Cup : Tea :: Bowl : ?", o: ["Soup", "Spoon", "Plate", "Kitchen"], c: 0, e: "A cup holds tea; a bowl holds soup." },
  { t: "Analogy", d: "MEDIUM", q: "7 : 56 :: 9 : ?", o: ["90", "72", "81", "63"], c: 0, e: "7×8 = 56, so 9×10 = 90 (n × (n+1))." },
  { t: "Classification", d: "HARD", q: "Find the odd one out: January, March, May, June", o: ["June", "January", "March", "May"], c: 0, e: "January, March and May have 31 days; June has 30." },
  { t: "Blood Relations", d: "EXPERT", q: "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?", o: ["Mother", "Sister", "Aunt", "Grandmother"], c: 0, e: "The only daughter of the woman's mother is the woman herself → she is his mother." },
  { t: "Direction Sense", d: "EXPERT", q: "A man facing North turns 135° clockwise and then 180° anticlockwise. Which direction is he facing now?", o: ["North-West", "South-East", "North-East", "South-West"], c: 0, e: "North +135° CW = South-East; then −180° = North-West." },
  { t: "Ranking & Order", d: "HARD", q: "In a row of 25 students, A is 10th from the left. B is 5 places to the right of A. What is B's position from the right end?", o: ["11th", "10th", "12th", "9th"], c: 0, e: "B is 15th from left → from right = 25 − 15 + 1 = 11th." },
  { t: "Mathematical Operations", d: "HARD", q: "If 8 + 4 = 96, 7 + 3 = 63 and 6 + 2 = 36, then 9 + 5 = ?", o: ["135", "120", "126", "140"], c: 0, e: "Pattern (a × b × 3): 9 × 5 × 3 = 135." },
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
