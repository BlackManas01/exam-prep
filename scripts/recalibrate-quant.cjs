const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const APPLY = process.argv.includes("--apply");

// fake-DI = "table below shows ... P=, Q=, R=, S=" → just summing/subtracting 4 numbers. DELETE.
const FAKE_DI = /table below shows/i;

(async () => {
  const sec = { in: ["quant", "math", "maths"] };

  // 1) delete fake-DI at any difficulty/source
  const fakeIds = (await p.question.findMany({
    where: { sectionCode: sec, stem: { contains: "table below shows" } },
    select: { id: true },
  })).map(r => r.id);
  console.log("fake-DI to delete:", fakeIds.length);

  // 2) all remaining SEED MEDIUM quant are single-step → demote to EASY
  const demoteCount = await p.question.count({
    where: { sectionCode: sec, difficulty: "MEDIUM", source: "SEED", NOT: { stem: { contains: "table below shows" } } },
  });
  console.log("SEED MEDIUM single-step to demote -> EASY:", demoteCount);

  if (!APPLY) { console.log("\nDRY RUN. add --apply to execute."); await p.$disconnect(); return; }

  if (fakeIds.length) {
    // delete options first then questions, chunked
    for (let i = 0; i < fakeIds.length; i += 1000) {
      const chunk = fakeIds.slice(i, i + 1000);
      await p.option.deleteMany({ where: { questionId: { in: chunk } } });
      await p.question.deleteMany({ where: { id: { in: chunk } } });
    }
    console.log("deleted fake-DI:", fakeIds.length);
  }

  const dem = await p.question.updateMany({
    where: { sectionCode: sec, difficulty: "MEDIUM", source: "SEED", NOT: { stem: { contains: "table below shows" } } },
    data: { difficulty: "EASY" },
  });
  console.log("demoted to EASY:", dem.count);

  const byDiff = await p.question.groupBy({ by: ["difficulty"], where: { sectionCode: sec }, _count: true });
  console.log("\nNew quant distribution:");
  for (const d of byDiff) console.log(" ", d.difficulty, d._count);
  await p.$disconnect();
})();
