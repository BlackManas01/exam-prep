// Batch #101 — SSC CGL PYQ-LEVEL, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1";
const ITEMS = [
  { s: "quant", subj: "Quantitative Aptitude", t: "Time & Work", q: "A can do 1/3 of a work in 5 days and B can do 2/5 of the same work in 10 days. Working together, the number of days they will take to complete the whole work is:", o: ["9.375", "10", "8", "12"], c: 0, e: "A full=15 d, B full=25 d → together = 15×25/40 = 9.375 days." },
  { s: "quant", subj: "Quantitative Aptitude", t: "CI vs SI", q: "The compound interest on ₹4,000 for 2 years at 10% per annum, compounded annually, exceeds the simple interest on the same sum for the same period and rate by:", o: ["₹40", "₹50", "₹30", "₹45"], c: 0, e: "CI=840, SI=800 → difference ₹40." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Ratio", q: "If a : b = 2 : 3, b : c = 4 : 5 and c : d = 6 : 7, then the ratio a : d is:", o: ["16 : 35", "2 : 7", "8 : 35", "12 : 35"], c: 0, e: "a:d = (2×4×6) : (3×5×7) = 48:105 = 16:35." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Mixtures", q: "45 litres of a solution contains acid and water, with acid forming 80% of the solution. The quantity of water that must be added to make the acid content 60% of the new solution is:", o: ["15 litres", "12 litres", "18 litres", "10 litres"], c: 0, e: "Acid 36 L; total for 60% = 36/0.6 = 60 → add 15 L." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Boats & Streams", q: "A man rows 24 km downstream in 4 hours and the same 24 km upstream in 6 hours. The speed of the stream is:", o: ["1 km/h", "2 km/h", "0.5 km/h", "1.5 km/h"], c: 0, e: "Down 6, up 4 → stream = (6−4)/2 = 1 km/h." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Dishonest Dealer", q: "A trader marks his goods at cost price but uses a false weight of 800 g for every 1 kg he sells. His percentage profit is:", o: ["25%", "20%", "12.5%", "22%"], c: 0, e: "Gain = 200/800 = 25%." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Averages", q: "The average of the first 50 natural numbers is:", o: ["25.5", "25", "26", "24.5"], c: 0, e: "(1+50)/2 = 25.5." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Percentage (chain)", q: "The price of an item is first increased by 10% and then decreased by 10%. If the final price is ₹198, the original price of the item was:", o: ["₹200", "₹210", "₹220", "₹196"], c: 0, e: "P×1.1×0.9 = 0.99P = 198 → P = 200." },
  { s: "quant", subj: "Quantitative Aptitude", t: "Simple Interest", q: "A sum of money placed at simple interest doubles itself in 8 years. The number of years in which it will become four times itself at the same rate is:", o: ["24", "16", "32", "20"], c: 0, e: "Doubling = +100% in 8 yr → 12.5%/yr; four times = +300% → 300/12.5 = 24 yr." },
  { s: "reasoning", subj: "General Intelligence & Reasoning", t: "Coding-Decoding", q: "In a certain code language, if 'TEACHER' is coded as 'VGCEJGT', then following the same rule the word 'STUDENT' will be coded as:", o: ["UVWFGPV", "UWVFGPV", "UVWFPGV", "UVWGFPV"], c: 0, e: "Each letter +2: S→U,T→V,U→W,D→F,E→G,N→P,T→V → UVWFGPV." },
  { s: "reasoning", subj: "General Intelligence & Reasoning", t: "Syllogism", q: "Statements: All rivers are streams. All streams are channels. Some channels are canals. Conclusions: I. All rivers are channels. II. Some rivers are canals. Which conclusion(s) follow?", o: ["Only I", "Only II", "Both", "Neither"], c: 0, e: "Rivers→streams→channels so I; canals link to channels not rivers → II uncertain." },
];
function hash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffle(o, ci) { const a = o.map((t, i) => ({ t, c: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const I = ITEMS.filter((x) => !x.skip);
  if (process.argv.includes("--verify")) { I.forEach((q, i) => console.log(`${i + 1}. [${q.s}/${q.t}] ${q.o[q.c]}`)); console.log(`Total: ${I.length}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const q of I) { const id = crypto.randomUUID(); qRows.push({ id, examCode: EXAM, sectionCode: q.s, subject: q.subj, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: hash(q.q, q.o[q.c]), isActive: true }); shuffle(q.o, q.c).forEach((o, i) => oRows.push({ questionId: id, text: o.t, isCorrect: o.c, displayOrder: i })); }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 101 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
