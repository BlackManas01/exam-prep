const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const pick = (a, n) => { a = a.slice(); const o = []; while (o.length < n && a.length) o.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]); return o; };
(async () => {
  for (const sec of ["quant", "reasoning", "english"]) {
    const rows = await p.question.findMany({
      where: { examCode: "ssc-cgl-tier1", sectionCode: sec, difficulty: { in: ["HARD", "EXPERT"] } },
      select: { stem: true, source: true, topic: true, options: { where: { isCorrect: true }, select: { text: true } } },
    });
    console.log(`\n===== ${sec} — random HARD/EXPERT sample (pool ${rows.length}) =====`);
    for (const r of pick(rows, 12)) {
      console.log(`[${r.source}/${r.topic}] ${r.stem.replace(/\s+/g, " ").slice(0, 130)}`);
      console.log(`    ans: ${r.options[0]?.text ?? "?"}`);
    }
  }
  await p.$disconnect();
})();
