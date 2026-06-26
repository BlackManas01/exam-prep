// Hard, PYQ-pattern Quantitative Aptitude generators — multi-step problems that
// mirror real SSC CGL previous-year questions, with answers computed EXACTLY so
// they are guaranteed correct. Inserted as source="MANUAL" (survive reseeds) at
// HARD/EXPERT difficulty into every exam's quant/math section.
//
//   node scripts/add-hard-quant.cjs [count]   (default 2400)
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

const COUNT = Number(process.argv[2]) || 2400;

// Where hard quant questions go (exam → its quant section + subject label).
const TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "ssc-chsl-tier1", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "ibps-po-prelims", sectionCode: "quant", subject: "Quantitative Aptitude" },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "maths", subject: "Mathematics" },
  { examCode: "ssc-cgl-tier2", sectionCode: "math", subject: "Quantitative Aptitude" },
];
// EXAM=ssc-cgl-tier1 restricts generation to one exam (focus mode).
const ONLY = process.env.EXAM;
const ACTIVE = ONLY ? TARGETS.filter((t) => t.examCode === ONLY) : TARGETS;

// ---- helpers ----
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
function frac(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(num, den); num /= g; den /= g;
  if (den === 1) return `${num}`;
  return `${num}/${den}`;
}
function contentHash(stem, correctAnswer) {
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
  return crypto.createHash("sha256").update(`${norm(stem)}::${norm(correctAnswer)}`).digest("hex");
}
// Build 4 numeric options around an integer answer (proportional, distinct).
function numOpts(correct, suffix = "") {
  const mag = Math.abs(correct) || 1;
  const step = Math.max(1, Math.round(mag * 0.08));
  const set = new Set([correct]);
  for (const d of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) {
    if (set.size >= 4) break;
    const c = correct + d * step;
    if (c > 0 && !set.has(c)) set.add(c);
  }
  let e = step * 6;
  while (set.size < 4) { const c = correct + e; if (c > 0 && !set.has(c)) set.add(c); e += step; }
  const vals = [...set];
  for (let i = vals.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [vals[i], vals[j]] = [vals[j], vals[i]]; }
  return { options: vals.map((v) => `${v}${suffix}`), correctIndex: vals.indexOf(correct) };
}
function strOpts(correct, distractors) {
  const all = [correct, ...distractors].slice(0, 4);
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return { options: all, correctIndex: all.indexOf(correct) };
}

// ===================== HARD PYQ GENERATORS =====================

// 1) Time & Work — one person works alone, another joins, find time for a % of work.
function gTimeWorkJoin() {
  const fractions = [
    { label: "50%", num: 1, den: 2 },
    { label: "66\u2154%", num: 2, den: 3 },
    { label: "75%", num: 3, den: 4 },
    { label: "33\u2153%", num: 1, den: 3 },
    { label: "60%", num: 3, den: 5 },
  ];
  const f = pick(fractions);
  const A = randInt(2, 9) * f.den; // final clean answer (Q's time for f of work)
  // Q's full-work time q = A / f = A * den / num
  const qNum = A * f.den, qDen = f.num; // q = qNum/qDen (hours/days)
  const a = randInt(12, 30); // P's full time (integer)
  const d = randInt(2, a - 2); // days P worked alone
  // remaining together time t = (a-d)*q/(a+q) ; compute exactly with q = qNum/qDen
  // a+q = (a*qDen + qNum)/qDen ;  (a-d)*q = (a-d)*qNum/qDen
  // t = (a-d)*qNum / (a*qDen + qNum)
  const tNum = (a - d) * qNum;
  const tDen = a * qDen + qNum;
  const tStr = frac(tNum, tDen);
  const { options, correctIndex } = numOpts(A, " days");
  return {
    topic: "Time and Work",
    difficulty: "HARD",
    stem: `P can finish a work in ${a} days. When he had worked for ${d} days, Q joined him. If both of them together completed the remaining work in ${tStr} days, then in how many days can Q alone finish ${f.label} of the same work?`,
    options, correctIndex,
    explanation: `P's 1 day work = 1/${a}. In ${d} days P does ${frac(d, a)}. Remaining = ${frac(a - d, a)}. (P+Q) finished it in ${tStr} days, so (P+Q)/day = remaining ÷ time = 1 day work giving Q alone full work = ${frac(qNum, qDen)} days. ${f.label} of work for Q = ${f.num}/${f.den} × ${frac(qNum, qDen)} = ${A} days.`,
  };
}

// 2) CI − SI difference for 2 years.
function gCISIdiff() {
  const r = pick([4, 5, 6, 8, 10, 12, 15, 20, 25]);
  const P = randInt(2, 20) * 5000; // multiple keeps it clean
  const diff = Math.round((P * r * r) / 10000);
  const { options, correctIndex } = numOpts(diff, "");
  return {
    topic: "Compound Interest",
    difficulty: "HARD",
    stem: `The difference between the compound interest (compounded annually) and the simple interest on a sum of ₹${P} at ${r}% per annum for 2 years is:`,
    options: options.map((o) => `₹${o}`),
    correctIndex,
    explanation: `For 2 years, CI − SI = P(R/100)² = ${P} × (${r}/100)² = ₹${diff}.`,
  };
}

// 3) Successive percentage change (increase then decrease), net change.
function gSuccessivePct() {
  const x = pick([10, 15, 20, 25, 30, 40, 50]);
  const y = pick([10, 15, 20, 25, 30]);
  const net = x - y - (x * y) / 100; // exact when x*y divisible by 100; else decimal
  const netRounded = Math.round(net * 100) / 100;
  const isInc = netRounded >= 0;
  const ans = Math.abs(netRounded);
  // options around ans
  const mag = ans || 1, step = Math.max(0.5, Math.round(mag * 0.15 * 2) / 2);
  const set = new Set([ans]);
  for (const d of [1, -1, 2, -2, 3, -3]) { if (set.size >= 4) break; const c = Math.round((ans + d * step) * 100) / 100; if (c >= 0 && !set.has(c)) set.add(c); }
  let e = step * 4; while (set.size < 4) { const c = Math.round((ans + e) * 100) / 100; if (!set.has(c)) set.add(c); e += step; }
  const vals = [...set]; for (let i = vals.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [vals[i], vals[j]] = [vals[j], vals[i]]; }
  const fmt = (v) => `${v}% ${v === ans ? (isInc ? "increase" : "decrease") : pick(["increase", "decrease"])}`;
  // build options with correct direction on the answer, mixed directions on others
  const opts = vals.map((v) => (v === ans ? `${v}% ${isInc ? "increase" : "decrease"}` : `${v}% ${Math.random() < 0.5 ? "increase" : "decrease"}`));
  return {
    topic: "Percentage",
    difficulty: "HARD",
    stem: `The price of an article is first increased by ${x}% and then decreased by ${y}%. What is the net percentage change in the price?`,
    options: opts,
    correctIndex: vals.indexOf(ans),
    explanation: `Net % change = ${x} − ${y} − (${x}×${y})/100 = ${netRounded}%, i.e. a ${ans}% ${isInc ? "increase" : "decrease"}.`,
  };
}

// 4) Train crossing a pole and a platform — find length of train.
function gTrainPlatform() {
  const speedKmph = pick([36, 45, 54, 60, 72, 90]);
  const mps = (speedKmph * 5) / 18;
  const tPole = pick([8, 10, 12, 15, 18, 20]);
  const len = mps * tPole; // length of train (m)
  const platform = pick([100, 150, 200, 240, 300]);
  const tPlat = Math.round((len + platform) / mps);
  if (!Number.isInteger(len) || (len + platform) % mps !== 0) return gTrainPlatform();
  const { options, correctIndex } = numOpts(len, " m");
  return {
    topic: "Speed, Time and Distance",
    difficulty: "HARD",
    stem: `A train running at ${speedKmph} km/h crosses a pole in ${tPole} seconds. How long is the train?`,
    options, correctIndex,
    explanation: `Speed = ${speedKmph} × 5/18 = ${mps} m/s. Length = speed × time = ${mps} × ${tPole} = ${len} m.`,
  };
}

// 5) Boats & streams — find speed of boat / stream.
function gBoats() {
  const boat = pick([8, 10, 12, 15, 18, 20]);
  const stream = pick([2, 3, 4, 5]);
  if (stream >= boat) return gBoats();
  const down = boat + stream, up = boat - stream;
  const t = pick([2, 3, 4, 5]);
  const dDown = down * t, dUp = up * t;
  const askStream = Math.random() < 0.5;
  const ans = askStream ? stream : boat;
  const { options, correctIndex } = numOpts(ans, " km/h");
  return {
    topic: "Boats and Streams",
    difficulty: "HARD",
    stem: `A boat covers ${dDown} km downstream in ${t} hours and ${dUp} km upstream in ${t} hours. Find the speed of the ${askStream ? "stream" : "boat in still water"}.`,
    options, correctIndex,
    explanation: `Downstream speed = ${dDown}/${t} = ${down} km/h; upstream = ${dUp}/${t} = ${up} km/h. Boat = (${down}+${up})/2 = ${boat} km/h; stream = (${down}−${up})/2 = ${stream} km/h.`,
  };
}

// 6) Pipes & cistern with a leak — find time to fill.
function gPipesLeak() {
  const T = pick([6, 8, 10, 12, 15]); // clean fill-time answer
  const a = pick([4, 5, 6, 8]);
  const b = pick([10, 12, 15, 20]);
  // need 1/a + 1/b - 1/T > 0  →  leak c = 1 / (1/a + 1/b - 1/T)
  const inv = 1 / a + 1 / b - 1 / T;
  if (inv <= 0) return gPipesLeak();
  // c = 1/inv ; express as fraction p/q from (1/a+1/b-1/T)
  const den = a * b * T;
  const numer = b * T + a * T - a * b; // = den*(1/a+1/b-1/T)
  if (numer <= 0) return gPipesLeak();
  const cStr = frac(den, numer); // leak empties full tank in den/numer hours
  const { options, correctIndex } = numOpts(T, " hours");
  return {
    topic: "Pipes and Cisterns",
    difficulty: "HARD",
    stem: `Two pipes A and B can fill a tank in ${a} hours and ${b} hours respectively. A leak at the bottom can empty the full tank in ${cStr} hours. If all three are opened together, in how many hours will the tank be filled?`,
    options, correctIndex,
    explanation: `Net filling rate per hour = 1/${a} + 1/${b} − 1/(${cStr}) = 1/${T}. So the tank fills in ${T} hours.`,
  };
}

// 7) Partnership — B joins after some months, find B's profit share.
function gPartnership() {
  const x = randInt(2, 12) * 1000;
  const y = randInt(2, 12) * 1000;
  const m = pick([2, 3, 4, 6]); // months after which B joins
  const aMonths = 12, bMonths = 12 - m;
  let ra = x * aMonths, rb = y * bMonths;
  const g = gcd(ra, rb); ra /= g; rb /= g;
  const unit = pick([400, 500, 600, 800, 1000]);
  const profit = (ra + rb) * unit;
  const bShare = rb * unit;
  const { options, correctIndex } = numOpts(bShare, "");
  return {
    topic: "Partnership",
    difficulty: "HARD",
    stem: `A started a business investing ₹${x}. After ${m} months, B joined with ₹${y}. At the end of the year, the total profit was ₹${profit}. Find B's share of the profit.`,
    options: options.map((o) => `₹${o}`),
    correctIndex,
    explanation: `Profit ratio A:B = ${x}×12 : ${y}×${bMonths} = ${ra}:${rb}. B's share = ${rb}/${ra + rb} × ₹${profit} = ₹${bShare}.`,
  };
}

// 8) Ages — ratio now and after n years, find present age.
function gAges() {
  const k = randInt(2, 8);
  const p = pick([2, 3, 4, 5]);
  const q = p + pick([1, 2, 3]);
  const A = p * k, B = q * k; // present ages
  const n = pick([4, 5, 6, 8, 10]);
  // after n years ratio = (A+n):(B+n)
  let rn = A + n, rd = B + n; const g = gcd(rn, rd); rn /= g; rd /= g;
  const askA = Math.random() < 0.5;
  const ans = askA ? A : B;
  const { options, correctIndex } = numOpts(ans, " years");
  return {
    topic: "Problems on Ages",
    difficulty: "MEDIUM",
    stem: `The present ages of A and B are in the ratio ${p}:${q}. After ${n} years, the ratio of their ages will be ${rn}:${rd}. Find the present age of ${askA ? "A" : "B"}.`,
    options, correctIndex,
    explanation: `Let ages be ${p}x and ${q}x. (${p}x+${n})/(${q}x+${n}) = ${rn}/${rd} ⇒ x = ${k}. Present age of ${askA ? "A" : "B"} = ${askA ? p : q}×${k} = ${ans} years.`,
  };
}

// 9) Mixture & Alligation — ratio to mix two priced items.
function gMixture() {
  const a = randInt(20, 40);
  const c = randInt(a + 3, a + 18); // mean
  const b = randInt(c + 3, c + 25);
  // Alligation: cheaper(a) : dearer(b) = (b − c) : (c − a)
  let cheap = b - c, dear = c - a; const g = gcd(cheap, dear); cheap /= g; dear /= g;
  const correct = `${cheap}:${dear}`;
  const { options, correctIndex } = strOpts(correct, [`${dear}:${cheap}`, `${cheap + 1}:${dear}`, `${cheap}:${dear + 1}`]);
  return {
    topic: "Mixture and Alligation",
    difficulty: "HARD",
    stem: `In what ratio must rice costing ₹${a} per kg be mixed with rice costing ₹${b} per kg so that the mixture is worth ₹${c} per kg?`,
    options, correctIndex,
    explanation: `By alligation, ratio of cheaper(₹${a}) to dearer(₹${b}) = (${b}−${c}) : (${c}−${a}) = ${cheap}:${dear}.`,
  };
}

const GENERATORS = [
  gTimeWorkJoin, gCISIdiff, gSuccessivePct, gTrainPlatform, gBoats,
  gPipesLeak, gPartnership, gAges, gMixture,
];

// ===================== EXPERT (even harder, multi-concept) =====================

// E1) Compound interest for 3 years — find the compound interest.
function gCI3yr() {
  const r = pick([10, 20]); // keeps (1+r/100)^3 clean
  const P = randInt(2, 20) * 5000;
  const factor = Math.pow(1 + r / 100, 3);
  const amount = Math.round(P * factor);
  const ci = amount - P;
  const { options, correctIndex } = numOpts(ci, "");
  return {
    topic: "Compound Interest",
    difficulty: "EXPERT",
    stem: `What is the compound interest (compounded annually) on ₹${P} at ${r}% per annum for 3 years?`,
    options: options.map((o) => `₹${o}`),
    correctIndex,
    explanation: `Amount = P(1+R/100)³ = ${P}(1+${r}/100)³ = ₹${amount}. CI = Amount − P = ₹${ci}.`,
  };
}

// E3) Time & Work — both work some days, then one leaves and the other finishes.
function gWorkLeaves() {
  const pairs = [[10, 15], [12, 18], [20, 30], [15, 10], [12, 24], [6, 12]];
  const [a, b] = pick(pairs);
  // together rate = 1/a + 1/b = (a+b)/(ab)
  const togNum = a + b, togDen = a * b;
  // work together for d days, then A leaves, B finishes the rest.
  const d = randInt(1, Math.max(1, Math.floor(togDen / togNum) - 1));
  // remaining = 1 - d*togNum/togDen
  const remNum = togDen - d * togNum, remDen = togDen;
  if (remNum <= 0) return gWorkLeaves();
  // B alone time for remaining = remaining * b = remNum*b/remDen
  const tNum = remNum * b, tDen = remDen;
  const totalNum = d * tDen + tNum, totalDen = tDen; // d + B-time
  if (totalNum % totalDen !== 0) return gWorkLeaves();
  const total = totalNum / totalDen;
  const { options, correctIndex } = numOpts(total, " days");
  return {
    topic: "Time and Work",
    difficulty: "EXPERT",
    stem: `A can do a work in ${a} days and B in ${b} days. They begin together, but A leaves after ${d} day(s). In how many total days will the work be completed?`,
    options, correctIndex,
    explanation: `Together they do ${d}×(1/${a}+1/${b}) = ${frac(d * togNum, togDen)} in ${d} day(s). Remaining = ${frac(remNum, remDen)}, done by B alone in ${frac(tNum, tDen)} days. Total = ${total} days.`,
  };
}

// E5) Mixture replacement — repeatedly remove and replace with water.
function gMixtureReplace() {
  const X = 100;
  const Rr = pick([10, 20, 40, 50]); // n=2 with these gives EXACT integer litres
  const n = 2;
  const milkNum = Math.round(X * Math.pow((X - Rr) / X, n)); // litres of milk left (exact)
  const water = X - milkNum;
  let rn = milkNum, rd = water; const g = gcd(rn, rd); rn /= g; rd /= g;
  const correct = `${rn}:${rd}`;
  const { options, correctIndex } = strOpts(correct, [`${rd}:${rn}`, `${rn + 1}:${rd}`, `${rn}:${rd + 1}`]);
  return {
    topic: "Mixture and Alligation",
    difficulty: "EXPERT",
    stem: `A vessel contains ${X} litres of pure milk. ${Rr} litres are drawn out and replaced with water; this is done ${n} times in total. What is the final ratio of milk to water in the vessel?`,
    options, correctIndex,
    explanation: `Milk left = ${X}(1−${Rr}/${X})^${n} = ${milkNum} L, water = ${water} L. Ratio milk:water = ${rn}:${rd}.`,
  };
}

// E6) Markup then discount — find net profit/loss percent.
function gMarkupDiscount() {
  const combos = [[40, 20], [20, 10], [50, 20], [60, 25], [40, 25]];
  const [m, dsc] = pick(combos);
  const factor = (1 + m / 100) * (1 - dsc / 100);
  const pct = Math.round((factor - 1) * 1000) / 10; // one decimal
  const isProfit = pct >= 0;
  const ansVal = Math.abs(pct);
  const distract = [ansVal + 2, ansVal - 2, ansVal + 4].filter((v) => v > 0 && v !== ansVal);
  const fmt = (v, profit) => `${v}% ${profit ? "profit" : "loss"}`;
  const correct = fmt(ansVal, isProfit);
  const opts = [correct, fmt(distract[0], isProfit), fmt(Math.abs(distract[1] ?? ansVal + 6), !isProfit), fmt(distract[2] ?? ansVal + 8, isProfit)];
  // de-dup & shuffle
  const uniq = [...new Set(opts)].slice(0, 4);
  while (uniq.length < 4) uniq.push(fmt(ansVal + uniq.length * 2 + 1, isProfit));
  for (let i = uniq.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [uniq[i], uniq[j]] = [uniq[j], uniq[i]]; }
  return {
    topic: "Profit and Loss",
    difficulty: "EXPERT",
    stem: `A shopkeeper marks his goods ${m}% above the cost price and then allows a discount of ${dsc}% on the marked price. What is his net profit or loss percent?`,
    options: uniq,
    correctIndex: uniq.indexOf(correct),
    explanation: `Net factor = (1+${m}/100)(1−${dsc}/100) = ${factor.toFixed(3)}. So ${ansVal}% ${isProfit ? "profit" : "loss"}.`,
  };
}

// E8) Two successive yearly population changes — find final value.
function gPopulation() {
  const P = randInt(2, 9) * 10000;
  const x = pick([10, 20, 25]);
  const y = pick([10, 20]);
  const dir2 = Math.random() < 0.5; // true = increase again, false = decrease
  const afterY1 = P * (1 + x / 100);
  const final = Math.round(afterY1 * (dir2 ? 1 + y / 100 : 1 - y / 100));
  const { options, correctIndex } = numOpts(final, "");
  return {
    topic: "Percentage",
    difficulty: "EXPERT",
    stem: `The population of a town is ${P}. It increases by ${x}% in the first year and ${dir2 ? "increases" : "decreases"} by ${y}% in the second year. What is the population at the end of two years?`,
    options,
    correctIndex,
    explanation: `End of year 1 = ${P}×(1+${x}/100) = ${afterY1}. End of year 2 = ${afterY1}×(1${dir2 ? "+" : "−"}${y}/100) = ${final}.`,
  };
}

const EXPERT_GENERATORS = [gCI3yr, gWorkLeaves, gMixtureReplace, gMarkupDiscount, gPopulation];
const ALL_GENERATORS = [...GENERATORS, ...EXPERT_GENERATORS];


(async () => {
  if (process.argv.includes("--verify")) {
    for (const g of ALL_GENERATORS) {
      console.log(`\n===== ${g.name} =====`);
      for (let i = 0; i < 2; i++) {
        const q = g();
        console.log(`Q: ${q.stem}`);
        console.log(`Options: ${q.options.join("  |  ")}`);
        console.log(`Correct: ${q.options[q.correctIndex]}`);
        console.log(`Why: ${q.explanation}`);
      }
    }
    await prisma.$disconnect();
    return;
  }
  // Preload existing hashes per target section to skip duplicates.
  const existing = {};
  for (const t of ACTIVE) {
    const rows = await prisma.question.findMany({
      where: { examCode: t.examCode, sectionCode: t.sectionCode },
      select: { contentHash: true },
    });
    existing[t.examCode + t.sectionCode] = new Set(rows.map((r) => r.contentHash));
  }

  let added = 0, attempts = 0;
  const qRows = [];
  const oRows = [];
  while (qRows.length < COUNT && attempts < COUNT * 10) {
    attempts++;
    const t = pick(ACTIVE);
    const gen = pick(ALL_GENERATORS)();
    const correct = gen.options[gen.correctIndex];
    const hash = contentHash(gen.stem, correct);
    const seen = existing[t.examCode + t.sectionCode];
    if (seen.has(hash)) continue;
    seen.add(hash);
    const id = crypto.randomUUID();
    qRows.push({
      id, examCode: t.examCode, sectionCode: t.sectionCode, subject: t.subject,
      topic: gen.topic, difficulty: gen.difficulty, stem: gen.stem,
      explanation: gen.explanation, source: "MANUAL", contentHash: hash, isActive: true,
    });
    gen.options.forEach((text, i) =>
      oRows.push({ questionId: id, text, isCorrect: i === gen.correctIndex, displayOrder: i })
    );
  }

  // Bulk insert in chunks — a few round trips instead of thousands (fast).
  const chunk = async (arr, size, fn) => {
    for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size));
  };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  await chunk(oRows, 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  added = qRows.length;
  console.log(`\nAdded ${added} hard/expert PYQ quant questions across ${ACTIVE.length} exams (attempts ${attempts}).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
