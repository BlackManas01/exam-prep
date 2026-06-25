const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Delete the factually-wrong AI question found in the Famous Personalities
// fact-check: the first Indian WOMAN to win a medal at the BWF World
// Championships was P.V. Sindhu (bronze, 2013), not Saina Nehwal (2015).
(async () => {
  const qs = await p.question.findMany({
    where: {
      stem: { contains: "medal at the World Badminton Championships" },
      options: { some: { isCorrect: true, text: "Saina Nehwal" } },
    },
    select: { id: true, examCode: true, sectionCode: true },
  });
  if (qs.length === 0) {
    console.log("No match found.");
  } else {
    const ids = qs.map((q) => q.id);
    await p.option.deleteMany({ where: { questionId: { in: ids } } });
    await p.question.deleteMany({ where: { id: { in: ids } } });
    console.log(`Deleted ${ids.length} wrong badminton question(s):`, qs.map((q) => `${q.examCode}/${q.sectionCode}`).join(", "));
  }
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
