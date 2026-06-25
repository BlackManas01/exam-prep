const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Remove the factually-wrong AI question: "Ganga of the South" is the Godavari
// (Dakshina Ganga), but this item was marked Cauvery. Delete every copy that
// has Cauvery marked correct for that stem (keep any correct Godavari version).
(async () => {
  const bad = await p.question.findMany({
    where: {
      stem: { contains: "Ganga of the South" },
      options: { some: { isCorrect: true, text: "Cauvery" } },
    },
    select: { id: true, examCode: true, sectionCode: true },
  });
  if (bad.length === 0) {
    console.log("No wrong 'Ganga of the South' questions found.");
  } else {
    const ids = bad.map((b) => b.id);
    await p.option.deleteMany({ where: { questionId: { in: ids } } });
    await p.question.deleteMany({ where: { id: { in: ids } } });
    console.log(`Deleted ${ids.length} wrong question(s):`, bad.map((b) => `${b.examCode}/${b.sectionCode}`).join(", "));
  }
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
