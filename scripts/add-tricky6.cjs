// Tricky batch #6 — all NEW concepts AND varied formats (narration, voice,
// prepositions, spelling, cloze, idioms) so patterns stay diverse too. No
// overlap with batches 1-5. Every answer hand-verified. Tier 1 first.
//   node scripts/add-tricky6.cjs            (insert)
//   node scripts/add-tricky6.cjs --verify   (print only)
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
  // Synonyms (few — format already common; words are new)
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: WANE", o: ["Decline", "Grow", "Shine", "Want"], c: 0, e: "Wane = to decrease → decline. 'Want' is a sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: CHRONIC", o: ["Persistent", "Sudden", "Severe", "Chronological"], c: 0, e: "Chronic = persisting for a long time → persistent. 'Chronological' is a sound-alike trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: TRIVIAL", o: ["Insignificant", "Important", "Threefold", "Tribal"], c: 0, e: "Trivial = of little importance → insignificant." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: ENCOURAGE", o: ["Discourage", "Support", "Inspire", "Motivate"], c: 0, e: "Encourage; antonym discourage. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: ARTIFICIAL", o: ["Natural", "Synthetic", "Fake", "Man-made"], c: 0, e: "Artificial; antonym natural. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: EXPAND", o: ["Contract", "Enlarge", "Stretch", "Widen"], c: 0, e: "Expand; antonym contract. The rest are synonyms." },
  // Spelling
  { t: "Spelling", d: "EXPERT", q: "Select the correctly spelt word.", o: ["Conscientious", "Concientious", "Conscientous", "Consciencious"], c: 0, e: "Correct: Conscientious." },
  { t: "Spelling", d: "HARD", q: "Select the correctly spelt word.", o: ["Maintenance", "Maintainance", "Maintenence", "Maintanance"], c: 0, e: "Correct: Maintenance." },
  { t: "Spelling", d: "HARD", q: "Select the correctly spelt word.", o: ["Occurrence", "Occurence", "Ocurrence", "Occurrance"], c: 0, e: "Correct: Occurrence (double c, double r)." },
  { t: "Spelling", d: "HARD", q: "Select the correctly spelt word.", o: ["Privilege", "Priviledge", "Privelege", "Privilage"], c: 0, e: "Correct: Privilege." },
  // One-word
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A word or phrase that reads the same backward as forward'", o: ["Palindrome", "Anagram", "Acronym", "Homonym"], c: 0, e: "Palindrome (e.g. 'madam'). An anagram rearranges letters (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person who collects coins'", o: ["Numismatist", "Philatelist", "Archivist", "Curator"], c: 0, e: "Numismatist collects coins; a philatelist collects stamps (trap)." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person who collects and studies postage stamps'", o: ["Philatelist", "Numismatist", "Bibliophile", "Cartographer"], c: 0, e: "Philatelist collects stamps." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'An abnormal fear of heights'", o: ["Acrophobia", "Agoraphobia", "Claustrophobia", "Hydrophobia"], c: 0, e: "Acrophobia = fear of heights." },
  // Idioms
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To face the music'", o: ["To accept the unpleasant consequences of one's actions", "To enjoy a concert", "To stay calm", "To perform on stage"], c: 0, e: "To confront the consequences of one's actions." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To put the cart before the horse'", o: ["To do things in the wrong order", "To work very hard", "To waste time", "To plan carefully"], c: 0, e: "To reverse the proper order of things." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To be a wet blanket'", o: ["A person who spoils others' enjoyment", "A lazy person", "A wealthy person", "A shy person"], c: 0, e: "Someone who dampens the enthusiasm of others." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To rest on one's laurels'", o: ["To be satisfied with past achievements and stop trying", "To take a deserved rest", "To win a great honour", "To work tirelessly"], c: 0, e: "To rely on past success instead of striving further." },
  // Narration (direct → indirect)
  { t: "Narration", d: "HARD", q: "Select the correct indirect speech: He said, 'I will come tomorrow.'", o: ["He said that he would come the next day.", "He said that he will come tomorrow.", "He said that he would come tomorrow.", "He says that he would come the next day."], c: 0, e: "'will' → 'would' and 'tomorrow' → 'the next day'." },
  { t: "Narration", d: "EXPERT", q: "Select the correct indirect speech: She said to me, 'Where are you going?'", o: ["She asked me where I was going.", "She asked me where was I going.", "She asked me where I am going.", "She told me where I was going."], c: 0, e: "Question word + subject + verb; 'are' → 'was'." },
  { t: "Narration", d: "HARD", q: "Select the correct indirect speech: The teacher said, 'The sun rises in the east.'", o: ["The teacher said that the sun rises in the east.", "The teacher said that the sun rose in the east.", "The teacher said that the sun is rising in the east.", "The teacher told that the sun rises in the east."], c: 0, e: "A universal truth stays in the present tense." },
  // Voice
  { t: "Active and Passive Voice", d: "HARD", q: "Change to passive voice: 'The cat killed the mouse.'", o: ["The mouse was killed by the cat.", "The mouse is killed by the cat.", "The mouse was being killed by the cat.", "The mouse has killed by the cat."], c: 0, e: "Simple past passive: 'was killed by'." },
  { t: "Active and Passive Voice", d: "HARD", q: "Change to passive voice: 'People speak English all over the world.'", o: ["English is spoken all over the world.", "English was spoken all over the world.", "English is being spoken all over the world.", "English has spoken all over the world."], c: 0, e: "Present simple passive: 'is spoken'." },
  // Prepositions / sentence completion
  { t: "Fill in the Blanks", d: "HARD", q: "Fill in the blank with the correct preposition: 'His views are quite different ______ mine.'", o: ["from", "than", "to", "with"], c: 0, e: "Standard usage: 'different from'." },
  { t: "Fill in the Blanks", d: "HARD", q: "Fill in the blank with the correct preposition: 'She has been married ______ a doctor for ten years.'", o: ["to", "with", "by", "for"], c: 0, e: "Standard usage: 'married to'." },
  { t: "Fill in the Blanks", d: "HARD", q: "Fill in the blank with the correct preposition: 'He insisted ______ paying the entire bill himself.'", o: ["on", "in", "at", "for"], c: 0, e: "Standard usage: 'insist on'." },
  // Cloze-style vocabulary in context
  { t: "Fill in the Blanks", d: "EXPERT", q: "Fill in the blank: 'Despite his ______ efforts, the project failed to meet the deadline.'", o: ["strenuous", "strident", "stringent", "strangulated"], c: 0, e: "Strenuous = requiring great effort. The others don't fit the context." },
  { t: "Fill in the Blanks", d: "EXPERT", q: "Fill in the blank: 'The judge was known for delivering ______ verdicts, free from any bias.'", o: ["impartial", "partial", "impassive", "imperial"], c: 0, e: "Impartial = unbiased. 'Partial' is the opposite trap." },
];

const QUANT = [
  { t: "Mixture & Alligation", d: "HARD", q: "In what ratio must water be mixed with milk costing ₹20 per litre so that selling the mixture at ₹22.50 per litre gives a 25% profit?", o: ["1 : 9", "1 : 8", "2 : 9", "1 : 10"], c: 0, e: "CP of mixture = 22.5/1.25 = 18; alligation (20−18):(18−0) = 2:18 = 1:9 (water:milk)." },
  { t: "Number System", d: "HARD", q: "How many numbers from 1 to 200 are divisible by 2 or 3?", o: ["133", "134", "132", "130"], c: 0, e: "100 + 66 − 33 = 133 (inclusion-exclusion)." },
  { t: "Number System", d: "HARD", q: "Find the remainder when 4⁶¹ is divided by 7.", o: ["4", "2", "1", "5"], c: 0, e: "4³ = 64 ≡ 1 (mod 7); 61 = 3×20+1 → 4⁶¹ ≡ 4." },
  { t: "Percentage", d: "EXPERT", q: "A candidate scoring 30% of the maximum marks fails by 30 marks, while another scoring 40% gets 20 marks more than the pass mark. What are the maximum marks?", o: ["500", "400", "600", "450"], c: 0, e: "0.3M + 30 = 0.4M − 20 → 0.1M = 50 → M = 500." },
  { t: "Profit and Loss", d: "EXPERT", q: "A man sells an article at 20% profit. Had he bought it at 20% less and sold it for ₹75 less, he would have gained 25%. Find the cost price.", o: ["₹375", "₹400", "₹350", "₹300"], c: 0, e: "1.2x − 75 = 1.25(0.8x) = x → 0.2x = 75 → x = ₹375." },
  { t: "Averages", d: "MEDIUM", q: "The average of 5 consecutive even numbers is 36. What is the smallest of these numbers?", o: ["32", "30", "34", "28"], c: 0, e: "Middle = 36 → 32, 34, 36, 38, 40 → smallest 32." },
  { t: "Ratio & Proportion", d: "MEDIUM", q: "If A : B = 3 : 4 and B : C = 8 : 9, then A : C is:", o: ["2 : 3", "3 : 9", "1 : 3", "6 : 8"], c: 0, e: "A:B = 6:8, B:C = 8:9 → A:C = 6:9 = 2:3." },
  { t: "Time & Work", d: "EXPERT", q: "A and B can do a work in 18 days, B and C in 24 days, and A and C in 36 days. In how many days can A alone do it?", o: ["48 days", "36 days", "24 days", "60 days"], c: 0, e: "2(a+b+c) = 1/18+1/24+1/36 = 1/8 → a+b+c = 1/16; a = 1/16 − 1/24 = 1/48 → 48 days." },
  { t: "Simple Interest", d: "HARD", q: "A certain sum at simple interest amounts to ₹2520 in 2 years and ₹2700 in 3 years. Find the sum.", o: ["₹2160", "₹2250", "₹2000", "₹2340"], c: 0, e: "1-year interest = 2700−2520 = 180; sum = 2520 − 2×180 = ₹2160." },
  { t: "Mensuration", d: "MEDIUM", q: "The diagonals of a rhombus are 16 cm and 30 cm. Find its perimeter.", o: ["68 cm", "60 cm", "64 cm", "72 cm"], c: 0, e: "Side = √(8²+15²) = 17 → perimeter = 4×17 = 68 cm." },
  { t: "Mensuration", d: "HARD", q: "A rectangular field is 60 m long and 40 m wide. A path 5 m wide runs all around it on the outside. Find the area of the path.", o: ["1100 m²", "1000 m²", "1200 m²", "1050 m²"], c: 0, e: "Outer 70×50 = 3500; field 2400 → path = 1100 m²." },
  { t: "Algebra", d: "HARD", q: "If x − 1/x = 5, then the value of x² + 1/x² is:", o: ["27", "23", "25", "29"], c: 0, e: "x² + 1/x² = (x − 1/x)² + 2 = 25 + 2 = 27." },
  { t: "Trigonometry", d: "HARD", q: "If tan θ + cot θ = 2, then the value of tan² θ + cot² θ is:", o: ["2", "4", "1", "0"], c: 0, e: "(tanθ+cotθ)² = tan²θ+cot²θ+2 → 4 = X + 2 → X = 2." },
  { t: "Time, Speed & Distance", d: "HARD", q: "A train crosses a pole in 12 seconds and a 200 m long platform in 32 seconds. Find the length of the train.", o: ["120 m", "150 m", "100 m", "180 m"], c: 0, e: "(L+200)/32 = L/12 → 12L+2400 = 32L → L = 120 m." },
];

const REASONING = [
  { t: "Coding-Decoding", d: "HARD", q: "If 'MANGO' is coded as 'OCPIQ' (each letter shifted forward by 2), how is 'APPLE' coded?", o: ["CRRNG", "CRRNF", "CQRNG", "BRRNG"], c: 0, e: "Each letter +2: A→C, P→R, P→R, L→N, E→G → CRRNG." },
  { t: "Number Series", d: "MEDIUM", q: "Find the next term: 1, 8, 27, 64, ?", o: ["125", "100", "81", "121"], c: 0, e: "Perfect cubes: 1³, 2³, 3³, 4³, 5³ = 125." },
  { t: "Number Series", d: "HARD", q: "Find the next term: 2, 5, 10, 17, 26, ?", o: ["37", "36", "35", "38"], c: 0, e: "Pattern n²+1: 1+1, 4+1, 9+1, 16+1, 25+1, 36+1 = 37." },
  { t: "Analogy", d: "MEDIUM", q: "Author : Book :: Composer : ?", o: ["Music", "Piano", "Song", "Orchestra"], c: 0, e: "An author creates a book; a composer creates music." },
  { t: "Classification", d: "HARD", q: "Find the odd one out: 25, 36, 49, 60", o: ["60", "25", "36", "49"], c: 0, e: "25, 36, 49 are perfect squares; 60 is not." },
  { t: "Blood Relations", d: "EXPERT", q: "A's father is B's son. C is B's father. How is A related to C?", o: ["Great-grandson", "Grandson", "Son", "Nephew"], c: 0, e: "B is A's grandfather (A's father is B's son); C is B's father → A's great-grandfather → A is C's great-grandson." },
  { t: "Direction Sense", d: "EXPERT", q: "At sunrise, a man's shadow falls towards his right. Which direction is he facing?", o: ["South", "North", "East", "West"], c: 0, e: "Sun rises in the East, so the shadow falls West. If West is to his right, he faces South." },
  { t: "Ranking & Order", d: "MEDIUM", q: "In a class of 60 students, a student ranks 25th from the top. What is the student's rank from the bottom?", o: ["36th", "35th", "34th", "37th"], c: 0, e: "60 − 25 + 1 = 36th." },
  { t: "Letter Series", d: "HARD", q: "Find the next term: AC, EG, IK, MO, ?", o: ["QS", "PR", "QR", "PS"], c: 0, e: "First letters A,E,I,M,Q (+4); second letters C,G,K,O,S (+4) → QS." },
  { t: "Mathematical Operations", d: "HARD", q: "If a @ b means a² + b, then the value of 3 @ 4 is:", o: ["13", "10", "16", "25"], c: 0, e: "3² + 4 = 9 + 4 = 13." },
  { t: "Syllogism", d: "HARD", q: "Statements: Some books are pens. All pens are red. Conclusions: I. Some books are red. II. All books are red. Which conclusion follows?", o: ["Only I follows", "Only II follows", "Both follow", "Neither follows"], c: 0, e: "The books that are pens must be red (I). 'All books' is not established (II)." },
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
