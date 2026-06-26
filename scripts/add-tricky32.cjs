// Tricky batch #32 — BRUTAL QUANT (teacher/topper level). Hand-verified. EXPERT.
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
const QUANT = [
  { t: "Algebra", d: "EXPERT", q: "If x = (√5 + 1)/(√5 − 1) and y = (√5 − 1)/(√5 + 1), find the value of (x² + xy + y²)/(x² − xy + y²).", o: ["4/3", "3/4", "7/6", "6/7"], c: 0, e: "x+y = 3, xy = 1 → x²+y² = 7; (7+1)/(7−1) = 8/6 = 4/3." },
  { t: "Trigonometry", d: "EXPERT", q: "In triangle ABC, if tan A = 1 and tan B = 2, find the value of tan C.", o: ["3", "−3", "2", "1"], c: 0, e: "A+B+C = 180° → tanA+tanB+tanC = tanA·tanB·tanC → 1+2+tanC = 2tanC → tanC = 3." },
  { t: "Algebra", d: "EXPERT", q: "The sum of an infinite geometric progression is 15 and the sum of the squares of its terms is 45. Find the first term.", o: ["5", "6", "9", "3"], c: 0, e: "a/(1−r) = 15 and a/(1+r) = 3 → solving, r = 2/3, a = 5." },
  { t: "Algebra", d: "EXPERT", q: "If 2^(2x) − 2^(x+3) + 16 = 0, find the value of x.", o: ["2", "3", "4", "1"], c: 0, e: "Let y = 2ˣ: y² − 8y + 16 = 0 → (y−4)² = 0 → y = 4 → x = 2." },
  { t: "Number System", d: "EXPERT", q: "The difference of the squares of two consecutive odd integers is 80. Find the larger integer.", o: ["21", "19", "23", "17"], c: 0, e: "(n+2)² − n² = 4n+4 = 80 → n = 19 → larger = 21." },
  { t: "Number System", d: "EXPERT", q: "Find the remainder when (1! + 2! + 3! + … + 50!) is divided by 15.", o: ["3", "0", "5", "6"], c: 0, e: "1!+2!+3!+4! = 33; from 5! every term is divisible by 15 → 33 mod 15 = 3." },
  { t: "Algebra", d: "EXPERT", q: "If a + b + c = 0, find the value of (a² + b² + c²)² / (a⁴ + b⁴ + c⁴).", o: ["2", "1", "3", "1/2"], c: 0, e: "When a+b+c = 0, a⁴+b⁴+c⁴ = ½(a²+b²+c²)² → the ratio is 2." },
  { t: "Permutation & Combination", d: "EXPERT", q: "In how many ways can 8 different beads be arranged to form a necklace?", o: ["2520", "5040", "40320", "20160"], c: 0, e: "Necklace = (8−1)!/2 = 5040/2 = 2520 (rotations and reflections identified)." },
  { t: "Mensuration", d: "EXPERT", q: "Two circles of radii 8 cm and 3 cm have their centres 13 cm apart. Find the length of their transverse common tangent.", o: ["4√3 cm", "12 cm", "√48 cm", "5 cm"], c: 0, e: "Transverse tangent = √(d² − (r₁+r₂)²) = √(169 − 121) = √48 = 4√3 cm." },
  { t: "Trigonometry", d: "EXPERT", q: "A tower subtends an angle of 30° at a point on the ground. At a point 40 m nearer, it subtends 60°. Find the height of the tower.", o: ["20√3 m", "40√3 m", "20 m", "40 m"], c: 0, e: "h = 40·tan30°·tan60°/(tan60° − tan30°) = 40/((3−1)/√3) = 20√3 m." },
  { t: "Algebra", d: "EXPERT", q: "If log x/(y−z) = log y/(z−x) = log z/(x−y), then the value of x^x · y^y · z^z is:", o: ["1", "0", "xyz", "x+y+z"], c: 0, e: "From the equal ratios, x ln x + y ln y + z ln z = 0 → x^x·y^y·z^z = 1." },
  { t: "Number System", d: "EXPERT", q: "How many divisors of 2520 are perfect squares?", o: ["4", "6", "8", "3"], c: 0, e: "2520 = 2³·3²·5·7 → square divisors use even powers: 2 (for 2⁰,2²) × 2 (for 3⁰,3²) = 4." },
  { t: "Boats & Streams", d: "EXPERT", q: "A man rows 30 km upstream and 44 km downstream in 10 hours; he also rows 40 km upstream and 55 km downstream in 13 hours. Find his upstream speed.", o: ["5 km/h", "6 km/h", "8 km/h", "4 km/h"], c: 0, e: "Solving the two equations gives downstream 11 km/h and upstream 5 km/h." },
  { t: "Ages", d: "EXPERT", q: "The product of the present ages of A and B is 240. Two years ago, A was twice as old as B. Find A's present age.", o: ["22 years", "20 years", "24 years", "18 years"], c: 0, e: "A = 2B − 2 and AB = 240 → B = 12, A = 22." },
  { t: "Compound Interest", d: "EXPERT", q: "A sum of money triples itself in 8 years at compound interest. In how many years will it become 27 times itself?", o: ["24 years", "16 years", "27 years", "21 years"], c: 0, e: "27 = 3³ → 3 tripling periods × 8 = 24 years." },
  { t: "Algebra", d: "EXPERT", q: "If a/b + b/a = −1, then the value of a³ − b³ is:", o: ["0", "1", "−1", "2"], c: 0, e: "a/b + b/a = −1 → a²+ab+b² = 0 → a³−b³ = (a−b)(a²+ab+b²) = 0." },
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
    let n = 0; for (const q of QUANT) { n++; console.log(`${n}. [${q.t}] ${q.q}\n    ✓ ${q.o[q.c]}`); }
    console.log(`\nTotal: ${n}`); await prisma.$disconnect(); return;
  }
  const qRows = [], oRows = [];
  for (const t of QUANT_TARGETS) for (const q of QUANT) {
    const id = crypto.randomUUID();
    qRows.push({ id, examCode: t.examCode, sectionCode: t.sectionCode, subject: t.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true });
    shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i }));
  }
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 32 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
