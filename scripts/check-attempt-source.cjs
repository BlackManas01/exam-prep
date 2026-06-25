const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const attemptId = process.argv[2];

(async () => {
  const items = await p.attemptItem.findMany({ where: { attemptId }, select: { questionId: true } });
  const ids = items.map((i) => i.questionId);
  const qs = await p.question.findMany({ where: { id: { in: ids } }, select: { source: true } });
  const counts = {};
  for (const q of qs) counts[q.source] = (counts[q.source] || 0) + 1;
  console.log(`Attempt ${attemptId}: ${ids.length} questions`);
  console.log("By source:", counts);
  const ai = qs.filter((q) => q.source === "AI").length;
  console.log(ai === 0 ? "✓ PASS — 0 AI questions (all verified)" : `✗ FAIL — ${ai} AI questions leaked`);
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
