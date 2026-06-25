const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const sample = await p.question.findFirst({
    where: { subject: "Computer Knowledge" },
    select: { examCode: true, sectionCode: true, subject: true, topic: true, difficulty: true, source: true },
  });
  console.log("sample:", JSON.stringify(sample));
  const topics = await p.question.groupBy({
    by: ["topic"],
    where: { subject: "Computer Knowledge" },
    _count: { _all: true },
  });
  console.log("topics:", topics.map((t) => `${t.topic}(${t._count._all})`).join(", "));
  await p.$disconnect();
})();
