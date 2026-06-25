const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Delete fabricated / broken AI questions found during fact-check, matching by
// distinctive stem text so every copy across all exams is removed.
const STEM_LIKE = [
  "same date as the 'International Day of Cooperatives'", // broken: no correct answer
  "young boy named 'Pappu'", // fabricated book description
];

(async () => {
  let totalDeleted = 0;
  for (const frag of STEM_LIKE) {
    const qs = await p.question.findMany({
      where: { stem: { contains: frag } },
      select: { id: true, examCode: true, sectionCode: true },
    });
    if (qs.length === 0) {
      console.log(`No match for: ${frag}`);
      continue;
    }
    const ids = qs.map((q) => q.id);
    await p.option.deleteMany({ where: { questionId: { in: ids } } });
    await p.question.deleteMany({ where: { id: { in: ids } } });
    totalDeleted += ids.length;
    console.log(`Deleted ${ids.length} copy(ies) of: ${frag}`);
  }
  console.log(`\nTotal deleted: ${totalDeleted}`);
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
