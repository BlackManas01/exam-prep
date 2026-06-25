const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const r = await p.user.deleteMany({ where: { email: { in: ["asha@test.com", "bina@test.com", "reviewer@test.com"] } } });
  console.log("Deleted test users:", r.count);
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
