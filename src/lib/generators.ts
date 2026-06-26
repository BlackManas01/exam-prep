// Procedural + curated question generators used to seed the question bank.
// Math and reasoning questions are generated with genuinely-correct answers so
// the result evaluation is meaningful. GK/English use curated pools. The AI
// pipeline (see DESIGN.md) plugs in here later to expand the bank at scale.

import { GK_BANK, GS_BANK, ENGLISH_BANK, SPELLING_EXTRA, COMPUTER_BANK } from "./curatedQuestions";

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export interface GeneratedQuestion {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// --- Seeded RNG (mulberry32) so seeding is deterministic & high quality -----
// Uses Math.imul to stay within 32-bit precision (a plain LCG with a large
// multiplier overflows JS double precision and degrades into a short cycle).
let _seed = 1234567 >>> 0;
function rng(): number {
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function resetSeed(seed = 1234567) {
  _seed = seed >>> 0;
}
function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build 4/5 numeric options around a correct answer, all distinct, with
 * distractors spread *proportionally* to the answer's magnitude so the wrong
 * options look plausible (not "1234 vs 1235"). Preserves integer vs decimal.
 */
function numericOptions(correct: number, count: number): { options: string[]; correctIndex: number } {
  const isInt = Number.isInteger(correct);
  const mag = Math.abs(correct);
  const step = Math.max(1, Math.round(mag * 0.06)) || 1;
  const round = (x: number) => (isInt ? Math.round(x) : Math.round(x * 100) / 100);

  const set = new Set<number>([correct]);
  const deltas = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7];
  for (const d of deltas) {
    if (set.size >= count) break;
    const cand = round(correct + d * step);
    if ((cand >= 0 || correct < 0) && !set.has(cand)) set.add(cand);
  }
  // Safety fill (in case proportional spread collided).
  let extra = step * 8;
  while (set.size < count) {
    const cand = round(correct + extra);
    if ((cand >= 0 || correct < 0) && !set.has(cand)) set.add(cand);
    extra += step;
  }

  const values = Array.from(set);
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return { options: values.map(String), correctIndex: values.indexOf(correct) };
}

function diffByMagnitude(n: number): Difficulty {
  // These procedural generators produce SINGLE-STEP questions, which are EASY to
  // MEDIUM by nature — difficulty must reflect the number of reasoning steps, NOT
  // how big the answer number is. (Genuinely HARD/EXPERT questions come from the
  // curated multi-step PYQ set in scripts/add-hard-quant and AI generation.)
  return n < 100 ? "EASY" : "MEDIUM";
}

// ---------------------------------------------------------------------------
// Quantitative Aptitude generators
// ---------------------------------------------------------------------------
function genPercentage(opts: number): GeneratedQuestion {
  const pct = randInt(1, 99);
  const base = randInt(1, 50) * 100;
  const ans = (pct * base) / 100;
  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Percentage",
    difficulty: diffByMagnitude(base),
    stem: `What is ${pct}% of ${base}?`,
    options,
    correctIndex,
    explanation: `${pct}% of ${base} = (${pct}/100) × ${base} = ${ans}.`,
  };
}

function genAverage(opts: number): GeneratedQuestion {
  const n = randInt(3, 6);
  const nums = Array.from({ length: n }, () => randInt(10, 400));
  const sum = nums.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / n);
  // ensure exact average by adjusting last number
  const exactNums = [...nums];
  exactNums[n - 1] += avg * n - sum;
  const exactSum = exactNums.reduce((a, b) => a + b, 0);
  const { options, correctIndex } = numericOptions(exactSum / n, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Average",
    difficulty: "EASY",
    stem: `Find the average of the numbers: ${exactNums.join(", ")}.`,
    options,
    correctIndex,
    explanation: `Average = (${exactNums.join(" + ")}) / ${n} = ${exactSum} / ${n} = ${exactSum / n}.`,
  };
}

function genSimpleInterest(opts: number): GeneratedQuestion {
  const p = randInt(1, 40) * 500;
  const r = randInt(1, 15);
  const t = randInt(1, 10);
  const si = (p * r * t) / 100;
  const { options, correctIndex } = numericOptions(si, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Simple Interest",
    difficulty: diffByMagnitude(si),
    stem: `Find the simple interest on ₹${p} at ${r}% per annum for ${t} years.`,
    options,
    correctIndex,
    explanation: `SI = (P × R × T) / 100 = (${p} × ${r} × ${t}) / 100 = ₹${si}.`,
  };
}

function genTimeWork(opts: number): GeneratedQuestion {
  const a = randInt(2, 40);
  const b = randInt(2, 40);
  const together = (a * b) / (a + b);
  const rounded = Math.round(together * 100) / 100;
  const { options, correctIndex } = numericOptions(rounded, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Time & Work",
    difficulty: "MEDIUM",
    stem: `A can do a piece of work in ${a} days and B in ${b} days. Working together, in how many days (approx) will they finish it?`,
    options: options.map((o) => `${o} days`),
    correctIndex,
    explanation: `Combined one-day work = 1/${a} + 1/${b}. Time = (${a}×${b})/(${a}+${b}) = ${rounded} days.`,
  };
}

function genProfitLoss(opts: number): GeneratedQuestion {
  const cp = randInt(2, 100) * 100;
  const profitPct = randInt(5, 50);
  const sp = cp + (cp * profitPct) / 100;
  const { options, correctIndex } = numericOptions(sp, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Profit & Loss",
    difficulty: diffByMagnitude(cp),
    stem: `An item bought for ₹${cp} is sold at a profit of ${profitPct}%. Find the selling price.`,
    options: options.map((o) => `₹${o}`),
    correctIndex,
    explanation: `SP = CP × (1 + ${profitPct}/100) = ${cp} × ${1 + profitPct / 100} = ₹${sp}.`,
  };
}

function genMultiplication(opts: number): GeneratedQuestion {
  const a = randInt(11, 99);
  const b = randInt(11, 99);
  const ans = a * b;
  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Simplification",
    difficulty: diffByMagnitude(ans),
    stem: `Solve: ${a} × ${b} = ?`,
    options,
    correctIndex,
    explanation: `${a} × ${b} = ${ans}.`,
  };
}

function genAddition(opts: number): GeneratedQuestion {
  const a = randInt(100, 9999);
  const b = randInt(100, 9999);
  const ans = a + b;
  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Simplification",
    difficulty: diffByMagnitude(ans),
    stem: `Solve: ${a} + ${b} = ?`,
    options,
    correctIndex,
    explanation: `${a} + ${b} = ${ans}.`,
  };
}

function genDivision(opts: number): GeneratedQuestion {
  const divisor = randInt(2, 30);
  const quotient = randInt(5, 200);
  const dividend = divisor * quotient;
  const { options, correctIndex } = numericOptions(quotient, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Simplification",
    difficulty: diffByMagnitude(dividend),
    stem: `Solve: ${dividend} ÷ ${divisor} = ?`,
    options,
    correctIndex,
    explanation: `${dividend} ÷ ${divisor} = ${quotient}.`,
  };
}

const QUANT_GENERATORS = [
  genPercentage,
  genAverage,
  genSimpleInterest,
  genTimeWork,
  genProfitLoss,
  genMultiplication,
  genAddition,
  genDivision,
  genRatioProportion,
  genCompoundInterest,
  genSpeedDistance,
  genBoatsStreams,
  genPipesCisterns,
  genPartnership,
  genMixtureAlligation,
  genDiscount,
  genPercentChange,
  genHCFLCM,
  genUnitDigit,
  genMensuration2D,
  genMensuration3D,
  genTriangleAngle,
  genLinearEquation,
  genTrigValue,
  genDataInterpretation,
];

// ---------------------------------------------------------------------------
// Expanded Quantitative Aptitude — SSC-level breadth, all answers computed
// exactly so the marking is always correct. Explanations are step-by-step so
// they double as solutions.
// ---------------------------------------------------------------------------
function genRatioProportion(opts: number): GeneratedQuestion {
  const a = randInt(1, 6), b = randInt(1, 7), c = randInt(1, 5);
  const m = randInt(6, 80) * 5; // one part (keeps shares clean)
  const total = (a + b + c) * m;
  const parts = [a, b, c];
  const names = ["A", "B", "C"];
  const idx = randInt(0, 2);
  const ans = parts[idx] * m;
  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Ratio & Proportion",
    difficulty: diffByMagnitude(total),
    stem: `₹${total} is divided among A, B and C in the ratio ${a} : ${b} : ${c}. What is ${names[idx]}'s share?`,
    options: options.map((o) => `₹${o}`),
    correctIndex,
    explanation: `Sum of ratio terms = ${a}+${b}+${c} = ${a + b + c}. Value of one part = ₹${total} ÷ ${a + b + c} = ₹${m}. ${names[idx]}'s share = ${parts[idx]} × ₹${m} = ₹${ans}.`,
  };
}

function genCompoundInterest(opts: number): GeneratedQuestion {
  const p = randInt(1, 15) * 10000; // multiple of 10000 keeps CI exact
  const r = pick([4, 5, 8, 10, 15, 20, 25]);
  const t = 2;
  const factor = (200 * r + r * r) / 10000; // (1+r/100)^2 - 1
  const ci = p * factor;
  const amount = p + ci;
  const { options, correctIndex } = numericOptions(ci, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Compound Interest",
    difficulty: "MEDIUM",
    stem: `Find the compound interest on ₹${p} at ${r}% per annum for ${t} years, compounded annually.`,
    options: options.map((o) => `₹${o}`),
    correctIndex,
    explanation: `Amount = P(1 + R/100)² = ${p}(1 + ${r}/100)² = ₹${amount}. CI = Amount − Principal = ₹${amount} − ₹${p} = ₹${ci}.`,
  };
}

function genSpeedDistance(opts: number): GeneratedQuestion {
  const speed = randInt(20, 90);
  const time = randInt(2, 9);
  const dist = speed * time;
  const mode = randInt(0, 1);
  if (mode === 0) {
    const { options, correctIndex } = numericOptions(speed, opts);
    return {
      subject: "Quantitative Aptitude",
      topic: "Time, Speed & Distance",
      difficulty: "MEDIUM",
      stem: `A car covers a distance of ${dist} km in ${time} hours. Find its average speed.`,
      options: options.map((o) => `${o} km/h`),
      correctIndex,
      explanation: `Speed = Distance ÷ Time = ${dist} ÷ ${time} = ${speed} km/h.`,
    };
  }
  const { options, correctIndex } = numericOptions(time, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Time, Speed & Distance",
    difficulty: "MEDIUM",
    stem: `A train travels ${dist} km at a uniform speed of ${speed} km/h. How long does it take?`,
    options: options.map((o) => `${o} hours`),
    correctIndex,
    explanation: `Time = Distance ÷ Speed = ${dist} ÷ ${speed} = ${time} hours.`,
  };
}

function genBoatsStreams(opts: number): GeneratedQuestion {
  const boat = randInt(8, 25);
  const stream = randInt(2, boat - 2);
  const down = boat + stream;
  const up = boat - stream;
  const mode = randInt(0, 1);
  const ans = mode === 0 ? down : up;
  const dir = mode === 0 ? "downstream" : "upstream";
  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Boats & Streams",
    difficulty: "MEDIUM",
    stem: `The speed of a boat in still water is ${boat} km/h and the speed of the stream is ${stream} km/h. Find the ${dir} speed of the boat.`,
    options: options.map((o) => `${o} km/h`),
    correctIndex,
    explanation:
      mode === 0
        ? `Downstream speed = boat + stream = ${boat} + ${stream} = ${down} km/h.`
        : `Upstream speed = boat − stream = ${boat} − ${stream} = ${up} km/h.`,
  };
}

function genPipesCisterns(opts: number): GeneratedQuestion {
  const a = randInt(4, 30);
  const b = randInt(4, 30);
  const together = Math.round(((a * b) / (a + b)) * 100) / 100;
  const { options, correctIndex } = numericOptions(together, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Pipes & Cisterns",
    difficulty: "MEDIUM",
    stem: `Pipe A can fill a tank in ${a} hours and pipe B in ${b} hours. If both pipes are opened together, in how many hours (approx) will the tank be full?`,
    options: options.map((o) => `${o} hours`),
    correctIndex,
    explanation: `Together they fill 1/${a} + 1/${b} of the tank per hour. Time = (${a} × ${b}) ÷ (${a} + ${b}) = ${together} hours.`,
  };
}

function genPartnership(opts: number): GeneratedQuestion {
  const x = randInt(2, 20) * 1000;
  const y = randInt(2, 20) * 1000;
  const g = gcd(x, y);
  const rx = x / g, ry = y / g;
  const profit = randInt(2, 30) * (rx + ry); // divisible by (rx+ry)
  const bShare = (profit * ry) / (rx + ry);
  const { options, correctIndex } = numericOptions(bShare, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Partnership",
    difficulty: "MEDIUM",
    stem: `A and B start a business investing ₹${x} and ₹${y} respectively. At the end of the year the total profit is ₹${profit}. Find B's share of the profit.`,
    options: options.map((o) => `₹${o}`),
    correctIndex,
    explanation: `Profit is shared in the ratio of investments = ${x} : ${y} = ${rx} : ${ry}. B's share = ${profit} × ${ry}/(${rx}+${ry}) = ₹${bShare}.`,
  };
}

function genMixtureAlligation(opts: number): GeneratedQuestion {
  const total = randInt(4, 20) * 10; // litres
  const a = randInt(1, 6), b = randInt(1, 6);
  const m = total / (a + b);
  // ensure integer split
  if (!Number.isInteger(m)) return genRatioProportion(opts);
  const water = b * m;
  const { options, correctIndex } = numericOptions(water, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Mixture & Alligation",
    difficulty: "MEDIUM",
    stem: `A ${total}-litre mixture contains milk and water in the ratio ${a} : ${b}. How many litres of water does it contain?`,
    options: options.map((o) => `${o} litres`),
    correctIndex,
    explanation: `Total parts = ${a}+${b} = ${a + b}. One part = ${total}/${a + b} = ${m} litres. Water = ${b} × ${m} = ${water} litres.`,
  };
}

function genDiscount(opts: number): GeneratedQuestion {
  const mp = randInt(2, 60) * 100;
  const d = pick([5, 10, 12, 15, 20, 25, 30, 40]);
  const sp = mp - (mp * d) / 100;
  const { options, correctIndex } = numericOptions(sp, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Profit, Loss & Discount",
    difficulty: diffByMagnitude(mp),
    stem: `The marked price of an article is ₹${mp}. A discount of ${d}% is given on it. Find the selling price.`,
    options: options.map((o) => `₹${o}`),
    correctIndex,
    explanation: `Discount = ${d}% of ₹${mp} = ₹${(mp * d) / 100}. Selling price = ₹${mp} − ₹${(mp * d) / 100} = ₹${sp}.`,
  };
}

function genPercentChange(opts: number): GeneratedQuestion {
  const base = randInt(2, 40) * 50;
  const p = pick([10, 20, 25, 5, 15, 30, 40, 50]);
  const inc = randInt(0, 1) === 0;
  const ans = inc ? base + (base * p) / 100 : base - (base * p) / 100;
  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Percentage",
    difficulty: "EASY",
    stem: `A number ${base} is ${inc ? "increased" : "decreased"} by ${p}%. What is the new value?`,
    options,
    correctIndex,
    explanation: `Change = ${p}% of ${base} = ${(base * p) / 100}. New value = ${base} ${inc ? "+" : "−"} ${(base * p) / 100} = ${ans}.`,
  };
}

function genHCFLCM(opts: number): GeneratedQuestion {
  const a = randInt(6, 60);
  const b = randInt(6, 60);
  const wantLcm = randInt(0, 1) === 0;
  const h = gcd(a, b);
  const l = (a * b) / h;
  const ans = wantLcm ? l : h;
  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Number System",
    difficulty: "MEDIUM",
    stem: `Find the ${wantLcm ? "LCM" : "HCF"} of ${a} and ${b}.`,
    options,
    correctIndex,
    explanation: wantLcm
      ? `HCF(${a}, ${b}) = ${h}. LCM = (${a} × ${b}) ÷ HCF = ${a * b} ÷ ${h} = ${l}.`
      : `The highest common factor of ${a} and ${b} is ${h}.`,
  };
}

function genUnitDigit(opts: number): GeneratedQuestion {
  const base = randInt(2, 9);
  const exp = randInt(2, 40);
  const cycle: Record<number, number[]> = {
    2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 4: [4, 6], 5: [5], 6: [6],
    7: [7, 9, 3, 1], 8: [8, 4, 2, 6], 9: [9, 1],
  };
  const c = cycle[base];
  const ans = c[(exp - 1) % c.length];
  // distinct digit options
  const set = new Set<number>([ans]);
  while (set.size < opts) set.add(randInt(0, 9));
  const arr = Array.from(set);
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return {
    subject: "Quantitative Aptitude",
    topic: "Number System",
    difficulty: "HARD",
    stem: `What is the unit (ones) digit of ${base}^${exp}?`,
    options: arr.map(String),
    correctIndex: arr.indexOf(ans),
    explanation: `The unit digits of powers of ${base} repeat in a cycle of ${c.length}: ${c.join(", ")}. Since ${exp} mod ${c.length} = ${exp % c.length}, the unit digit of ${base}^${exp} is ${ans}.`,
  };
}

function genMensuration2D(opts: number): GeneratedQuestion {
  const kind = randInt(0, 2);
  if (kind === 0) {
    const r = randInt(1, 12) * 7; // multiple of 7 for π = 22/7
    const area = (22 / 7) * r * r;
    const { options, correctIndex } = numericOptions(area, opts);
    return {
      subject: "Quantitative Aptitude", topic: "Mensuration", difficulty: "MEDIUM",
      stem: `Find the area of a circle whose radius is ${r} cm. (Take π = 22/7)`,
      options: options.map((o) => `${o} cm²`), correctIndex,
      explanation: `Area = πr² = (22/7) × ${r}² = (22/7) × ${r * r} = ${area} cm².`,
    };
  }
  if (kind === 1) {
    const l = randInt(5, 40), w = randInt(3, 30);
    const area = l * w;
    const { options, correctIndex } = numericOptions(area, opts);
    return {
      subject: "Quantitative Aptitude", topic: "Mensuration", difficulty: "EASY",
      stem: `Find the area of a rectangle of length ${l} cm and breadth ${w} cm.`,
      options: options.map((o) => `${o} cm²`), correctIndex,
      explanation: `Area of rectangle = length × breadth = ${l} × ${w} = ${area} cm².`,
    };
  }
  const base = randInt(4, 40), height = randInt(4, 40);
  const area = (base * height) / 2;
  const { options, correctIndex } = numericOptions(area, opts);
  return {
    subject: "Quantitative Aptitude", topic: "Mensuration", difficulty: "EASY",
    stem: `Find the area of a triangle with base ${base} cm and height ${height} cm.`,
    options: options.map((o) => `${o} cm²`), correctIndex,
    explanation: `Area of triangle = ½ × base × height = ½ × ${base} × ${height} = ${area} cm².`,
  };
}

function genMensuration3D(opts: number): GeneratedQuestion {
  const kind = randInt(0, 1);
  if (kind === 0) {
    const a = randInt(2, 20);
    const vol = a * a * a;
    const { options, correctIndex } = numericOptions(vol, opts);
    return {
      subject: "Quantitative Aptitude", topic: "Mensuration", difficulty: "MEDIUM",
      stem: `Find the volume of a cube whose edge is ${a} cm.`,
      options: options.map((o) => `${o} cm³`), correctIndex,
      explanation: `Volume of cube = edge³ = ${a}³ = ${vol} cm³.`,
    };
  }
  const l = randInt(3, 20), b = randInt(3, 20), h = randInt(3, 20);
  const vol = l * b * h;
  const { options, correctIndex } = numericOptions(vol, opts);
  return {
    subject: "Quantitative Aptitude", topic: "Mensuration", difficulty: "MEDIUM",
    stem: `Find the volume of a cuboid of dimensions ${l} cm × ${b} cm × ${h} cm.`,
    options: options.map((o) => `${o} cm³`), correctIndex,
    explanation: `Volume of cuboid = l × b × h = ${l} × ${b} × ${h} = ${vol} cm³.`,
  };
}

function genTriangleAngle(opts: number): GeneratedQuestion {
  const a = randInt(30, 90);
  const b = randInt(20, 150 - a);
  const c = 180 - a - b;
  const { options, correctIndex } = numericOptions(c, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Geometry",
    difficulty: "EASY",
    stem: `Two angles of a triangle are ${a}° and ${b}°. Find the third angle.`,
    options: options.map((o) => `${o}°`),
    correctIndex,
    explanation: `Sum of all angles of a triangle = 180°. Third angle = 180° − ${a}° − ${b}° = ${c}°.`,
  };
}

function genLinearEquation(opts: number): GeneratedQuestion {
  const x = randInt(2, 20);
  const a = randInt(2, 12);
  const b = randInt(1, 40);
  const rhs = a * x + b;
  const { options, correctIndex } = numericOptions(x, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Algebra",
    difficulty: "MEDIUM",
    stem: `Solve for x: ${a}x + ${b} = ${rhs}.`,
    options,
    correctIndex,
    explanation: `${a}x = ${rhs} − ${b} = ${rhs - b}. So x = ${rhs - b} ÷ ${a} = ${x}.`,
  };
}

function genTrigValue(opts: number): GeneratedQuestion {
  const items = [
    { q: "sin 30°", v: "1/2" }, { q: "cos 60°", v: "1/2" }, { q: "tan 45°", v: "1" },
    { q: "sin 90°", v: "1" }, { q: "cos 0°", v: "1" }, { q: "sin 0°", v: "0" },
    { q: "cos 90°", v: "0" }, { q: "tan 0°", v: "0" }, { q: "sin 60°", v: "√3/2" },
    { q: "cos 30°", v: "√3/2" }, { q: "tan 30°", v: "1/√3" }, { q: "tan 60°", v: "√3" },
    { q: "sin 45°", v: "1/√2" }, { q: "cos 45°", v: "1/√2" },
  ];
  const pickItem = items[Math.floor(rng() * items.length)];
  const distract = ["0", "1", "1/2", "√3/2", "1/√2", "√3", "1/√3", "2"].filter((d) => d !== pickItem.v);
  const set = new Set<string>([pickItem.v]);
  while (set.size < opts && distract.length) {
    const d = distract.splice(Math.floor(rng() * distract.length), 1)[0];
    set.add(d);
  }
  const arr = Array.from(set);
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return {
    subject: "Quantitative Aptitude",
    topic: "Trigonometry",
    difficulty: "MEDIUM",
    stem: `What is the value of ${pickItem.q}?`,
    options: arr,
    correctIndex: arr.indexOf(pickItem.v),
    explanation: `From the standard trigonometric table, ${pickItem.q} = ${pickItem.v}.`,
  };
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

// Data Interpretation — a text table of values with a computed question. A core
// SSC/Banking topic. Answers are always exact integers.
function genDataInterpretation(opts: number): GeneratedQuestion {
  const labels = ["P", "Q", "R", "S"];
  const ctx = pick([
    "cars sold by a showroom",
    "students enrolled in a school",
    "units produced by a factory",
    "books sold by a store",
    "tickets booked by an agency",
  ]);
  const vals = labels.map(() => randInt(40, 300));
  const total = vals.reduce((a, b) => a + b, 0);
  const table = labels.map((l, i) => `${l} = ${vals[i]}`).join(",  ");
  const intro = `The table below shows the number of ${ctx}:\n${table}.`;

  const modes = ["total", "diff", "sum2", "avg"];
  let mode = modes[Math.floor(rng() * modes.length)];
  if (mode === "avg" && total % 4 !== 0) mode = "total"; // keep average exact

  let question: string, ans: number, expl: string;
  const i = randInt(0, 3);
  let j = randInt(0, 3);
  while (j === i) j = randInt(0, 3);

  if (mode === "total") {
    ans = total;
    question = `What is the total number of ${ctx} for P, Q, R and S together?`;
    expl = `Total = ${vals.join(" + ")} = ${total}.`;
  } else if (mode === "diff") {
    const hi = Math.max(vals[i], vals[j]), lo = Math.min(vals[i], vals[j]);
    const hiL = vals[i] >= vals[j] ? labels[i] : labels[j];
    const loL = vals[i] >= vals[j] ? labels[j] : labels[i];
    ans = hi - lo;
    question = `How many more ${ctx} are there for ${hiL} than for ${loL}?`;
    expl = `Difference = ${hiL} − ${loL} = ${hi} − ${lo} = ${ans}.`;
  } else if (mode === "sum2") {
    ans = vals[i] + vals[j];
    question = `What is the combined number of ${ctx} for ${labels[i]} and ${labels[j]}?`;
    expl = `${labels[i]} + ${labels[j]} = ${vals[i]} + ${vals[j]} = ${ans}.`;
  } else {
    ans = total / 4;
    question = `What is the average number of ${ctx} per category (P, Q, R, S)?`;
    expl = `Average = (${vals.join(" + ")}) ÷ 4 = ${total} ÷ 4 = ${ans}.`;
  }

  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Quantitative Aptitude",
    topic: "Data Interpretation",
    difficulty: "MEDIUM",
    stem: `${intro}\n${question}`,
    options,
    correctIndex,
    explanation: expl,
  };
}

// ---------------------------------------------------------------------------
// Reasoning generators
// ---------------------------------------------------------------------------
function genNumberSeries(opts: number): GeneratedQuestion {
  const start = randInt(1, 200);
  const diff = randInt(2, 40);
  const len = randInt(4, 5);
  const seq = Array.from({ length: len }, (_, i) => start + i * diff);
  const ans = start + len * diff;
  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Reasoning",
    topic: "Number Series",
    difficulty: "EASY",
    stem: `Find the next term in the series: ${seq.join(", ")}, ?`,
    options,
    correctIndex,
    explanation: `The series increases by ${diff} each time, so the next term is ${seq[len - 1]} + ${diff} = ${ans}.`,
  };
}

function genGeometricSeries(opts: number): GeneratedQuestion {
  const start = randInt(1, 20);
  const ratio = randInt(2, 6);
  const seq = [start, start * ratio, start * ratio ** 2, start * ratio ** 3];
  const ans = start * ratio ** 4;
  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Reasoning",
    topic: "Number Series",
    difficulty: "MEDIUM",
    stem: `Find the next term in the series: ${seq.join(", ")}, ?`,
    options,
    correctIndex,
    explanation: `Each term is multiplied by ${ratio}, so the next term is ${seq[3]} × ${ratio} = ${ans}.`,
  };
}

function genCoding(opts: number): GeneratedQuestion {
  const words = ["CAT", "DOG", "SUN", "BAT", "PEN", "CUP", "FAN", "BOX", "CAR", "MAP", "HEN", "JAR", "KEY", "LOG", "NET", "OWL", "RAT", "TOY", "VAN", "ZIP", "ARM", "BED", "COW", "EGG"];
  const word = pick(words);
  const shift = randInt(1, 25);
  const encode = (w: string) =>
    w
      .split("")
      .map((c) => String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65))
      .join("");
  const sample = pick(words.filter((w) => w !== word));
  const answer = encode(word);
  const distractors = new Set<string>([answer]);
  while (distractors.size < opts) {
    const alt = encode(pick(words));
    if (alt !== answer) distractors.add(alt);
    else distractors.add(answer.split("").reverse().join(""));
  }
  const arr = Array.from(distractors);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return {
    subject: "Reasoning",
    topic: "Coding-Decoding",
    difficulty: "MEDIUM",
    stem: `In a certain code, ${sample} is written as ${encode(sample)}. How is ${word} written in that code?`,
    options: arr,
    correctIndex: arr.indexOf(answer),
    explanation: `Each letter is shifted forward by ${shift} position(s). ${word} → ${answer}.`,
  };
}

function genOddOneOut(opts: number): GeneratedQuestion {
  const multiple = randInt(3, 15);
  const items = new Set<number>();
  while (items.size < opts - 1) items.add(multiple * randInt(2, 20));
  const arr = Array.from(items);
  // odd one: not a multiple
  let odd = multiple * randInt(2, 20) + randInt(1, multiple - 1);
  while (arr.includes(odd) || odd % multiple === 0) odd = multiple * randInt(2, 20) + randInt(1, multiple - 1);
  const all = [...arr, odd];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return {
    subject: "Reasoning",
    topic: "Classification",
    difficulty: "EASY",
    stem: `Find the odd one out: ${all.join(", ")}.`,
    options: all.map(String),
    correctIndex: all.indexOf(odd),
    explanation: `All numbers except ${odd} are multiples of ${multiple}.`,
  };
}

const REASONING_GENERATORS = [
  genNumberSeries,
  genGeometricSeries,
  genCoding,
  genOddOneOut,
  genMissingNumber,
  genAlternatingSeries,
  genDirectionSense,
  genNumberAnalogy,
  genMathOperations,
  genLetterSeries,
  genRanking,
  genClockAngle,
  genAgeProblem,
  genBloodRelation,
  genSyllogism,
];

// ---------------------------------------------------------------------------
// Expanded Reasoning — SSC-level types. Math-based ones are computed exactly;
// blood-relation and syllogism use verified curated puzzles.
// ---------------------------------------------------------------------------
function genDirectionSense(opts: number): GeneratedQuestion {
  const triples = [
    [3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15],
    [8, 15, 17], [12, 16, 20], [7, 24, 25], [20, 21, 29], [10, 24, 26],
  ];
  const [a, b, c] = pick(triples);
  const [d1, d2] = pick([
    ["North", "East"], ["South", "West"], ["East", "South"], ["West", "North"],
  ]);
  const { options, correctIndex } = numericOptions(c, opts);
  return {
    subject: "Reasoning",
    topic: "Direction Sense",
    difficulty: "MEDIUM",
    stem: `A person starts from a point, walks ${a} m towards ${d1}, then turns and walks ${b} m towards ${d2}. How far is the person now from the starting point?`,
    options: options.map((o) => `${o} m`),
    correctIndex,
    explanation: `The two legs are perpendicular, so the shortest distance = √(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${a * a + b * b} = ${c} m.`,
  };
}

function genNumberAnalogy(opts: number): GeneratedQuestion {
  const types: { key: string; f: (n: number) => number; desc: string }[] = [
    { key: "square", f: (n) => n * n, desc: "its square" },
    { key: "cube", f: (n) => n * n * n, desc: "its cube" },
    { key: "double", f: (n) => 2 * n, desc: "twice the number" },
    { key: "triple", f: (n) => 3 * n, desc: "three times the number" },
    { key: "plusone_sq", f: (n) => (n + 1) * (n + 1), desc: "the square of (number + 1)" },
  ];
  const t = pick(types);
  const a = randInt(2, 12), b = randInt(2, 12);
  const fa = t.f(a), fb = t.f(b);
  const { options, correctIndex } = numericOptions(fb, opts);
  return {
    subject: "Reasoning",
    topic: "Analogy",
    difficulty: "MEDIUM",
    stem: `${a} : ${fa} :: ${b} : ?`,
    options,
    correctIndex,
    explanation: `In each pair, the second term is ${t.desc} (${a} → ${fa}). So for ${b}, the answer is ${fb}.`,
  };
}

function evalTwoOp(a: number, op1: string, b: number, op2: string, c: number): number {
  const ops = [op1, op2];
  const vals = [a, b, c];
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === "×") { vals[i] = vals[i] * vals[i + 1]; vals.splice(i + 1, 1); ops.splice(i, 1); i--; }
  }
  let res = vals[0];
  for (let i = 0; i < ops.length; i++) res = ops[i] === "+" ? res + vals[i + 1] : res - vals[i + 1];
  return res;
}

function genMathOperations(opts: number): GeneratedQuestion {
  const real = ["+", "-", "×"];
  const display = shuffleArr(["+", "-", "×"]);
  // display[i] (as written) MEANS real[i]
  const meaning: Record<string, string> = {};
  display.forEach((d, i) => (meaning[d] = real[i]));
  const a = randInt(3, 12), b = randInt(2, 9), c = randInt(2, 9);
  const d1 = display[0], d2 = display[1];
  const ans = evalTwoOp(a, meaning[d1], b, meaning[d2], c);
  const { options, correctIndex } = numericOptions(ans, opts);
  const legend = display.map((d) => `'${d}' means '${meaning[d]}'`).join(", ");
  return {
    subject: "Reasoning",
    topic: "Mathematical Operations",
    difficulty: "HARD",
    stem: `If ${legend}, then what is the value of:  ${a} ${d1} ${b} ${d2} ${c} ?`,
    options,
    correctIndex,
    explanation: `Substituting the real operations: ${a} ${meaning[d1]} ${b} ${meaning[d2]} ${c}. Applying × before + and −, the value = ${ans}.`,
  };
}

function genLetterSeries(opts: number): GeneratedQuestion {
  const step = pick([1, 2, 3, 4]);
  const start = randInt(0, 25 - 4 * step);
  const seq = [0, 1, 2, 3].map((i) => String.fromCharCode(65 + start + i * step));
  const ans = String.fromCharCode(65 + start + 4 * step);
  const set = new Set<string>([ans]);
  while (set.size < opts) {
    const r = String.fromCharCode(65 + randInt(0, 25));
    set.add(r);
  }
  const arr = Array.from(set);
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return {
    subject: "Reasoning",
    topic: "Letter Series",
    difficulty: "EASY",
    stem: `Find the next letter in the series: ${seq.join(", ")}, ?`,
    options: arr,
    correctIndex: arr.indexOf(ans),
    explanation: `Each letter moves ${step} step(s) forward in the alphabet, so the next letter after ${seq[3]} is ${ans}.`,
  };
}

function genRanking(opts: number): GeneratedQuestion {
  const total = randInt(15, 45);
  const left = randInt(4, total - 3);
  const right = total - left + 1;
  const { options, correctIndex } = numericOptions(total, opts);
  return {
    subject: "Reasoning",
    topic: "Ranking & Order",
    difficulty: "MEDIUM",
    stem: `In a row of students, Rahul is ${left}th from the left end and ${right}th from the right end. How many students are there in the row?`,
    options,
    correctIndex,
    explanation: `Total = (position from left) + (position from right) − 1 = ${left} + ${right} − 1 = ${total}.`,
  };
}

function genClockAngle(opts: number): GeneratedQuestion {
  const h = randInt(1, 12);
  const m = pick([0, 10, 15, 20, 30, 40, 45]);
  let angle = Math.abs(30 * h - 5.5 * m);
  if (angle > 180) angle = 360 - angle;
  angle = Math.round(angle * 100) / 100;
  const { options, correctIndex } = numericOptions(angle, opts);
  const mm = m.toString().padStart(2, "0");
  return {
    subject: "Reasoning",
    topic: "Clock",
    difficulty: "HARD",
    stem: `What is the angle between the hour hand and the minute hand of a clock at ${h}:${mm}?`,
    options: options.map((o) => `${o}°`),
    correctIndex,
    explanation: `Angle = |30 × H − 5.5 × M| = |30 × ${h} − 5.5 × ${m}| = ${angle}° (taking the smaller angle).`,
  };
}

function genAgeProblem(opts: number): GeneratedQuestion {
  const son = randInt(8, 22);
  const k = randInt(2, 5);
  const father = son * k;
  const { options, correctIndex } = numericOptions(son, opts);
  return {
    subject: "Reasoning",
    topic: "Ages",
    difficulty: "MEDIUM",
    stem: `A father is ${k} times as old as his son. If the father's present age is ${father} years, what is the present age of the son?`,
    options: options.map((o) => `${o} years`),
    correctIndex,
    explanation: `Son's age = father's age ÷ ${k} = ${father} ÷ ${k} = ${son} years.`,
  };
}

// Verified blood-relation puzzles (correctness guaranteed by curation).
const BLOOD_RELATIONS: { stem: string; options: string[]; correct: string; explanation: string }[] = [
  { stem: "Pointing to a photograph, a man said, \"She is the daughter of my grandfather's only son.\" How is the girl related to the man?", options: ["Sister", "Daughter", "Cousin", "Niece"], correct: "Sister", explanation: "Grandfather's only son is the man's father; his daughter is the man's sister." },
  { stem: "A is B's father. C is B's sister. How is A related to C?", options: ["Brother", "Father", "Uncle", "Son"], correct: "Father", explanation: "C is B's sister, so C is also A's child. A is C's father." },
  { stem: "P is the brother of Q. Q is the sister of R. How is R's father's wife related to P?", options: ["Sister", "Mother", "Aunt", "Cousin"], correct: "Mother", explanation: "P, Q and R are siblings; R's father's wife is their mother, so she is P's mother." },
  { stem: "Pointing to a man, a woman said, \"His mother is the only daughter of my mother.\" How is the woman related to the man?", options: ["Sister", "Mother", "Aunt", "Grandmother"], correct: "Mother", explanation: "The only daughter of the woman's mother is the woman herself; so she is the man's mother." },
  { stem: "If X is the son of Y, and Y is the sister of Z, then how is Z related to X?", options: ["Father", "Uncle/Aunt", "Brother", "Son"], correct: "Uncle/Aunt", explanation: "Y is X's parent (mother) and Z is Y's sibling, so Z is X's maternal uncle or aunt." },
  { stem: "A is the mother of B. B is the brother of C. C is the daughter of D. How is A related to D?", options: ["Wife", "Sister", "Daughter", "Mother"], correct: "Wife", explanation: "B and C are children of both A and D; A (mother) is therefore the wife of D (father)." },
  { stem: "M is the father of N. N is the father of O. How is M related to O?", options: ["Father", "Grandfather", "Uncle", "Brother"], correct: "Grandfather", explanation: "M is N's father and N is O's father, so M is O's grandfather." },
  { stem: "Pointing to a boy, Reena said, \"He is the son of my mother's only son.\" How is the boy related to Reena?", options: ["Son", "Nephew", "Brother", "Cousin"], correct: "Nephew", explanation: "Reena's mother's only son is Reena's brother; his son is Reena's nephew." },
];

function genBloodRelation(opts: number): GeneratedQuestion {
  const q = pick(BLOOD_RELATIONS);
  const options = q.options.slice(0, Math.max(4, opts));
  return {
    subject: "Reasoning",
    topic: "Blood Relations",
    difficulty: "MEDIUM",
    stem: q.stem,
    options,
    correctIndex: options.indexOf(q.correct),
    explanation: q.explanation,
  };
}

// Verified syllogism puzzles.
const SYLLOGISMS: { stem: string; options: string[]; correct: string; explanation: string }[] = [
  { stem: "Statements: All cats are animals. All animals are living things. Conclusion: All cats are living things. Is the conclusion valid?", options: ["Valid", "Invalid", "Cannot be determined", "Partially valid"], correct: "Valid", explanation: "Cats ⊆ animals ⊆ living things, so all cats are living things." },
  { stem: "Statements: All pens are books. Some books are red. Conclusion: Some pens are red. Is the conclusion valid?", options: ["Valid", "Invalid", "Definitely true", "Always true"], correct: "Invalid", explanation: "'Some books are red' need not include any pens, so the conclusion does not necessarily follow." },
  { stem: "Statements: No dogs are cats. All cats are pets. Conclusion: Some pets are not dogs. Is the conclusion valid?", options: ["Valid", "Invalid", "Cannot be determined", "False"], correct: "Valid", explanation: "Cats are pets and no cat is a dog, so those cats are pets that are not dogs." },
  { stem: "Statements: All roses are flowers. Some flowers fade quickly. Conclusion: Some roses fade quickly. Is the conclusion valid?", options: ["Valid", "Invalid", "Definitely true", "Always true"], correct: "Invalid", explanation: "The flowers that fade quickly need not be roses, so the conclusion is not guaranteed." },
  { stem: "Statements: All squares are rectangles. All rectangles have four sides. Conclusion: All squares have four sides. Is the conclusion valid?", options: ["Valid", "Invalid", "Cannot be determined", "Partially valid"], correct: "Valid", explanation: "Squares ⊆ rectangles, and all rectangles have four sides, so all squares do too." },
];

function genSyllogism(opts: number): GeneratedQuestion {
  const q = pick(SYLLOGISMS);
  const options = q.options.slice(0, Math.max(4, opts));
  return {
    subject: "Reasoning",
    topic: "Syllogism",
    difficulty: "HARD",
    stem: q.stem,
    options,
    correctIndex: options.indexOf(q.correct),
    explanation: q.explanation,
  };
}

function genMissingNumber(opts: number): GeneratedQuestion {
  const start = randInt(1, 100);
  const diff = randInt(2, 25);
  const len = 5;
  const seq = Array.from({ length: len }, (_, i) => start + i * diff);
  const missingIdx = randInt(1, len - 2);
  const ans = seq[missingIdx];
  const shown = seq.map((v, i) => (i === missingIdx ? "?" : v)).join(", ");
  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Reasoning",
    topic: "Number Series",
    difficulty: "MEDIUM",
    stem: `Find the missing term: ${shown}`,
    options,
    correctIndex,
    explanation: `The series increases by ${diff} each time, so the missing term is ${ans}.`,
  };
}

function genAlternatingSeries(opts: number): GeneratedQuestion {
  const a = randInt(1, 50);
  const d1 = randInt(2, 20);
  const b = randInt(1, 50);
  const d2 = randInt(2, 20);
  const seq = [a, b, a + d1, b + d2, a + 2 * d1];
  const ans = b + 2 * d2;
  const { options, correctIndex } = numericOptions(ans, opts);
  return {
    subject: "Reasoning",
    topic: "Number Series",
    difficulty: "HARD",
    stem: `Find the next term in the series: ${seq.join(", ")}, ?`,
    options,
    correctIndex,
    explanation: `Two alternating series are interleaved: positions 1,3,5 increase by ${d1} and positions 2,4,6 increase by ${d2}. Next term = ${b} + 2×${d2} = ${ans}.`,
  };
}

// ---------------------------------------------------------------------------
// Curated pools for subjects that are not procedurally generable
// ---------------------------------------------------------------------------
interface CuratedQ {
  topic: string;
  difficulty: Difficulty;
  stem: string;
  options: string[];
  correct: string;
  explanation: string;
}

const ENGLISH_POOL: CuratedQ[] = [
  { topic: "Synonyms", difficulty: "EASY", stem: "Choose the synonym of 'ABUNDANT'.", options: ["Scarce", "Plentiful", "Tiny", "Weak"], correct: "Plentiful", explanation: "'Abundant' means existing in large quantities — plentiful." },
  { topic: "Synonyms", difficulty: "MEDIUM", stem: "Choose the synonym of 'CANDID'.", options: ["Frank", "Secretive", "Rude", "Lazy"], correct: "Frank", explanation: "'Candid' means truthful and straightforward — frank." },
  { topic: "Antonyms", difficulty: "EASY", stem: "Choose the antonym of 'BENEVOLENT'.", options: ["Kind", "Generous", "Cruel", "Helpful"], correct: "Cruel", explanation: "'Benevolent' means kind; its opposite is cruel." },
  { topic: "Antonyms", difficulty: "MEDIUM", stem: "Choose the antonym of 'TRANSPARENT'.", options: ["Clear", "Opaque", "Visible", "Plain"], correct: "Opaque", explanation: "'Transparent' means see-through; opposite is opaque." },
  { topic: "Error Spotting", difficulty: "MEDIUM", stem: "Identify the error: 'He do not like coffee.'", options: ["He", "do not", "like", "coffee"], correct: "do not", explanation: "Subject 'He' is singular, so it should be 'does not'." },
  { topic: "Fill in the Blanks", difficulty: "EASY", stem: "She is fond ____ painting.", options: ["of", "with", "in", "at"], correct: "of", explanation: "'Fond of' is the correct prepositional phrase." },
  { topic: "One Word Substitution", difficulty: "MEDIUM", stem: "A person who knows many languages is a ____.", options: ["Polyglot", "Linguist", "Bilingual", "Orator"], correct: "Polyglot", explanation: "A polyglot knows and uses several languages." },
  { topic: "Idioms", difficulty: "HARD", stem: "The idiom 'to bite the bullet' means:", options: ["To eat fast", "To endure a painful situation", "To shoot", "To run away"], correct: "To endure a painful situation", explanation: "'Bite the bullet' = to face a difficult situation bravely." },
  { topic: "Spelling", difficulty: "EASY", stem: "Choose the correctly spelt word.", options: ["Recieve", "Receive", "Receeve", "Receve"], correct: "Receive", explanation: "The rule 'i before e except after c' gives 'receive'." },
  { topic: "Sentence Improvement", difficulty: "MEDIUM", stem: "Improve: 'He is junior than me.'", options: ["junior to me", "junior from me", "more junior than me", "No improvement"], correct: "junior to me", explanation: "'Junior' takes the preposition 'to', not 'than'." },
];

const GK_POOL: CuratedQ[] = [
  { topic: "Polity", difficulty: "EASY", stem: "How many fundamental rights are guaranteed by the Indian Constitution?", options: ["5", "6", "7", "8"], correct: "6", explanation: "There are 6 fundamental rights after the Right to Property was removed." },
  { topic: "Polity", difficulty: "MEDIUM", stem: "Who is the head of the state in India?", options: ["Prime Minister", "President", "Chief Justice", "Speaker"], correct: "President", explanation: "The President is the constitutional head of the Indian state." },
  { topic: "History", difficulty: "EASY", stem: "In which year did India gain independence?", options: ["1945", "1947", "1950", "1942"], correct: "1947", explanation: "India became independent on 15 August 1947." },
  { topic: "History", difficulty: "MEDIUM", stem: "Who founded the Maurya Empire?", options: ["Ashoka", "Chandragupta Maurya", "Bindusara", "Bimbisara"], correct: "Chandragupta Maurya", explanation: "Chandragupta Maurya founded the Maurya Empire around 322 BCE." },
  { topic: "Geography", difficulty: "EASY", stem: "Which is the longest river in India?", options: ["Yamuna", "Godavari", "Ganga", "Narmada"], correct: "Ganga", explanation: "The Ganga is the longest river flowing within India." },
  { topic: "Geography", difficulty: "MEDIUM", stem: "The Tropic of Cancer does NOT pass through which state?", options: ["Gujarat", "Rajasthan", "Kerala", "Jharkhand"], correct: "Kerala", explanation: "The Tropic of Cancer passes through 8 states; Kerala is not one of them." },
  { topic: "Science", difficulty: "EASY", stem: "What is the chemical symbol of Gold?", options: ["Go", "Gd", "Au", "Ag"], correct: "Au", explanation: "Gold's symbol 'Au' comes from the Latin 'aurum'." },
  { topic: "Science", difficulty: "MEDIUM", stem: "Which gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: "Carbon dioxide", explanation: "Plants absorb CO₂ and release O₂ during photosynthesis." },
  { topic: "Economy", difficulty: "MEDIUM", stem: "Who regulates monetary policy in India?", options: ["SEBI", "RBI", "NITI Aayog", "Finance Ministry"], correct: "RBI", explanation: "The Reserve Bank of India regulates monetary policy." },
  { topic: "Static GK", difficulty: "EASY", stem: "Which is the national animal of India?", options: ["Lion", "Elephant", "Tiger", "Leopard"], correct: "Tiger", explanation: "The Royal Bengal Tiger is India's national animal." },
  { topic: "Polity", difficulty: "MEDIUM", stem: "Which article of the Constitution deals with the abolition of untouchability?", options: ["Article 14", "Article 17", "Article 21", "Article 19"], correct: "Article 17", explanation: "Article 17 abolishes untouchability in any form." },
  { topic: "Polity", difficulty: "EASY", stem: "How many members can the President nominate to the Rajya Sabha?", options: ["2", "10", "12", "14"], correct: "12", explanation: "The President nominates 12 members for their expertise in arts, science, etc." },
  { topic: "History", difficulty: "MEDIUM", stem: "Who was the first Governor-General of independent India?", options: ["C. Rajagopalachari", "Lord Mountbatten", "Rajendra Prasad", "Jawaharlal Nehru"], correct: "Lord Mountbatten", explanation: "Lord Mountbatten was the first Governor-General of independent India." },
  { topic: "History", difficulty: "EASY", stem: "The Jallianwala Bagh massacre took place in which year?", options: ["1919", "1921", "1930", "1942"], correct: "1919", explanation: "The massacre occurred on 13 April 1919 in Amritsar." },
  { topic: "Geography", difficulty: "MEDIUM", stem: "Which is the highest mountain peak in India?", options: ["Nanda Devi", "Kanchenjunga", "K2 (Godwin Austen)", "Everest"], correct: "K2 (Godwin Austen)", explanation: "K2 in the Indian-claimed region is the highest; Kanchenjunga is highest fully within India." },
  { topic: "Geography", difficulty: "EASY", stem: "Which state is the largest in India by area?", options: ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Uttar Pradesh"], correct: "Rajasthan", explanation: "Rajasthan is the largest Indian state by area." },
  { topic: "Science", difficulty: "EASY", stem: "What is the SI unit of electric current?", options: ["Volt", "Ampere", "Ohm", "Watt"], correct: "Ampere", explanation: "The ampere (A) is the SI unit of electric current." },
  { topic: "Science", difficulty: "MEDIUM", stem: "Which is the largest organ of the human body?", options: ["Liver", "Brain", "Skin", "Heart"], correct: "Skin", explanation: "The skin is the largest organ by surface area and weight." },
  { topic: "Economy", difficulty: "MEDIUM", stem: "What does GST stand for?", options: ["General Sales Tax", "Goods and Services Tax", "Gross State Tax", "Government Service Tax"], correct: "Goods and Services Tax", explanation: "GST is the Goods and Services Tax introduced in India in 2017." },
  { topic: "Static GK", difficulty: "EASY", stem: "Which is the national bird of India?", options: ["Sparrow", "Peacock", "Eagle", "Parrot"], correct: "Peacock", explanation: "The Indian Peacock is the national bird of India." },
  { topic: "Static GK", difficulty: "MEDIUM", stem: "The headquarters of UNESCO is located in:", options: ["New York", "Geneva", "Paris", "Vienna"], correct: "Paris", explanation: "UNESCO is headquartered in Paris, France." },
  { topic: "Current Affairs", difficulty: "MEDIUM", stem: "The Indian space agency ISRO is headquartered in:", options: ["New Delhi", "Bengaluru", "Hyderabad", "Chennai"], correct: "Bengaluru", explanation: "ISRO's headquarters is in Bengaluru, Karnataka." },
];

const GS_POOL: CuratedQ[] = [
  { topic: "Indian Polity & Governance", difficulty: "HARD", stem: "The 'Doctrine of Basic Structure' was propounded in which case?", options: ["Golaknath case", "Kesavananda Bharati case", "Minerva Mills case", "Maneka Gandhi case"], correct: "Kesavananda Bharati case", explanation: "The basic structure doctrine emerged from the Kesavananda Bharati case (1973)." },
  { topic: "Economic & Social Development", difficulty: "HARD", stem: "Which body replaced the Planning Commission in India?", options: ["Finance Commission", "NITI Aayog", "RBI", "NABARD"], correct: "NITI Aayog", explanation: "NITI Aayog replaced the Planning Commission in 2015." },
  { topic: "Environmental Ecology", difficulty: "MEDIUM", stem: "The Montreal Protocol is associated with:", options: ["Climate change", "Ozone layer protection", "Biodiversity", "Wetlands"], correct: "Ozone layer protection", explanation: "The Montreal Protocol phases out ozone-depleting substances." },
  { topic: "History of India", difficulty: "MEDIUM", stem: "The Dandi March was associated with which movement?", options: ["Quit India", "Civil Disobedience", "Non-Cooperation", "Khilafat"], correct: "Civil Disobedience", explanation: "The 1930 Dandi Salt March launched the Civil Disobedience Movement." },
  { topic: "Indian & World Geography", difficulty: "HARD", stem: "The Palk Strait lies between India and:", options: ["Maldives", "Sri Lanka", "Myanmar", "Indonesia"], correct: "Sri Lanka", explanation: "The Palk Strait separates India's Tamil Nadu from Sri Lanka." },
  { topic: "General Science", difficulty: "MEDIUM", stem: "Which vitamin is produced when skin is exposed to sunlight?", options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"], correct: "Vitamin D", explanation: "Sunlight triggers Vitamin D synthesis in the skin." },
  { topic: "Current Events", difficulty: "MEDIUM", stem: "The 'G20' is primarily a forum for:", options: ["Military alliance", "International economic cooperation", "Space research", "Climate litigation"], correct: "International economic cooperation", explanation: "The G20 is an intergovernmental forum on the global economy." },
  { topic: "Indian Polity & Governance", difficulty: "MEDIUM", stem: "The Preamble to the Indian Constitution was amended by which amendment?", options: ["42nd Amendment", "44th Amendment", "1st Amendment", "73rd Amendment"], correct: "42nd Amendment", explanation: "The 42nd Amendment (1976) added 'Socialist', 'Secular' and 'Integrity' to the Preamble." },
  { topic: "Economic & Social Development", difficulty: "MEDIUM", stem: "The term 'repo rate' is associated with:", options: ["SEBI", "RBI", "NABARD", "SIDBI"], correct: "RBI", explanation: "The repo rate is the rate at which the RBI lends to commercial banks." },
  { topic: "Environmental Ecology", difficulty: "HARD", stem: "The Ramsar Convention is concerned with the conservation of:", options: ["Forests", "Wetlands", "Deserts", "Coral reefs"], correct: "Wetlands", explanation: "The Ramsar Convention (1971) protects wetlands of international importance." },
  { topic: "History of India", difficulty: "HARD", stem: "The Permanent Settlement of Bengal was introduced by:", options: ["Warren Hastings", "Lord Cornwallis", "Lord Wellesley", "Lord Dalhousie"], correct: "Lord Cornwallis", explanation: "Lord Cornwallis introduced the Permanent Settlement in 1793." },
  { topic: "Indian & World Geography", difficulty: "MEDIUM", stem: "Which line divides India and Pakistan?", options: ["McMahon Line", "Radcliffe Line", "Durand Line", "LoC"], correct: "Radcliffe Line", explanation: "The Radcliffe Line demarcates the India–Pakistan border." },
  { topic: "General Science", difficulty: "HARD", stem: "Which part of the human brain controls balance and coordination?", options: ["Cerebrum", "Cerebellum", "Medulla", "Hypothalamus"], correct: "Cerebellum", explanation: "The cerebellum controls balance, posture and coordination." },
  { topic: "Indian Polity & Governance", difficulty: "MEDIUM", stem: "Who appoints the Chief Election Commissioner of India?", options: ["Prime Minister", "President", "Parliament", "Supreme Court"], correct: "President", explanation: "The President of India appoints the Chief Election Commissioner." },
  { topic: "Current Events", difficulty: "MEDIUM", stem: "The Sustainable Development Goals (SDGs) consist of how many goals?", options: ["15", "17", "20", "8"], correct: "17", explanation: "The UN's 2030 Agenda comprises 17 Sustainable Development Goals." },
];

// Spelling questions: pick the correctly-spelt word among plausible misspellings.
// Factually safe and yields many unique items to enlarge the English bank.
const SPELLING_BANK: { correct: string; wrong: [string, string, string] }[] = [
  { correct: "Accommodate", wrong: ["Acommodate", "Accomodate", "Acomodate"] },
  { correct: "Definitely", wrong: ["Definately", "Definitly", "Defenitely"] },
  { correct: "Separate", wrong: ["Seperate", "Saperate", "Separete"] },
  { correct: "Necessary", wrong: ["Neccessary", "Necesary", "Neccesary"] },
  { correct: "Occurrence", wrong: ["Occurence", "Ocurrence", "Occurrance"] },
  { correct: "Embarrass", wrong: ["Embarass", "Embaras", "Embarras"] },
  { correct: "Maintenance", wrong: ["Maintainance", "Maintenence", "Maintanance"] },
  { correct: "Privilege", wrong: ["Priviledge", "Privelege", "Privilage"] },
  { correct: "Rhythm", wrong: ["Rythm", "Rhythim", "Rhytm"] },
  { correct: "Conscience", wrong: ["Concience", "Conscence", "Consience"] },
  { correct: "Possession", wrong: ["Posession", "Possesion", "Posesion"] },
  { correct: "Recommend", wrong: ["Recomend", "Reccommend", "Recommnd"] },
  { correct: "Government", wrong: ["Goverment", "Governmnt", "Govenment"] },
  { correct: "Liaison", wrong: ["Liason", "Liaisen", "Liasion"] },
  { correct: "Millennium", wrong: ["Millenium", "Milennium", "Millenniam"] },
  { correct: "Existence", wrong: ["Existance", "Existense", "Exsistence"] },
  { correct: "Perseverance", wrong: ["Perseverence", "Perserverance", "Perseveerance"] },
  { correct: "Hierarchy", wrong: ["Heirarchy", "Hierachy", "Heirachy"] },
  { correct: "Acknowledgment", wrong: ["Acknowlegment", "Aknowledgment", "Acknowlegdment"] },
  { correct: "Questionnaire", wrong: ["Questionaire", "Questionnair", "Questionairre"] },
];

function genSpellingPool(subject: string, optsCount: number): GeneratedQuestion[] {
  return [...SPELLING_BANK, ...SPELLING_EXTRA].map((w) => {
    // De-dup defensively so a typo in the source data can never render two
    // identical options for the same question.
    const opts = Array.from(new Set([w.correct, ...w.wrong])).slice(0, Math.max(4, optsCount));
    // deterministic shuffle
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return {
      subject,
      topic: "Spelling",
      difficulty: "EASY" as Difficulty,
      stem: "Choose the correctly spelt word.",
      options: opts,
      correctIndex: opts.indexOf(w.correct),
      explanation: `The correct spelling is '${w.correct}'.`,
    };
  });
}

function curatedToGenerated(pool: CuratedQ[], subject: string, optsCount: number): GeneratedQuestion[] {
  return pool.map((q) => {
    const options = q.options.slice(0, Math.max(optsCount, q.options.length));
    return {
      subject,
      topic: q.topic,
      difficulty: q.difficulty,
      stem: q.stem,
      options,
      correctIndex: options.indexOf(q.correct),
      explanation: q.explanation,
    };
  });
}

/**
 * Generate a pool of questions for a given subject. `count` controls how many
 * procedurally-generated items to add (curated items are always included once).
 */
export function generateQuestionPool(
  subject: string,
  count: number,
  optionsPerQuestion: number
): GeneratedQuestion[] {
  const out: GeneratedQuestion[] = [];

  switch (subject) {
    case "Quantitative Aptitude":
      for (let i = 0; i < count; i++) out.push(pick(QUANT_GENERATORS)(optionsPerQuestion));
      break;
    case "Reasoning":
      for (let i = 0; i < count; i++) out.push(pick(REASONING_GENERATORS)(optionsPerQuestion));
      break;
    case "English":
      out.push(...curatedToGenerated([...ENGLISH_POOL, ...ENGLISH_BANK], "English", optionsPerQuestion));
      out.push(...genSpellingPool("English", optionsPerQuestion));
      break;
    case "General Awareness":
      out.push(...curatedToGenerated([...GK_POOL, ...GK_BANK], "General Awareness", optionsPerQuestion));
      break;
    case "General Studies":
      out.push(
        ...curatedToGenerated(
          [...GS_POOL, ...GS_BANK, ...GK_POOL, ...GK_BANK],
          "General Studies",
          optionsPerQuestion
        )
      );
      break;
    case "Computer Knowledge":
      out.push(...curatedToGenerated(COMPUTER_BANK, "Computer Knowledge", optionsPerQuestion));
      break;
    default:
      for (let i = 0; i < count; i++) out.push(pick(QUANT_GENERATORS)(optionsPerQuestion));
  }

  return out;
}
