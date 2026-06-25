const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const r = await p.currentAffair.deleteMany({});
  console.log("Deleted sample current-affairs:", r.count);
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
