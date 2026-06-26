// Tricky batch #23 — EXTREME-HARD QUANT only. Hand-verified. All EXPERT.
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
  { t: "Coordinate Geometry", d: "EXPERT", q: "Find the area of the triangle whose vertices are (1, 2), (4, 5) and (7, 2).", o: ["9 sq units", "12 sq units", "6 sq units", "18 sq units"], c: 0, e: "½|1(5−2)+4(2−2)+7(2−5)| = ½|3+0−21| = 9." },
  { t: "Algebra", d: "EXPERT", q: "If the roots of x² − 6x + k = 0 differ by 2, find the value of k.", o: ["8", "5", "9", "10"], c: 0, e: "(α−β)² = 36 − 4k = 4 → 4k = 32 → k = 8." },
  { t: "Trigonometry", d: "EXPERT", q: "What is the minimum value of (4 sin²θ + 9 cosec²θ)?", o: ["12", "13", "10", "6"], c: 0, e: "By AM-GM, 4sin²θ + 9cosec²θ ≥ 2√(36) = 12." },
  { t: "Algebra", d: "EXPERT", q: "If x = 1 + 2^(1/3) + 2^(2/3), then the value of x³ − 3x² − 3x is:", o: ["1", "2", "0", "3"], c: 0, e: "x satisfies x³ − 3x² − 3x − 1 = 0 → x³ − 3x² − 3x = 1." },
  { t: "Mensuration", d: "EXPERT", q: "A right circular cone has height 24 cm and base radius 7 cm. Find its total surface area. (π = 22/7)", o: ["704 cm²", "550 cm²", "748 cm²", "616 cm²"], c: 0, e: "Slant = √(24²+7²) = 25; TSA = πr(r+l) = (22/7)(7)(32) = 704 cm²." },
  { t: "Mensuration", d: "EXPERT", q: "Find the total surface area of a solid hemisphere of radius 7 cm. (π = 22/7)", o: ["462 cm²", "308 cm²", "616 cm²", "154 cm²"], c: 0, e: "TSA of solid hemisphere = 3πr² = 3×(22/7)×49 = 462 cm²." },
  { t: "Number System", d: "EXPERT", q: "How many factors does 7200 have?", o: ["54", "48", "60", "36"], c: 0, e: "7200 = 2⁵·3²·5² → (5+1)(2+1)(2+1) = 54." },
  { t: "Number System", d: "EXPERT", q: "The sum of three consecutive multiples of 7 is 357. Find the largest of them.", o: ["126", "119", "133", "112"], c: 0, e: "Middle = 357/3 = 119 → 112, 119, 126 → largest 126." },
  { t: "Profit and Loss", d: "EXPERT", q: "By selling 45 lemons for ₹40, a man loses 20%. How many lemons should he sell for ₹24 to gain 20%?", o: ["18", "20", "15", "24"], c: 0, e: "CP of 45 = 50 → CP/lemon = 10/9; SP/lemon for 20% gain = 4/3 → 24 ÷ (4/3) = 18 lemons." },
  { t: "Mixture & Alligation", d: "EXPERT", q: "A vessel contains 100 litres of pure milk. 10 litres are removed and replaced with water; this is done once more. How much milk remains?", o: ["81 litres", "80 litres", "90 litres", "72 litres"], c: 0, e: "100×(1−10/100)² = 100×0.81 = 81 litres." },
  { t: "Compound Interest", d: "EXPERT", q: "At what rate per annum will ₹5000 amount to ₹6655 in 3 years at compound interest?", o: ["10%", "12%", "8%", "11%"], c: 0, e: "6655/5000 = 1.331 = (1.1)³ → rate = 10%." },
  { t: "Time & Work", d: "EXPERT", q: "A can do a work in 20 days and B in 30 days. A starts the work and after 5 days B joins him. In how many total days will the work be completed?", o: ["14 days", "12 days", "15 days", "13 days"], c: 0, e: "A in 5 days = 1/4; remaining 3/4 at (1/20+1/30 = 1/12) → 9 days → total 14 days." },
  { t: "Algebra", d: "EXPERT", q: "If 2^x = 3^y = 6^(−z), then the value of (1/x + 1/y + 1/z) is:", o: ["0", "1", "−1", "6"], c: 0, e: "Taking logs: 1/x + 1/y + 1/z = 0 (since 2·3 = 6)." },
  { t: "Mensuration", d: "EXPERT", q: "A circle is inscribed in a square of side 14 cm. Find the area enclosed between the circle and the square. (π = 22/7)", o: ["42 cm²", "56 cm²", "38.5 cm²", "49 cm²"], c: 0, e: "196 − πr² = 196 − (22/7)(49) = 196 − 154 = 42 cm²." },
  { t: "Algebra", d: "EXPERT", q: "If a² + b² + c² = 83 and a + b + c = 15, find the value of ab + bc + ca.", o: ["71", "68", "75", "64"], c: 0, e: "ab+bc+ca = ((a+b+c)² − (a²+b²+c²))/2 = (225 − 83)/2 = 71." },
  { t: "Time, Speed & Distance", d: "EXPERT", q: "A train 110 m long crosses a man running towards it at 6 km/h in 6 seconds. Find the speed of the train.", o: ["60 km/h", "54 km/h", "66 km/h", "72 km/h"], c: 0, e: "Relative speed = 110/6 m/s = 66 km/h; train = 66 − 6 = 60 km/h." },
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
  console.log(`Batch 23 (extreme quant) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
