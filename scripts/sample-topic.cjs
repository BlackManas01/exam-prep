const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const topic = process.argv[2] || "Important Days";
const take = Number(process.argv[3]) || 50;

(async () => {
  const qs = await p.question.findMany({
    where: { source: "AI", sectionCode: "general-awareness", topic },
    include: { options: { orderBy: { displayOrder: "asc" } } },
    take,
    orderBy: { createdAt: "desc" },
  });
  qs.forEach((q, i) => {
    const correct = q.options.find((o) => o.isCorrect);
    console.log(`${i + 1}. [${q.id}] ${q.stem}`);
    console.log(`   Opt: ${q.options.map((o) => o.text).join(" | ")}`);
    console.log(`   ANS: ${correct ? correct.text : "??"}`);
  });
  console.log(`\nTopic "${topic}" sampled: ${qs.length}`);
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
