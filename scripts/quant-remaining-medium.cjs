const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const TRIVIAL = [
  /table below shows/i,
  /how many litres of (milk|water) does it contain/i,
  /what is the average speed/i,
  /how many numbers between .* are divisible/i,
];
(async () => {
  const rows = await p.question.findMany({
    where: { sectionCode: { in: ["quant","math","maths"] }, difficulty: "MEDIUM", source: "SEED" },
    select: { stem: true, topic: true },
  });
  const remaining = rows.filter(r => !TRIVIAL.some(re=>re.test(r.stem)));
  // group by topic
  const byTopic = {};
  for (const r of remaining) byTopic[r.topic] = (byTopic[r.topic]||0)+1;
  console.log("Non-trivial SEED MEDIUM:", remaining.length);
  console.log("By topic:", byTopic);
  console.log("\nSamples per topic:");
  const seen = {};
  for (const r of remaining) {
    if ((seen[r.topic]||0) >= 3) continue;
    seen[r.topic] = (seen[r.topic]||0)+1;
    console.log(`[${r.topic}] ${r.stem.slice(0,120)}`);
  }
  await p.$disconnect();
})();
