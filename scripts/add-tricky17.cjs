// Tricky batch #17 — EXTREME-HARD QUANT only (topper / SSC CGL Tier-2 level).
// Every answer hand-verified. All tagged EXPERT.
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
  { t: "Algebra", d: "EXPERT", q: "If a + b + c = 6, ab + bc + ca = 11 and abc = 6, then the value of a³ + b³ + c³ is:", o: ["36", "30", "42", "18"], c: 0, e: "a³+b³+c³ = (a+b+c)³ − 3(a+b+c)(ab+bc+ca) + 3abc = 216 − 198 + 18 = 36." },
  { t: "Algebra", d: "EXPERT", q: "If x + 1/x = √3, then the value of x¹² + 1/x¹² is:", o: ["2", "1", "0", "−2"], c: 0, e: "x + 1/x = 2cos30° → x¹²+1/x¹² = 2cos(360°) = 2." },
  { t: "Trigonometry", d: "EXPERT", q: "Find the value of tan 6° · tan 42° · tan 66° · tan 78°.", o: ["1", "0", "√3", "1/√3"], c: 0, e: "Using tan θ·tan(60−θ)·tan(60+θ) = tan3θ, the product reduces to 1." },
  { t: "Trigonometry", d: "EXPERT", q: "What is the maximum value of (3 sin θ + 4 cos θ + 5)?", o: ["10", "9", "12", "5"], c: 0, e: "Max of 3sinθ+4cosθ = √(9+16) = 5 → 5 + 5 = 10." },
  { t: "Trigonometry", d: "EXPERT", q: "If tan θ = √2 − 1, then the value of sin θ · cos θ is:", o: ["√2/4", "1/2", "√2/2", "1/4"], c: 0, e: "sinθcosθ = tanθ/(1+tan²θ) = (√2−1)/(4−2√2) = 1/(2√2) = √2/4." },
  { t: "Mensuration", d: "EXPERT", q: "Two circles of radii 5 cm and 3 cm touch each other externally. Find the length of their direct common tangent.", o: ["2√15 cm", "4 cm", "√15 cm", "8 cm"], c: 0, e: "Direct tangent = √(d² − (r₁−r₂)²) = √(8² − 2²) = √60 = 2√15 cm." },
  { t: "Mensuration", d: "EXPERT", q: "The medians of triangle ABC intersect at the centroid G. If the area of triangle ABC is 36 cm², find the area of triangle BGD, where D is the midpoint of BC.", o: ["6 cm²", "9 cm²", "12 cm²", "18 cm²"], c: 0, e: "The medians divide the triangle into 6 equal parts → 36/6 = 6 cm²." },
  { t: "Mensuration", d: "EXPERT", q: "ABCD is a cyclic quadrilateral with AB = AD and ∠BCD = 70°. Find the measure of ∠ABD.", o: ["35°", "55°", "70°", "40°"], c: 0, e: "∠BAD = 180° − 70° = 110°; triangle ABD is isosceles → ∠ABD = (180−110)/2 = 35°." },
  { t: "Number System", d: "EXPERT", q: "Find the remainder when 32^(32^32) is divided by 7.", o: ["4", "2", "1", "5"], c: 0, e: "32 ≡ 4 (mod 7); order of 4 is 3; exponent 32^32 ≡ 1 (mod 3) → 4¹ = 4." },
  { t: "Number System", d: "EXPERT", q: "What is the last digit of 7^(7^7)?", o: ["3", "7", "9", "1"], c: 0, e: "7 has a 4-cycle; 7^7 ≡ 3 (mod 4) → last digit of 7³ = 3." },
  { t: "Number System", d: "EXPERT", q: "How many zeros are there at the end of 100! ?", o: ["24", "20", "25", "10"], c: 0, e: "⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24." },
  { t: "Mensuration", d: "EXPERT", q: "The radii of the two circular ends of a frustum of a cone are 6 cm and 3 cm and its height is 4 cm. Find its slant height.", o: ["5 cm", "4 cm", "6 cm", "7 cm"], c: 0, e: "l = √(h² + (R−r)²) = √(16 + 9) = 5 cm." },
  { t: "Profit and Loss", d: "EXPERT", q: "A trader allows successive discounts of 20%, 10% and 5%. What single discount is equivalent to these three?", o: ["31.6%", "35%", "30%", "32.4%"], c: 0, e: "1 − (0.8×0.9×0.95) = 1 − 0.684 = 0.316 → 31.6%." },
  { t: "Compound Interest", d: "EXPERT", q: "A sum of money becomes 8 times itself in 3 years at compound interest. In how many years will it become 16 times itself?", o: ["4 years", "5 years", "6 years", "4.5 years"], c: 0, e: "8 = 2³ → it doubles every year; 16 = 2⁴ → 4 years." },
  { t: "Time & Work", d: "EXPERT", q: "A is thrice as good a workman as B and takes 60 days less than B to finish a work. In how many days can A and B together finish it?", o: ["22.5 days", "20 days", "30 days", "25 days"], c: 0, e: "A takes 30 days, B takes 90 days; together 1/30 + 1/90 = 2/45 → 22.5 days." },
  { t: "Mixture & Alligation", d: "EXPERT", q: "Three equal glasses are filled with milk-and-water mixtures in the ratios 1:2, 2:3 and 3:4. The contents are poured into a single vessel. Find the ratio of milk to water in the mixture.", o: ["122 : 193", "1 : 2", "6 : 7", "61 : 96"], c: 0, e: "Milk = 1/3 + 2/5 + 3/7 = 122/105; water = 193/105 → 122 : 193." },
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
    for (const q of QUANT) { n++; console.log(`${n}. [${q.t}·${q.d}] ${q.q}\n    ✓ ${q.o[q.c]}`); }
    console.log(`\nTotal: ${n} extreme quant questions.`);
    await prisma.$disconnect();
    return;
  }
  const qRows = [], oRows = [];
  for (const t of QUANT_TARGETS) for (const q of QUANT) {
    const id = crypto.randomUUID();
    qRows.push({ id, examCode: t.examCode, sectionCode: t.sectionCode, subject: t.subject, topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e, source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true });
    shuffled(q.o, q.c).forEach((opt, i) => oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i }));
  }
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const insertedIds = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  const liveOpts = oRows.filter((o) => insertedIds.has(o.questionId));
  await chunk(liveOpts, 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 17 (extreme quant) inserted ${insertedIds.size} (of ${qRows.length}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
