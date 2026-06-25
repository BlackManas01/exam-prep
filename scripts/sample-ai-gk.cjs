const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const qs = await p.question.findMany({
    where: { source: "AI", sectionCode: "general-awareness", examCode: "ssc-cgl-tier1" },
    include: { options: { orderBy: { displayOrder: "asc" } } },
    take: 70,
    orderBy: { createdAt: "desc" },
  });
  qs.forEach((q, i) => {
    const correct = q.options.find((o) => o.isCorrect);
    console.log(`${i + 1}. [${q.id}] ${q.stem}`);
    console.log(`   Options: ${q.options.map((o) => o.text).join(" | ")}`);
    console.log(`   ANSWER: ${correct ? correct.text : "??"}`);
  });
  console.log(`\nTotal sampled: ${qs.length}`);
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
