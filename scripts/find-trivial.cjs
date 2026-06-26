const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const sec = { in: ["quant","math","maths","reasoning","general-intelligence"] };
  // find the 3 reported + similar
  const probes = [
    "value of a + b + c",
    "unit (ones) digit",
    "divisible by both",
    "how many numbers between",
  ];
  for (const t of probes) {
    const rows = await p.question.findMany({ where: { sectionCode: sec, stem: { contains: t } }, select: { difficulty:true, source:true, stem:true }, take: 5 });
    const cnt = await p.question.count({ where: { sectionCode: sec, stem: { contains: t } } });
    console.log(`\n"${t}" -> ${cnt} total`);
    rows.forEach(r=>console.log(`   [${r.difficulty}/${r.source}] ${r.stem.slice(0,80)}`));
  }
  // EASY counts
  const easyQ = await p.question.count({ where: { sectionCode: { in:["quant","math","maths"] }, difficulty:"EASY" } });
  const easyR = await p.question.count({ where: { sectionCode: { in:["reasoning","general-intelligence"] }, difficulty:"EASY" } });
  console.log("\nEASY quant:", easyQ, " EASY reasoning:", easyR);
  await p.$disconnect();
})();
