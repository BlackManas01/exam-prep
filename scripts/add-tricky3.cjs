// Tricky batch #3 — all NEW concepts (no overlap with batches 1-2). Heavy on
// English (deepest distinct pool) plus fresh quant/reasoning. Every answer
// hand-verified. Tagged across MEDIUM/HARD/EXPERT. ssc-cgl-tier1 first.
//   node scripts/add-tricky3.cjs            (insert)
//   node scripts/add-tricky3.cjs --verify   (print only)
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
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: GARRULOUS", o: ["Talkative", "Quiet", "Clever", "Angry"], c: 0, e: "Garrulous = excessively talkative." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: FORTUITOUS", o: ["Accidental", "Fortunate", "Deliberate", "Disastrous"], c: 0, e: "Fortuitous = happening by chance → accidental. 'Fortunate' is the sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: PLACATE", o: ["Appease", "Provoke", "Punish", "Please"], c: 0, e: "Placate = to pacify → appease. 'Provoke' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: RECALCITRANT", o: ["Disobedient", "Obedient", "Reluctant", "Calculating"], c: 0, e: "Recalcitrant = resisting authority → disobedient. 'Obedient' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: ABSTRUSE", o: ["Obscure", "Obvious", "Abstract", "Absurd"], c: 0, e: "Abstruse = hard to understand → obscure. 'Abstract' is the sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: EBULLIENT", o: ["Enthusiastic", "Boiling", "Gloomy", "Bubbly"], c: 0, e: "Ebullient = cheerful and full of energy → enthusiastic. 'Boiling' is the literal trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: SUCCINCT", o: ["Concise", "Successful", "Lengthy", "Sweet"], c: 0, e: "Succinct = briefly and clearly expressed → concise. 'Successful' is a sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: INDIGENT", o: ["Poor", "Native", "Angry", "Wealthy"], c: 0, e: "Indigent = needy/poor. 'Native' confuses it with 'indigenous'." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: AMELIORATE", o: ["Worsen", "Improve", "Soften", "Help"], c: 0, e: "Ameliorate = to improve; antonym worsen. 'Improve' is the synonym trap." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: EXTOL", o: ["Condemn", "Praise", "Exalt", "Glorify"], c: 0, e: "Extol = praise highly; antonym condemn. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: OPAQUE", o: ["Transparent", "Cloudy", "Dull", "Dark"], c: 0, e: "Opaque = not see-through; antonym transparent." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: PROLIFIC", o: ["Unproductive", "Fertile", "Abundant", "Productive"], c: 0, e: "Prolific = highly productive; antonym unproductive. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: LETHARGIC", o: ["Energetic", "Lazy", "Sluggish", "Dull"], c: 0, e: "Lethargic = sluggish; antonym energetic. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: ZENITH", o: ["Nadir", "Peak", "Summit", "Apex"], c: 0, e: "Zenith = highest point; antonym nadir (lowest). The rest are synonyms." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A place where birds are kept'", o: ["Aviary", "Apiary", "Sanctuary", "Hive"], c: 0, e: "Aviary. An apiary is for bees (trap)." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A person who loves and collects books'", o: ["Bibliophile", "Bookworm", "Librarian", "Scholar"], c: 0, e: "Bibliophile (biblio = book, phile = lover)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A speech made without prior preparation'", o: ["Extempore", "Eloquence", "Oration", "Prologue"], c: 0, e: "Extempore = impromptu speech." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'The scientific study of birds'", o: ["Ornithology", "Entomology", "Zoology", "Etymology"], c: 0, e: "Ornithology. Entomology = insects (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person who walks in their sleep'", o: ["Somnambulist", "Somniloquist", "Insomniac", "Lunatic"], c: 0, e: "Somnambulist. A somniloquist talks in sleep (trap)." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A doctor who specialises in treating children'", o: ["Paediatrician", "Gynaecologist", "Pedicurist", "Orthopaedist"], c: 0, e: "Paediatrician. 'Pedicurist' (foot care) is the sound-alike trap." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To let the cat out of the bag'", o: ["To reveal a secret", "To cause confusion", "To free someone", "To start trouble"], c: 0, e: "To accidentally reveal a secret." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'A blessing in disguise'", o: ["A good thing that seemed bad at first", "A hidden enemy", "An obvious benefit", "A secret gift"], c: 0, e: "Something that appears bad but turns out beneficial." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To add fuel to the fire'", o: ["To make a bad situation worse", "To start cooking", "To motivate someone", "To end a dispute"], c: 0, e: "To worsen an already tense situation." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To bite the bullet'", o: ["To endure a painful situation bravely", "To act recklessly", "To eat hurriedly", "To pick a fight"], c: 0, e: "To face a difficult situation with courage." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To smell a rat'", o: ["To suspect that something is wrong", "To find something dirty", "To be very afraid", "To search desperately"], c: 0, e: "To sense that something is not right." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To burn the midnight oil'", o: ["To work or study late into the night", "To waste resources", "To cause an accident", "To sleep early"], c: 0, e: "To work or study until late at night." },
  { t: "Error Spotting", d: "HARD", q: "Identify the part with the error: There are less students (A) / in the class today (B) / than there were yesterday. (C) / No error (D)", o: ["A", "B", "C", "D"], c: 0, e: "Use 'fewer' for countable nouns: 'fewer students'." },
  { t: "Error Spotting", d: "EXPERT", q: "Identify the part with the error: Scarcely had he entered the room (A) / than the lights (B) / suddenly went off. (C) / No error (D)", o: ["B", "A", "C", "D"], c: 0, e: "'Scarcely … when' is correct, not 'scarcely … than'." },
  { t: "Error Spotting", d: "HARD", q: "Identify the part with the error: He distributed the sweets (A) / among the two children (B) / very fairly. (C) / No error (D)", o: ["B", "A", "C", "D"], c: 0, e: "Use 'between' for two; 'among' is for more than two." },
  { t: "Fill in the Blanks", d: "EXPERT", q: "Fill in the blank: 'A swift response prevented the ______ collapse of the bridge.'", o: ["imminent", "eminent", "immanent", "eminently"], c: 0, e: "Imminent = about to happen. 'Eminent' = distinguished (trap)." },
  { t: "Fill in the Blanks", d: "HARD", q: "Fill in the blank: 'The doctor's handwriting was so poor that the prescription was completely ______.'", o: ["illegible", "eligible", "ineligible", "legible"], c: 0, e: "Illegible = impossible to read. 'Eligible' (qualified) is the trap." },
  { t: "Fill in the Blanks", d: "HARD", q: "Fill in the blank: 'Before signing the contract, he sought the ______ of an experienced lawyer.'", o: ["counsel", "council", "consul", "councillor"], c: 0, e: "Counsel = advice. 'Council' = an assembly (trap)." },
];

const QUANT = [
  { t: "Percentage", d: "HARD", q: "A is 20% more than B, and B is 25% less than C. A is what percent of C?", o: ["90%", "95%", "100%", "85%"], c: 0, e: "A = 1.2B, B = 0.75C → A = 0.9C = 90% of C." },
  { t: "Mensuration", d: "HARD", q: "The curved surface area of a cone is 550 cm² and the radius of its base is 7 cm. Find its slant height. (π = 22/7)", o: ["25 cm", "20 cm", "24 cm", "28 cm"], c: 0, e: "πrl = 550 → (22/7)(7)l = 550 → 22l = 550 → l = 25 cm." },
  { t: "Time, Speed & Distance", d: "EXPERT", q: "A man covers 600 km, partly by train at 80 km/h and partly by car at 60 km/h, in a total of 8.5 hours. How far did he travel by train?", o: ["360 km", "240 km", "320 km", "400 km"], c: 0, e: "x/80 + (600−x)/60 = 8.5 → 3x + 4(600−x) = 2040 → x = 360 km." },
  { t: "Averages", d: "MEDIUM", q: "The average of 11 numbers is 50. If one number, 65, is removed, what is the average of the remaining numbers?", o: ["48.5", "50", "47.5", "49"], c: 0, e: "(11×50 − 65)/10 = 485/10 = 48.5." },
  { t: "Simple Interest", d: "MEDIUM", q: "At what rate percent per annum will ₹1200 amount to ₹1440 in 4 years at simple interest?", o: ["5%", "4%", "6%", "5.5%"], c: 0, e: "SI = 240 → R = (240×100)/(1200×4) = 5%." },
  { t: "Ratio & Proportion", d: "HARD", q: "₹5600 is divided among A, B and C such that A : B = 2 : 3 and B : C = 4 : 5. Find C's share.", o: ["₹2400", "₹1920", "₹2000", "₹2240"], c: 0, e: "A:B:C = 8:12:15 (sum 35) → C = 5600×15/35 = ₹2400." },
  { t: "Algebra", d: "HARD", q: "If x² − 3x + 1 = 0, then the value of x² + 1/x² is:", o: ["7", "9", "11", "5"], c: 0, e: "x + 1/x = 3 → x² + 1/x² = 3² − 2 = 7." },
  { t: "Algebra", d: "EXPERT", q: "If a³ + b³ = 35 and a + b = 5, then the value of ab is:", o: ["6", "5", "10", "8"], c: 0, e: "a³+b³ = (a+b)³ − 3ab(a+b) → 35 = 125 − 15ab → ab = 6." },
  { t: "Trigonometry", d: "HARD", q: "If 3 sin θ = 4 cos θ, then the value of (3 sin θ + 2 cos θ)/(3 sin θ − 2 cos θ) is:", o: ["3", "2", "5", "1/3"], c: 0, e: "tan θ = 4/3 → (3·(4/3)+2)/(3·(4/3)−2) = 6/2 = 3." },
  { t: "Mensuration", d: "MEDIUM", q: "The diagonal of a square is 8√2 cm. What is the area of the square?", o: ["64 cm²", "32 cm²", "128 cm²", "16 cm²"], c: 0, e: "Diagonal = side√2 → side = 8 → area = 64 cm²." },
  { t: "Number System", d: "HARD", q: "Find the sum of all numbers between 1 and 100 that are divisible by 7.", o: ["735", "728", "742", "700"], c: 0, e: "7+14+…+98 = 7(1+2+…+14) = 7×105 = 735." },
  { t: "Profit and Loss", d: "EXPERT", q: "A man sells two cows for ₹9900 each. On one he gains 10% and on the other he loses 10%. What is his overall loss?", o: ["₹200", "₹100", "₹0", "₹250"], c: 0, e: "CP = 9000 + 11000 = 20000; SP = 19800 → loss ₹200 (1%)." },
  { t: "Percentage", d: "HARD", q: "In an examination, 35% of students failed in Mathematics and 25% failed in English. If 10% failed in both, what percent passed in both subjects?", o: ["50%", "40%", "55%", "45%"], c: 0, e: "Failed in at least one = 35+25−10 = 50% → passed in both = 50%." },
  { t: "Time & Work", d: "HARD", q: "12 men can complete a work in 18 days. Six days after they started, 4 more men joined. In how many more days will the remaining work be completed?", o: ["9 days", "8 days", "10 days", "12 days"], c: 0, e: "Total 216 man-days; 72 done in 6 days; 144 left with 16 men = 9 days." },
];

const REASONING = [
  { t: "Coding-Decoding", d: "HARD", q: "If each letter is replaced by the opposite letter of the alphabet (A↔Z, B↔Y, …), how is 'CAT' coded?", o: ["XZG", "XAG", "YZG", "XZH"], c: 0, e: "C↔X, A↔Z, T↔G → XZG." },
  { t: "Number Series", d: "HARD", q: "Find the next term: 120, 99, 80, 63, 48, ?", o: ["35", "33", "37", "36"], c: 0, e: "Differences −21, −19, −17, −15, −13 → 48 − 13 = 35." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 5, 11, 23, 47, ?", o: ["95", "94", "93", "96"], c: 0, e: "Each term ×2 + 1 → 47×2 + 1 = 95." },
  { t: "Analogy", d: "MEDIUM", q: "Pen : Write :: Knife : ?", o: ["Cut", "Sharp", "Kitchen", "Metal"], c: 0, e: "A pen is used to write; a knife is used to cut." },
  { t: "Classification", d: "HARD", q: "Find the odd one out: 64, 125, 216, 250", o: ["250", "64", "125", "216"], c: 0, e: "64, 125, 216 are perfect cubes (4³, 5³, 6³); 250 is not." },
  { t: "Blood Relations", d: "EXPERT", q: "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?", o: ["Granddaughter", "Daughter", "Grandmother", "Niece"], c: 0, e: "C is A's mother, D is C's father → D is A's grandfather → A is D's granddaughter." },
  { t: "Direction Sense", d: "HARD", q: "Starting from a point, Ravi walks 4 km East, turns left and walks 5 km, then turns left and walks 4 km. How far and in which direction is he from the start?", o: ["5 km North", "5 km South", "4 km East", "9 km North"], c: 0, e: "East 4 and West 4 cancel; net 5 km North." },
  { t: "Ranking & Order", d: "MEDIUM", q: "In a class, Sita is 14th from the top and 30th from the bottom. How many students are there in the class?", o: ["43", "44", "42", "45"], c: 0, e: "14 + 30 − 1 = 43." },
  { t: "Clocks", d: "EXPERT", q: "How many times in a day (24 hours) are the two hands of a clock in a straight line but pointing in opposite directions?", o: ["22", "24", "44", "20"], c: 0, e: "Hands are opposite 11 times every 12 hours → 22 times a day." },
  { t: "Calendar", d: "HARD", q: "If the day before yesterday was Wednesday, what day will it be the day after tomorrow?", o: ["Sunday", "Saturday", "Monday", "Friday"], c: 0, e: "Day before yesterday Wed → today Friday → day after tomorrow Sunday." },
  { t: "Mathematical Operations", d: "HARD", q: "If P means ÷, Q means ×, R means +, and S means −, then 18 P 6 Q 4 R 8 S 5 = ?", o: ["15", "12", "18", "9"], c: 0, e: "18÷6×4 + 8 − 5 = 12 + 8 − 5 = 15." },
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
