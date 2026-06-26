// Tricky batch #26 — EXTREME-HARD QUANT only. Hand-verified. All EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If x + y = 10 and x² + y² = 58, then the value of x³ + y³ is:", o: ["370", "352", "388", "400"], c: 0, e: "xy = (100−58)/2 = 21 → x³+y³ = 10³ − 3(21)(10) = 1000 − 630 = 370." },
  { t: "Trigonometry", d: "EXPERT", q: "Find the value of cos²1° + cos²2° + cos²3° + … + cos²89° + cos²90°.", o: ["44.5", "45", "44", "45.5"], c: 0, e: "Pairing cos²θ + cos²(90−θ) = 1 gives 44 pairs + cos²45° (0.5) + cos²90° (0) = 44.5." },
  { t: "Compound Interest", d: "EXPERT", q: "The simple interest on a sum for 3 years is ₹225 and the compound interest on the same sum for 2 years at the same rate is ₹153. Find the rate of interest.", o: ["4%", "5%", "3%", "6%"], c: 0, e: "SI/yr = 75; CI 2yr = 150 + 75r/100 = 153 → r = 4%." },
  { t: "Profit and Loss", d: "EXPERT", q: "A shopkeeper sells an article at 20% profit. If both the cost price and selling price are increased by ₹100, the profit becomes 15%. Find the original cost price.", o: ["₹300", "₹400", "₹250", "₹350"], c: 0, e: "0.2x/(x+100) = 0.15 → 0.2x = 0.15x + 15 → 0.05x = 15 → x = ₹300." },
  { t: "Number System", d: "EXPERT", q: "Find the largest number that divides 1305, 4665 and 6905, leaving the same remainder in each case.", o: ["1120", "1240", "1000", "1080"], c: 0, e: "HCF of the differences (3360, 2240, 5600) = 1120." },
  { t: "Trigonometry", d: "EXPERT", q: "The angle of elevation of the top of a tower from a point is 30°. On moving 30 m towards the tower it becomes 60°. Find the height of the tower.", o: ["15√3 m", "30√3 m", "15 m", "30 m"], c: 0, e: "h = 30/(cot30° − cot60°) = 30/((3−1)/√3) = 15√3 m." },
  { t: "Pipes & Cisterns", d: "EXPERT", q: "Pipe A fills a cistern three times as fast as pipe B. Together they fill it in 36 minutes. How long does pipe B alone take?", o: ["144 minutes", "108 minutes", "120 minutes", "48 minutes"], c: 0, e: "A = 3B; 4B = 1/36 → B = 1/144 → 144 minutes." },
  { t: "Ratio & Proportion", d: "EXPERT", q: "If (a + b)/(a − b) = 7/3, then the value of a/b is:", o: ["5/2", "2/5", "10/3", "7/3"], c: 0, e: "By componendo-dividendo, a/b = (7+3)/(7−3) = 10/4 = 5/2." },
  { t: "Simplification", d: "EXPERT", q: "Find the value of √0.04 + √0.0004 + √0.000004.", o: ["0.222", "0.0222", "0.2022", "0.2"], c: 0, e: "0.2 + 0.02 + 0.002 = 0.222." },
  { t: "Mensuration", d: "EXPERT", q: "The ratio of the volumes of two cubes is 8 : 27. Find the ratio of their total surface areas.", o: ["4 : 9", "2 : 3", "8 : 27", "16 : 81"], c: 0, e: "Sides are in ratio 2 : 3 → surface areas in ratio 2² : 3² = 4 : 9." },
  { t: "Algebra", d: "EXPERT", q: "If x = 999, find the value of x(x² + 3x + 3) + 1.", o: ["1000000000", "999000000", "1000000", "999999999"], c: 0, e: "x³ + 3x² + 3x + 1 = (x+1)³ = 1000³ = 1,000,000,000." },
  { t: "Time, Speed & Distance", d: "EXPERT", q: "A man covers a distance of 100 km. If he increases his speed by 5 km/h, he takes 1 hour less. Find his original speed.", o: ["20 km/h", "25 km/h", "15 km/h", "10 km/h"], c: 0, e: "100/v − 100/(v+5) = 1 → v² + 5v − 500 = 0 → v = 20 km/h." },
  { t: "Number System", d: "EXPERT", q: "Find the unit (ones) digit of (1! + 2! + 3! + … + 100!).", o: ["3", "1", "0", "5"], c: 0, e: "1!+2!+3!+4! = 33 (unit 3); 5! onward end in 0 → unit digit is 3." },
  { t: "Averages", d: "EXPERT", q: "The average of 11 consecutive natural numbers is 30. Find the largest of them.", o: ["35", "36", "34", "40"], c: 0, e: "The middle (6th) number is 30 → largest = 30 + 5 = 35." },
  { t: "Trigonometry", d: "EXPERT", q: "If sec θ + tan θ = 5/3, then the value of sin θ is:", o: ["8/17", "15/17", "8/15", "3/5"], c: 0, e: "sec θ − tan θ = 3/5 → sec θ = 17/15, tan θ = 8/15 → sin θ = 8/17." },
  { t: "Simple Interest", d: "EXPERT", q: "A sum of money doubles itself in 4 years at simple interest. What is the rate of interest per annum?", o: ["25%", "20%", "12.5%", "50%"], c: 0, e: "SI = P in 4 years → rate = 100/4 = 25%." },
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
  console.log(`Batch 26 (extreme quant) inserted ${ids.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
