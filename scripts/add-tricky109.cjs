// Batch #109 — BRUTAL REASONING, CGL Tier1 only. Hand-verified. EXPERT.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const EXAM = "ssc-cgl-tier1", SEC = "reasoning", SUBJ = "General Intelligence & Reasoning";
const ITEMS = [
  { t: "Number Series", q: "Find the next term: 2, 3, 6, 15, 45, ?", o: ["157.5", "135", "150", "160"], c: 0, e: "×1.5, ×2, ×2.5, ×3, ×3.5: 45×3.5 = 157.5." },
  { t: "Number Series", q: "Find the next term: 240, 120, 40, 10, ?", o: ["2", "5", "4", "1"], c: 0, e: "÷2, ÷3, ÷4, ÷5: 10÷5 = 2." },
  { t: "Coding-Decoding", q: "In a language, 'HEAT' is coded as 'GDZS' (each letter one step backward). Using the same rule, the word 'COLD' is coded as:", o: ["BNKC", "BNKD", "BMKC", "CNKC"], c: 0, e: "−1 each: C→B,O→N,L→K,D→C → BNKC." },
  { t: "Blood Relations", q: "A + B means A is the son of B; A − B means A is the wife of B. If P + Q − R, then how is P related to R?", o: ["Son", "Daughter", "Father", "Brother"], c: 0, e: "P son of Q; Q wife of R → R is P's father, so P is R's son." },
  { t: "Syllogism", q: "Statements: Some doctors are surgeons. All surgeons are graduates. No graduate is illiterate. Conclusions: I. Some doctors are graduates. II. No surgeon is illiterate. Which conclusion(s) follow?", o: ["Both I and II", "Only I", "Only II", "Neither"], c: 0, e: "Doctor-surgeons are graduates → I. Surgeons are graduates, no graduate illiterate → no surgeon illiterate → II." },
  { t: "Direction Sense", q: "A person starts at point O, walks 4 km East, 3 km North, 4 km West and 3 km North. His distance from O is:", o: ["6 km", "5 km", "4 km", "8 km"], c: 0, e: "East 4−4=0; North 3+3=6 → 6 km." },
  { t: "Ranking", q: "In a queue, a person is 16th from the front. There are 40 people in the queue. His position from the back is:", o: ["25th", "24th", "26th", "23rd"], c: 0, e: "40−16+1 = 25th." },
  { t: "Clock", q: "At 8:20, the angle between the hour and minute hands of a clock is:", o: ["130°", "120°", "140°", "125°"], c: 0, e: "Hour = 8×30+20×0.5 = 250°; minute = 120° → difference 130°." },
  { t: "Number Analogy", q: "5 is related to 124 and 3 is related to 26 in the same way as 2 is related to:", o: ["7", "8", "6", "9"], c: 0, e: "n³−1: 2³−1 = 7." },
  { t: "Odd One Out", q: "Find the odd one out: 41, 43, 47, 49, 53", o: ["49", "41", "47", "53"], c: 0, e: "49 = 7² is not prime; the rest are prime." },
  { t: "Seating", q: "Seven friends sit in a row. D is exactly in the middle. A is at the extreme left. G is at the extreme right. C is immediate left of D. E is immediate right of D. B is between A and C. The person immediately to the right of E is:", o: ["F", "B", "C", "G"], c: 0, e: "A,B,C,D,E,F,G → immediate right of E is F." },
  { t: "Letter Series", q: "Find the next term: C, E, H, L, Q, ?", o: ["W", "V", "X", "U"], c: 0, e: "+2,+3,+4,+5,+6: Q+6 = W." },
];
function hash(s, c) { const n = (x) => String(x).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim(); return crypto.createHash("sha256").update(`${n(s)}::${n(c)}`).digest("hex"); }
function shuffle(o, ci) { const a = o.map((t, i) => ({ t, c: i === ci })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
(async () => {
  const I = ITEMS.filter((x) => !x.skip);
  if (process.argv.includes("--verify")) { I.forEach((q, i) => console.log(`${i + 1}. [${q.t}] ${q.o[q.c]}`)); console.log(`Total: ${I.length}`); await prisma.$disconnect(); return; }
  const qRows = [], oRows = [];
  for (const q of I) { const id = crypto.randomUUID(); qRows.push({ id, examCode: EXAM, sectionCode: SEC, subject: SUBJ, topic: q.t, difficulty: "EXPERT", stem: q.q, explanation: q.e, source: "MANUAL", contentHash: hash(q.q, q.o[q.c]), isActive: true }); shuffle(q.o, q.c).forEach((o, i) => oRows.push({ questionId: id, text: o.t, isCorrect: o.c, displayOrder: i })); }
  const chunk = async (a, s, fn) => { for (let i = 0; i < a.length; i += s) await fn(a.slice(i, i + s)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  const ids = new Set((await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id));
  await chunk(oRows.filter((o) => ids.has(o.questionId)), 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Batch 109 inserted ${ids.size} (of ${qRows.length}).`); await prisma.$disconnect();
})().catch(async (e) => { console.error(e.message); await prisma.$disconnect(); process.exit(1); });
