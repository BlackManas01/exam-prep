// Hard, PYQ-pattern Reasoning generators — every answer is COMPUTED exactly so
// it is guaranteed correct (no guessing). Covers Direction & Distance, Coding-
// Decoding, Number Series, Mathematical Operations, Clock, Calendar, Ranking,
// and Number Analogy. Inserted as source="MANUAL" into every exam's reasoning
// section at MEDIUM/HARD/EXPERT.
//
//   node scripts/add-hard-reasoning.cjs [count]        (default 2400)
//   node scripts/add-hard-reasoning.cjs --verify       (print samples + answers)
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const COUNT = Number(process.argv[2]) || 2400;

const TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "reasoning", subject: "Reasoning" },
  { examCode: "ssc-chsl-tier1", sectionCode: "general-intelligence", subject: "Reasoning" },
  { examCode: "ibps-po-prelims", sectionCode: "reasoning", subject: "Reasoning Ability" },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "reasoning", subject: "General Intelligence & Reasoning" },
  { examCode: "ssc-cgl-tier2", sectionCode: "reasoning", subject: "Reasoning & General Intelligence" },
];
// EXAM=ssc-cgl-tier1 restricts generation to one exam (focus mode).
const ONLY = process.env.EXAM;
const ACTIVE = ONLY ? TARGETS.filter((t) => t.examCode === ONLY) : TARGETS;

const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function contentHash(stem, ans) {
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
  return crypto.createHash("sha256").update(`${norm(stem)}::${norm(ans)}`).digest("hex");
}
function numOpts(correct, suffix = "") {
  const set = new Set([correct]);
  const step = Math.max(1, Math.round(Math.abs(correct) * 0.1));
  for (const d of [1, -1, 2, -2, 3, -3, 4, 5]) { if (set.size >= 4) break; const c = correct + d * step; if (c > 0 && !set.has(c)) set.add(c); }
  let e = step * 6; while (set.size < 4) { const c = correct + e; if (c > 0 && !set.has(c)) set.add(c); e += step; }
  const vals = shuffle([...set]);
  return { options: vals.map((v) => `${v}${suffix}`), correctIndex: vals.indexOf(correct) };
}
function strOpts(correct, distractors) {
  const uniq = [correct];
  for (const d of distractors) if (!uniq.includes(d) && uniq.length < 4) uniq.push(d);
  let n = 0;
  while (uniq.length < 4) { const alt = `${correct}${"*".repeat(++n)}`; if (!uniq.includes(alt)) uniq.push(alt); }
  const vals = shuffle(uniq);
  return { options: vals, correctIndex: vals.indexOf(correct) };
}

// 1) Direction & Distance — shortest distance via Pythagorean triples.
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29], [12, 16, 20], [10, 24, 26]];
function gDirection() {
  const [a, b, c] = pick(TRIPLES);
  const Z = randInt(2, 20);
  const X = a + Z;       // North X, later South Z  → net North a
  const Y = b;           // East
  const { options, correctIndex } = numOpts(c, " m");
  return {
    topic: "Direction Sense",
    difficulty: "HARD",
    stem: `A person starts from a point and walks ${X} m towards North, then turns right and walks ${Y} m, then turns right and walks ${Z} m. What is the shortest distance (in m) from the starting point?`,
    options, correctIndex,
    explanation: `After the moves, net North = ${X} − ${Z} = ${a} m and net East = ${Y} m. Shortest distance = √(${a}² + ${b}²) = √${a * a + b * b} = ${c} m.`,
  };
}

// 2) Coding-Decoding — uniform letter shift.
const WORDS = ["CAT", "DOG", "SUN", "BOOK", "PEN", "TREE", "RAIN", "FISH", "BIRD", "LAMP", "DESK", "GOLD", "RICE", "MOON", "STAR", "HAND", "ROAD", "LION", "KING", "RING", "FROG", "WIND", "SNOW", "LEAF"];
function shiftWord(w, k) { return w.split("").map((ch) => String.fromCharCode(((ch.charCodeAt(0) - 65 + k) % 26 + 26) % 26 + 65)).join(""); }
function gCoding() {
  const k = pick([1, 2, 3, 4, 5, -1, -2, -3]);
  const w1 = pick(WORDS); let w2 = pick(WORDS); while (w2 === w1) w2 = pick(WORDS);
  const c1 = shiftWord(w1, k), ans = shiftWord(w2, k);
  const distract = [shiftWord(w2, k + 1), shiftWord(w2, k - 1), shiftWord(w2.split("").reverse().join(""), k)].filter((d) => d !== ans);
  const { options, correctIndex } = strOpts(ans, distract);
  return {
    topic: "Coding-Decoding",
    difficulty: "MEDIUM",
    stem: `In a certain code language, '${w1}' is written as '${c1}'. How will '${w2}' be written in the same code?`,
    options, correctIndex,
    explanation: `Each letter is shifted by ${k >= 0 ? "+" + k : k} along the alphabet. Applying this to '${w2}' gives '${ans}'.`,
  };
}

// 3) Number Series — next term, exact.
function gSeries() {
  const type = pick(["arith", "geo", "sqr", "tri", "mul2plus1", "cube"]);
  let terms = [], next, rule;
  if (type === "arith") { const a = randInt(2, 15), d = pick([3, 4, 5, 6, 7, 8]); terms = [a, a + d, a + 2 * d, a + 3 * d, a + 4 * d]; next = a + 5 * d; rule = `each term increases by ${d}`; }
  else if (type === "geo") { const a = pick([2, 3, 4, 5]), r = pick([2, 3]); terms = [a, a * r, a * r * r, a * r ** 3]; next = a * r ** 4; rule = `each term is multiplied by ${r}`; }
  else if (type === "sqr") { const s = randInt(2, 9); terms = [s * s, (s + 1) ** 2, (s + 2) ** 2, (s + 3) ** 2]; next = (s + 4) ** 2; rule = `consecutive perfect squares`; }
  else if (type === "tri") { const a = randInt(1, 10), d = pick([2, 3, 4]); const arr = [a]; for (let i = 1; i < 5; i++) arr.push(arr[i - 1] + d * i); terms = arr; next = arr[4] + d * 5; rule = `differences increase: +${d}, +${2 * d}, +${3 * d}, …`; }
  else if (type === "cube") { const s = randInt(1, 5); terms = [s ** 3, (s + 1) ** 3, (s + 2) ** 3, (s + 3) ** 3]; next = (s + 4) ** 3; rule = `consecutive perfect cubes`; }
  else { const a = randInt(2, 6); const arr = [a]; for (let i = 1; i < 5; i++) arr.push(arr[i - 1] * 2 + 1); terms = arr; next = arr[4] * 2 + 1; rule = `each term = previous × 2 + 1`; }
  const { options, correctIndex } = numOpts(next, "");
  return { topic: "Number Series", difficulty: "MEDIUM", stem: `Select the number that will come next in the series: ${terms.join(", ")}, ?`, options, correctIndex, explanation: `Pattern: ${rule}. Hence the next term is ${next}.` };
}

// 4) Mathematical Operations — operator substitution with BODMAS, exact integer.
function evalTwo(n1, o1, n2, o2, n3) {
  const ap = (x, o, y) => o === "+" ? x + y : o === "-" ? x - y : o === "*" ? x * y : x / y;
  const hi = (o) => o === "*" || o === "/";
  if (hi(o1) || !hi(o2)) { const left = ap(n1, o1, n2); if (o1 === "/" && n1 % n2 !== 0) return null; const r = ap(left, o2, n3); if (o2 === "/" && left % n3 !== 0) return null; return Number.isInteger(r) ? r : null; }
  // o2 higher precedence: n1 o1 (n2 o2 n3)
  if (o2 === "/" && n2 % n3 !== 0) return null; const right = ap(n2, o2, n3); const r = ap(n1, o1, right); return Number.isInteger(r) ? r : null;
}
function gMathOp() {
  for (let tries = 0; tries < 40; tries++) {
    const real = shuffle(["+", "-", "*", "/"]);
    const map = { "+": real[0], "-": real[1], "×": real[2], "÷": real[3] };
    const sym = shuffle(["+", "-", "×", "÷"]);
    const s1 = sym[0], s2 = sym[1];
    const n1 = randInt(2, 12), n2 = randInt(2, 12), n3 = randInt(2, 12);
    const res = evalTwo(n1, map[s1], n2, map[s2], n3);
    if (res === null || res < 0 || res > 200) continue;
    const { options, correctIndex } = numOpts(res, "");
    return {
      topic: "Mathematical Operations",
      difficulty: "HARD",
      stem: `If '+' means '${map["+"] === "*" ? "×" : map["+"] === "/" ? "÷" : map["+"]}', '−' means '${map["-"] === "*" ? "×" : map["-"] === "/" ? "÷" : map["-"]}', '×' means '${map["×"] === "*" ? "×" : map["×"] === "/" ? "÷" : map["×"]}' and '÷' means '${map["÷"] === "*" ? "×" : map["÷"] === "/" ? "÷" : map["÷"]}', then what is the value of ${n1} ${s1} ${n2} ${s2} ${n3}?`,
      options, correctIndex,
      explanation: `Replace the symbols: ${n1} ${map[s1] === "*" ? "×" : map[s1] === "/" ? "÷" : map[s1]} ${n2} ${map[s2] === "*" ? "×" : map[s2] === "/" ? "÷" : map[s2]} ${n3}. Applying BODMAS gives ${res}.`,
    };
  }
  return gSeries();
}

// 5) Clock — angle between the hands.
function gClock() {
  const H = randInt(1, 12), M = pick([0, 10, 20, 30, 40, 50]);
  let ang = Math.abs(30 * H - 5.5 * M);
  if (ang > 180) ang = 360 - ang;
  const { options, correctIndex } = numOpts(Math.round(ang), "°");
  return {
    topic: "Clock",
    difficulty: "HARD",
    stem: `What is the angle (the smaller one) between the hour hand and the minute hand of a clock at ${H}:${String(M).padStart(2, "0")}?`,
    options, correctIndex,
    explanation: `Angle = |30×H − 5.5×M| = |30×${H} − 5.5×${M}| = ${Math.abs(30 * H - 5.5 * M)}°; the smaller angle is ${Math.round(ang)}°.`,
  };
}

// 6) Calendar — day of week after N days.
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function gCalendar() {
  const start = randInt(0, 6);
  const N = randInt(15, 400);
  const ans = DAYS[(start + (N % 7)) % 7];
  const { options, correctIndex } = strOpts(ans, shuffle(DAYS.filter((d) => d !== ans)).slice(0, 3));
  return {
    topic: "Calendar",
    difficulty: "EXPERT",
    stem: `If today is ${DAYS[start]}, what day of the week will it be after ${N} days?`,
    options, correctIndex,
    explanation: `${N} ÷ 7 leaves a remainder of ${N % 7}. So count ${N % 7} day(s) ahead of ${DAYS[start]} → ${ans}.`,
  };
}

// 7) Ranking & Order.
function gRanking() {
  const left = randInt(4, 20), right = randInt(4, 20);
  const total = left + right - 1;
  const { options, correctIndex } = numOpts(total, "");
  return {
    topic: "Order and Ranking",
    difficulty: "MEDIUM",
    stem: `In a row of students, a boy is ${left}th from the left end and ${right}th from the right end. How many students are there in the row?`,
    options, correctIndex,
    explanation: `Total = (position from left) + (position from right) − 1 = ${left} + ${right} − 1 = ${total}.`,
  };
}

// 8) Number Analogy — same relation across pairs.
function gAnalogy() {
  const rels = [
    { f: (n) => n * n, name: "square of the number" },
    { f: (n) => n * n * n, name: "cube of the number" },
    { f: (n) => n * (n + 1), name: "n × (n+1)" },
    { f: (n) => n * n - 1, name: "n² − 1" },
    { f: (n) => n * n + n, name: "n² + n" },
    { f: (n) => n * 2 + 1, name: "2n + 1" },
  ];
  const r = pick(rels);
  const a = randInt(2, 9); let c = randInt(2, 9); while (c === a) c = randInt(2, 9);
  const b = r.f(a), ans = r.f(c);
  const { options, correctIndex } = numOpts(ans, "");
  return {
    topic: "Analogy",
    difficulty: "MEDIUM",
    stem: `Select the option that is related to the third number in the same way as the second number is related to the first.  ${a} : ${b} :: ${c} : ?`,
    options, correctIndex,
    explanation: `The second number is the ${r.name}: ${a} → ${b}. Applying the same to ${c} gives ${ans}.`,
  };
}

const GENERATORS = [gDirection, gCoding, gSeries, gMathOp, gClock, gCalendar, gRanking, gAnalogy];

(async () => {
  if (process.argv.includes("--verify")) {
    for (const g of GENERATORS) {
      console.log(`\n===== ${g.name} =====`);
      for (let i = 0; i < 3; i++) {
        const q = g();
        console.log(`Q: ${q.stem}`);
        console.log(`Options: ${q.options.join("  |  ")}`);
        console.log(`Answer: ${q.options[q.correctIndex]}  [${q.difficulty}]`);
        console.log(`Why: ${q.explanation}`);
      }
    }
    await prisma.$disconnect();
    return;
  }

  const existing = {};
  for (const t of ACTIVE) {
    const rows = await prisma.question.findMany({ where: { examCode: t.examCode, sectionCode: t.sectionCode }, select: { contentHash: true } });
    existing[t.examCode + t.sectionCode] = new Set(rows.map((r) => r.contentHash));
  }
  const qRows = [], oRows = [];
  let attempts = 0;
  while (qRows.length < COUNT && attempts < COUNT * 12) {
    attempts++;
    const t = pick(ACTIVE);
    const gen = pick(GENERATORS)();
    const correct = gen.options[gen.correctIndex];
    const hash = contentHash(gen.stem, correct);
    const seen = existing[t.examCode + t.sectionCode];
    if (seen.has(hash)) continue;
    seen.add(hash);
    const id = crypto.randomUUID();
    qRows.push({ id, examCode: t.examCode, sectionCode: t.sectionCode, subject: t.subject, topic: gen.topic, difficulty: gen.difficulty, stem: gen.stem, explanation: gen.explanation, source: "MANUAL", contentHash: hash, isActive: true });
    gen.options.forEach((text, i) => oRows.push({ questionId: id, text, isCorrect: i === gen.correctIndex, displayOrder: i }));
  }
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  await chunk(oRows, 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`\nAdded ${qRows.length} hard reasoning questions across ${ACTIVE.length} exams (attempts ${attempts}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
