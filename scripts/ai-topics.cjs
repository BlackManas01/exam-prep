const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const rows = await p.$queryRawUnsafe(
    `SELECT topic, COUNT(*) AS c
       FROM Question
       WHERE source='AI' AND sectionCode='general-awareness'
       GROUP BY topic ORDER BY c DESC`
  );
  console.log("AI General-Awareness questions by topic:");
  for (const r of rows) console.log(`  ${Number(r.c).toString().padStart(5)}  ${r.topic}`);
  const total = rows.reduce((a, r) => a + Number(r.c), 0);
  console.log(`  ----- total AI GA: ${total}`);
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
