const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const rows = await p.$queryRawUnsafe(
    `SELECT q.id, q.examCode, q.sectionCode, q.source, q.stem
       FROM Question q
       JOIN (SELECT questionId, text FROM "Option" GROUP BY questionId, text HAVING COUNT(*) > 1) d
         ON d.questionId = q.id
       GROUP BY q.id`
  );
  for (const r of rows) {
    const opts = await p.option.findMany({ where: { questionId: r.id }, orderBy: { displayOrder: "asc" } });
    console.log(`\n${r.examCode}/${r.sectionCode} [${r.source}]`);
    console.log(`Q: ${r.stem}`);
    console.log("Options:", opts.map((o) => `${o.text}${o.isCorrect ? "*" : ""}`).join(" | "));
  }
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
