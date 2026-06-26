// Tricky batch #35 — BRUTAL QUANT. Hand-verified. All EXPERT.
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
  { t: "Trigonometry", d: "EXPERT", q: "If x + 1/x = 2cos20°, then the value of x³ + 1/x³ is:", o: ["2cos60°", "2cos20°", "cos60°", "2sin60°"], c: 0, e: "x + 1/x = 2cosθ → xⁿ + 1/xⁿ = 2cos(nθ) → 2cos60°." },
  { t: "Algebra", d: "EXPERT", q: "If a, b, c are in geometric progression with a + b + c = 26 and abc = 216, find b.", o: ["6", "8", "4", "9"], c: 0, e: "For a GP, b² = ac → b³ = abc = 216 → b = 6." },
  { t: "Algebra", d: "EXPERT", q: "If α and β are the roots of x² − 6x + 7 = 0, find the value of α⁴ + β⁴.", o: ["386", "322", "404", "350"], c: 0, e: "α+β=6, αβ=7 → α²+β²=22 → α⁴+β⁴=22² − 2·49 = 484 − 98 = 386." },
  { t: "Mensuration", d: "EXPERT", q: "Each interior angle of a regular polygon is 160°. How many sides does it have?", o: ["18", "20", "16", "24"], c: 0, e: "Exterior angle = 20° → n = 360/20 = 18." },
  { t: "Simplification", d: "EXPERT", q: "Find the value of 1/(1·2) + 1/(2·3) + 1/(3·4) + … + 1/(99·100).", o: ["99/100", "1", "100/99", "1/100"], c: 0, e: "Telescoping: 1 − 1/100 = 99/100." },
  { t: "Algebra", d: "EXPERT", q: "If 7^(2x − 1) = 1/343, find the value of x.", o: ["−1", "1", "0", "−2"], c: 0, e: "1/343 = 7⁻³ → 2x − 1 = −3 → x = −1." },
  { t: "Time & Work", d: "EXPERT", q: "A and B together can finish a work in 30 days. They work together for 20 days, then A leaves and B finishes the remaining work in 20 more days. In how many days can A alone do the work?", o: ["60 days", "45 days", "90 days", "50 days"], c: 0, e: "20 days = 2/3 done; B does 1/3 in 20 days → B = 1/60; A = 1/30 − 1/60 = 1/60 → 60 days." },
  { t: "Trigonometry", d: "EXPERT", q: "Find the value of cos²10° + cos²20° + cos²30° + … + cos²80°.", o: ["4", "4.5", "3.5", "5"], c: 0, e: "Pairing cos²θ + cos²(90−θ) = 1 gives 4 pairs (10-80, 20-70, 30-60, 40-50) = 4." },
  { t: "Time, Speed & Distance", d: "EXPERT", q: "Two trains start towards each other from stations 600 km apart at 60 km/h and 40 km/h. A bird flies back and forth between them at 80 km/h until they meet. What total distance does the bird cover?", o: ["480 km", "600 km", "400 km", "360 km"], c: 0, e: "Time to meet = 600/100 = 6 h; bird distance = 80 × 6 = 480 km." },
  { t: "Algebra", d: "EXPERT", q: "If 2x + 1/(2x) = 3, then the value of 8x³ + 1/(8x³) is:", o: ["18", "27", "21", "9"], c: 0, e: "Let y = 2x; y + 1/y = 3 → y³ + 1/y³ = 27 − 9 = 18." },
  { t: "Profit and Loss", d: "EXPERT", q: "A shopkeeper sold an article at two-thirds of its marked price and incurred a loss of 10%. By what percent is the marked price above the cost price?", o: ["35%", "30%", "40%", "25%"], c: 0, e: "(2/3)MP = 0.9CP → MP = 1.35CP → 35% above." },
  { t: "Averages", d: "EXPERT", q: "The mean of 30 numbers is 18. If 5 is added to each number and the result is then multiplied by 2, what is the new mean?", o: ["46", "41", "36", "23"], c: 0, e: "New mean = (18 + 5) × 2 = 46." },
  { t: "Mensuration", d: "EXPERT", q: "In a triangle with sides 6, 8 and 10, find the distance between its incentre and circumcentre.", o: ["√5", "√10", "2", "5"], c: 0, e: "Right triangle: R = 5, r = 2; by Euler's formula OI² = R² − 2Rr = 25 − 20 = 5 → √5." },
  { t: "Number System", d: "EXPERT", q: "How many natural numbers from 1 to 1000 are divisible by none of 2, 3 and 5?", o: ["266", "260", "274", "250"], c: 0, e: "1000 − (500+333+200) + (166+100+66) − 33 = 266." },
  { t: "Number System", d: "EXPERT", q: "The HCF of two numbers is 16 and their product is 6400. Find their LCM.", o: ["400", "320", "640", "256"], c: 0, e: "LCM = product/HCF = 6400/16 = 400." },
  { t: "Simplification", d: "EXPERT", q: "Find the value of (cos9° + sin9°)/(cos9° − sin9°).", o: ["tan54°", "tan36°", "tan45°", "cot54°"], c: 0, e: "Dividing by cos9°: (1+tan9°)/(1−tan9°) = tan(45°+9°) = tan54°." },
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
  console.log(`Batch 35 (brutal quant) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
