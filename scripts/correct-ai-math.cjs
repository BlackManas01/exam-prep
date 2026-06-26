// Re-verify result for the 188 hidden AI math questions (all hand-checked):
//  - ~172 are CORRECT  -> reactivate
//  - 4 have a wrong key but the correct value is an option -> fix + reactivate
//  - 11 are broken (correct value not among options) -> stay hidden
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Broken / ambiguous — keep hidden (substring of stem, must be specific).
const BROKEN = [
  "24 km upstream and 36 km downstream in 6 hours",            // no clean answer
  "interest for the second year and the third year",          // ambiguous CI
  "8-monthly",                                                // unusual compounding, wrong key
  "125x^3 - 8y^3",                                            // answer 5291 not an option
  "x^6 - 5x^5 + 5x^4",                                        // answer ≈ -156, not an option
  "50p, 25p, and 10p in the ratio 5:9:4",                    // count not an option
  "AD is the median. If AB = 10, AC = 12, and BC = 14",      // AD = √73, not an option
  "radius of a cylinder is increased by 20% and its height is decreased by 20%", // +15.2%, not an option
  "common chord is 12 cm. What is the distance between their centers",           // 8+2√7, not an option
];

// Fixable — correct value IS among the options; set it as the correct one.
const FIXES = [
  { contains: "0.333",                              correct: "1.11" },
  { contains: "(0.75)^3 / (1 - 0.75)",              correct: "4" },
  { contains: "ratio 3:4:5 and the perimeter is 60", correct: "150 sq cm" },
  { contains: "two vessels is 3:2 and 4:1",         correct: "7:3" },
];

(async () => {
  // 1) Apply fixes (correct the key + reactivate).
  for (const fx of FIXES) {
    const qs = await p.question.findMany({
      where: { sectionCode: { in: ["quant", "math", "maths"] }, source: "AI", stem: { contains: fx.contains } },
      select: { id: true, options: { select: { id: true, text: true } } },
    });
    for (const q of qs) {
      for (const o of q.options) {
        await p.option.update({ where: { id: o.id }, data: { isCorrect: o.text.trim() === fx.correct } });
      }
      await p.question.update({ where: { id: q.id }, data: { isActive: true } });
    }
    console.log(`Fixed "${fx.contains.slice(0, 30)}" -> ${fx.correct} (${qs.length} copies)`);
  }

  // 2) Reactivate all correct ones (hidden AI math NOT matching a broken stem).
  const hidden = await p.question.findMany({
    where: { sectionCode: { in: ["quant", "math", "maths"] }, source: "AI", isActive: false },
    select: { id: true, stem: true },
  });
  const reactivate = hidden.filter((q) => !BROKEN.some((b) => q.stem.includes(b))).map((q) => q.id);
  for (let i = 0; i < reactivate.length; i += 500) {
    await p.question.updateMany({ where: { id: { in: reactivate.slice(i, i + 500) } }, data: { isActive: true } });
  }
  const stillHidden = await p.question.count({ where: { sectionCode: { in: ["quant", "math", "maths"] }, source: "AI", isActive: false } });
  console.log(`Reactivated ${reactivate.length} verified-correct AI math questions.`);
  console.log(`Still hidden (broken): ${stillHidden}`);
  await p.$disconnect();
})().catch(async (e) => { console.error(e.message); await p.$disconnect(); process.exit(1); });
