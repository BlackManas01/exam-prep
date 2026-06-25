const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const attemptId = process.argv[2];
(async () => {
  const items = await p.attemptItem.findMany({ where: { attemptId }, select: { questionId: true } });
  const qs = await p.question.findMany({ where: { id: { in: items.map((i) => i.questionId) } }, select: { topic: true } });
  const counts = {};
  for (const q of qs) counts[q.topic] = (counts[q.topic] || 0) + 1;
  console.log(`Attempt ${attemptId} — ${qs.length} questions across ${Object.keys(counts).length} topics:`);
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`  ${c}  ${t}`));
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
