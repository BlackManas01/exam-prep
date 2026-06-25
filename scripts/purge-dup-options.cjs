const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  // Delete any question that has a duplicate option text — these are defective
  // (and, as seen with the Akbarnama item, often factually wrong AI output).
  const rows = await p.$queryRawUnsafe(
    `SELECT DISTINCT questionId FROM "Option" o
       WHERE EXISTS (
         SELECT 1 FROM "Option" o2
         WHERE o2.questionId = o.questionId AND o2.text = o.text AND o2.id <> o.id
       )`
  );
  const ids = rows.map((r) => r.questionId);
  if (ids.length === 0) {
    console.log("No defective questions found.");
  } else {
    await p.option.deleteMany({ where: { questionId: { in: ids } } });
    await p.question.deleteMany({ where: { id: { in: ids } } });
    console.log(`Deleted ${ids.length} defective question(s) with duplicate options.`);
  }
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
