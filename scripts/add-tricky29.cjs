// Tricky batch #29 — EXTREME-HARD QUANT only. Hand-verified. All EXPERT.
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
  { t: "Data Interpretation", d: "EXPERT", q: "A shop sold 200 items: 40% shirts, 35% trousers and the rest jackets. Shirts sell at ₹500, trousers at ₹800 and jackets at ₹1200 each. Find the total revenue.", o: ["₹156000", "₹150000", "₹160000", "₹148000"], c: 0, e: "80×500 + 70×800 + 50×1200 = 40000 + 56000 + 60000 = ₹156000." },
  { t: "Averages", d: "EXPERT", q: "If the average of 5 consecutive even numbers is 2x, then the sum of the smallest and the largest of them is:", o: ["4x", "2x", "8x", "x"], c: 0, e: "Smallest = 2x−4, largest = 2x+4 → sum = 4x." },
  { t: "Pipes & Cisterns", d: "EXPERT", q: "Two pipes fill a tank in 15 and 20 minutes. They are opened alternately for 1 minute each, starting with the first pipe. After how many minutes is the tank full?", o: ["17 minutes", "16 minutes", "18 minutes", "17.5 minutes"], c: 0, e: "Per 2-min cycle = 7/60; after 16 min = 56/60; the first pipe fills the remaining 1/15 in the 17th minute → 17 minutes." },
  { t: "Ratio & Proportion", d: "EXPERT", q: "If a : b = 2 : 3, b : c = 4 : 5 and c : d = 6 : 7, then a : d is:", o: ["16 : 35", "8 : 15", "2 : 7", "12 : 35"], c: 0, e: "Chaining the ratios: a : d = 16 : 35." },
  { t: "Compound Interest", d: "EXPERT", q: "The compound interest on a sum for 2 years is ₹410 and the simple interest for the same period is ₹400. Find the rate of interest.", o: ["5%", "4%", "6%", "8%"], c: 0, e: "Difference 10 = (SI/2)×r/100 = 200×r/100 → r = 5%." },
  { t: "Ages", d: "EXPERT", q: "A man's present age is 5 times his son's age. Five years from now, he will be 3 times as old as his son. What is the man's present age?", o: ["25 years", "30 years", "20 years", "35 years"], c: 0, e: "5x+5 = 3(x+5) → x = 5 → man = 25 years." },
  { t: "Number System", d: "EXPERT", q: "Find the smallest number which when divided by 5, 6 and 7 leaves remainders 2, 3 and 4 respectively.", o: ["207", "210", "213", "203"], c: 0, e: "Each remainder is 3 less than its divisor → LCM(5,6,7) − 3 = 210 − 3 = 207." },
  { t: "Trigonometry", d: "EXPERT", q: "If sin θ = cos θ, then the value of (sin⁴θ + cos⁴θ) is:", o: ["1/2", "1", "1/4", "3/4"], c: 0, e: "θ = 45° → sin⁴θ + cos⁴θ = 1/4 + 1/4 = 1/2." },
  { t: "Mensuration", d: "EXPERT", q: "The perimeter of a rhombus is 40 cm and one of its angles is 60°. Find its area.", o: ["50√3 cm²", "100√3 cm²", "25√3 cm²", "50 cm²"], c: 0, e: "Side = 10; area = s²·sin60° = 100×(√3/2) = 50√3 cm²." },
  { t: "Boats & Streams", d: "EXPERT", q: "A boat's speed in still water is 15 km/h. It travels 30 km downstream and returns in 4.5 hours. Find the speed of the stream.", o: ["5 km/h", "4 km/h", "6 km/h", "3 km/h"], c: 0, e: "900/(225 − s²) = 4.5 → 225 − s² = 200 → s = 5 km/h." },
  { t: "Algebra", d: "EXPERT", q: "Find the value of 1/log₂30 + 1/log₃30 + 1/log₅30.", o: ["1", "2", "0", "30"], c: 0, e: "= log₃₀2 + log₃₀3 + log₃₀5 = log₃₀(2·3·5) = log₃₀30 = 1." },
  { t: "Profit and Loss", d: "EXPERT", q: "A shopkeeper marks his goods 60% above cost and allows two successive discounts of 25% and 20%. Find his profit or loss percent.", o: ["4% loss", "4% profit", "No profit no loss", "5% loss"], c: 0, e: "1.6 × 0.75 × 0.8 = 0.96 → 4% loss." },
  { t: "Permutation & Combination", d: "EXPERT", q: "In how many distinct ways can the letters of the word 'MISSISSIPPI' be arranged?", o: ["34650", "39916800", "11550", "46200"], c: 0, e: "11!/(4!·4!·2!) = 34650 (4 I's, 4 S's, 2 P's)." },
  { t: "Time & Work", d: "EXPERT", q: "12 men can complete a work in 18 days. After 6 days, 4 men leave. In how many more days will the remaining men finish the work?", o: ["18 days", "15 days", "12 days", "20 days"], c: 0, e: "Total 216 man-days; 72 done; 144 left with 8 men → 18 days." },
  { t: "Number System", d: "EXPERT", q: "Find the HCF of (2⁴ × 3³ × 5) and (2² × 3⁵ × 7²).", o: ["108", "72", "216", "54"], c: 0, e: "Lowest powers of common primes: 2² × 3³ = 4 × 27 = 108." },
  { t: "Simplification", d: "EXPERT", q: "Rationalise and simplify: 1/(√3 − √2).", o: ["√3 + √2", "√3 − √2", "1", "5"], c: 0, e: "Multiply by (√3+√2): (√3+√2)/(3−2) = √3 + √2." },
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
  console.log(`Batch 29 (extreme quant) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
