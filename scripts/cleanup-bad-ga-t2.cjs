// Removes the mis-generated AI questions from CGL T2 general-awareness (they were
// English content placed in the GK section).
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const where = {
    examCode: "ssc-cgl-tier2",
    sectionCode: "general-awareness",
    source: "AI",
  };
  const n = await p.question.count({ where });
  await p.question.deleteMany({ where });
  console.log(`Deleted ${n} mis-generated AI questions from CGL T2 general-awareness.`);
  await p.$disconnect();
})();
