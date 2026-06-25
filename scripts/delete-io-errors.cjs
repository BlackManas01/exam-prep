const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Remove the two issues found in the International Organizations fact-check:
//  1. BRICS "which is NOT a member -> Indonesia": outdated, Indonesia joined
//     BRICS in Jan 2025, so the question now has no correct answer.
//  2. ICJ "which statement is correct": two options are actually both true
//     (defective MCQ).
async function deleteWhere(where, label) {
  const qs = await p.question.findMany({ where, select: { id: true } });
  if (qs.length === 0) {
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
  n += await deleteWhere(
    {
      stem: { contains: "member of the BRICS" },
      options: { some: { isCorrect: true, text: { contains: "Indonesia" } } },
    },
    "BRICS outdated (Indonesia now a member)"
  );
  n += await deleteWhere(
    { stem: { contains: "statements regarding the International Court of Justice" } },
    "ICJ ambiguous (two correct options)"
  );
  console.log(`\nTotal deleted: ${n}`);
  await p.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
