// Tricky batch #20 — EXTREME-HARD QUANT only. Hand-verified. All EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If x² + y² + z² = 29 and xy + yz + zx = 10, find the value of (x + y + z), given it is positive.", o: ["7", "5", "49", "9"], c: 0, e: "(x+y+z)² = 29 + 2(10) = 49 → x+y+z = 7." },
  { t: "Simplification", d: "EXPERT", q: "Find the value of 1/(1+√2) + 1/(√2+√3) + 1/(√3+√4) + … + 1/(√8+√9).", o: ["2", "3", "1", "√9"], c: 0, e: "Each term rationalises to √(n+1)−√n; telescoping sum = √9 − √1 = 3 − 1 = 2." },
  { t: "Algebra", d: "EXPERT", q: "If a² + 1/a² = 7, then the value of a³ + 1/a³ is (a > 0):", o: ["18", "21", "27", "14"], c: 0, e: "a + 1/a = 3 → a³+1/a³ = 27 − 9 = 18." },
  { t: "Number System", d: "EXPERT", q: "What is the greatest four-digit number that is a perfect square?", o: ["9801", "9999", "9604", "9409"], c: 0, e: "99² = 9801 and 100² = 10000 > 9999 → 9801." },
  { t: "Time, Speed & Distance", d: "EXPERT", q: "Two trains of equal length take 10 seconds and 15 seconds respectively to pass a telegraph post. How long will they take to cross each other when running in opposite directions?", o: ["12 seconds", "25 seconds", "10 seconds", "15 seconds"], c: 0, e: "Speeds L/10 and L/15; relative = L/6; distance 2L → 2L ÷ (L/6) = 12 s." },
  { t: "Boats & Streams", d: "EXPERT", q: "A boat covers a certain distance downstream in 3 hours and returns in 4.5 hours. If the speed of the stream is 2 km/h, find the distance.", o: ["36 km", "30 km", "24 km", "40 km"], c: 0, e: "(b−2)/(b+2) = 3/4.5 → b = 10; distance = 3×(10+2) = 36 km." },
  { t: "Trigonometry", d: "EXPERT", q: "If 7 sin²θ + 3 cos²θ = 4, then the value of tan θ is:", o: ["1/√3", "√3", "1", "1/2"], c: 0, e: "4sin²θ + 3 = 4 → sin²θ = 1/4 → θ = 30° → tan θ = 1/√3." },
  { t: "Mensuration", d: "EXPERT", q: "A polygon has 35 diagonals. How many sides does it have?", o: ["10", "9", "12", "8"], c: 0, e: "n(n−3)/2 = 35 → n² − 3n − 70 = 0 → n = 10." },
  { t: "Simple Interest", d: "EXPERT", q: "A man invests ₹P at 4% and ₹2P at 5% per annum simple interest. If the total interest in one year is ₹350, find P.", o: ["₹2500", "₹2000", "₹3000", "₹1750"], c: 0, e: "0.04P + 0.10P = 350 → 0.14P = 350 → P = ₹2500." },
  { t: "Algebra", d: "EXPERT", q: "If log₂ x = 5, then the value of x is:", o: ["32", "25", "10", "16"], c: 0, e: "x = 2⁵ = 32." },
  { t: "Simplification", d: "EXPERT", q: "Find the value of (243)^0.16 × (243)^0.04.", o: ["3", "9", "243", "27"], c: 0, e: "243^(0.16+0.04) = 243^0.2 = 243^(1/5) = 3." },
  { t: "Number System", d: "EXPERT", q: "The HCF of two numbers is 11 and their LCM is 7700. If one number is 275, find the other.", o: ["308", "300", "286", "330"], c: 0, e: "Other = (11×7700)/275 = 308." },
  { t: "Simplification", d: "EXPERT", q: "Simplify: (0.6³ + 0.4³)/(0.6² − 0.6×0.4 + 0.4²).", o: ["1", "0.2", "0.5", "0.24"], c: 0, e: "Using (a³+b³)/(a²−ab+b²) = a+b = 0.6 + 0.4 = 1." },
  { t: "Mensuration", d: "EXPERT", q: "A sphere, a cylinder and a cone have the same radius r, and the cylinder and cone have height equal to 2r. Find the ratio of their volumes (sphere : cylinder : cone).", o: ["2 : 3 : 1", "4 : 3 : 1", "1 : 3 : 2", "3 : 2 : 1"], c: 0, e: "(4/3)πr³ : 2πr³ : (2/3)πr³ = 4 : 6 : 2 = 2 : 3 : 1." },
  { t: "Mensuration", d: "EXPERT", q: "If the angles of a triangle are in the ratio 1 : 2 : 3, then the triangle is:", o: ["Right-angled", "Equilateral", "Obtuse-angled", "Acute-angled"], c: 0, e: "Angles 30°, 60°, 90° → right-angled triangle." },
  { t: "Number System", d: "EXPERT", q: "Find the remainder when 5¹⁰⁰ is divided by 13.", o: ["1", "5", "12", "8"], c: 0, e: "5² = 25 ≡ −1 (mod 13) → 5¹⁰⁰ = (5²)⁵⁰ ≡ (−1)⁵⁰ = 1." },
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
  console.log(`Batch 20 (extreme quant) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
