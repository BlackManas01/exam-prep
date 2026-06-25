// Tests the report flow against the running dev server + Neon.
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const q = await p.question.findFirst({ select: { id: true, stem: true } });
  console.log("Testing report on question:", q.id, "—", q.stem.slice(0, 50));
  const rep = await fetch(`http://localhost:3000/api/questions/${q.id}/flag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "Test report — answer looks wrong" }),
  });
  console.log("Report API:", rep.status, await rep.text());
  const admin = await fetch("http://localhost:3000/api/admin/flags", {
    headers: { "x-admin-key": "dev-admin" },
  });
  const aj = await admin.json();
  console.log("Admin flags count:", (aj.flags || []).length);
  // cleanup the test flag
  await p.questionFlag.deleteMany({ where: { questionId: q.id } });
  console.log("Cleaned up test flag.");
  await p.$disconnect();
})();
