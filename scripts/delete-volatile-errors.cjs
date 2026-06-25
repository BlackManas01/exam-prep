const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Round-3 volatile-topic deletions:
//  - PRAYAG: fabricated-looking "consider statements" item with an invented acronym.
//  - Shami Khel Ratna 2023: WRONG — Mohammed Shami received the Arjuna Award, not
//    the Khel Ratna (2023 Khel Ratna went to Satwiksairaj Rankireddy & Chirag Shetty).
async function del(where, label) {
  const qs = await p.question.findMany({ where, select: { id: true } });
  if (!qs.length) {
    console.log(`No match: ${label}`);
    return 0;
  }
  const ids = qs.map((q) => q.id);
  await p.option.deleteMany({ where: { questionId: { in: ids } } });
  await p.question.deleteMany({ where: { id: { in: ids } } });
  console.log(`Deleted ${ids.length}: ${label}`);
  return ids.length;
}

(async () => {
  let n = 0;
  n += await del({ stem: { contains: "PRAYAG' platform launched by the Ministry of Ports" } }, "PRAYAG fabricated");
  n += await del(
    {
      stem: { contains: "Khel Ratna" },
      options: { some: { isCorrect: true, text: "Mohammed Shami" } },
    },
    "Shami Khel Ratna (wrong - was Arjuna)"
  );
  console.log(`\nTotal deleted: ${n}`);
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
