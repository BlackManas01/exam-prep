const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Patterns that are objectively BELOW ssc-cgl level (single-step / fake-DI)
const TRIVIAL = [
  /table below shows/i,                 // fake DI = sum 4 numbers
  /how many litres of (milk|water) does it contain/i, // 1-step ratio split
  /what is the average speed/i,         // bare avg speed (when single line)
  /how many numbers between .* are divisible/i,
];

(async () => {
  const rows = await p.question.findMany({
    where: { sectionCode: { in: ["quant","math","maths"] }, difficulty: "MEDIUM", source: "SEED" },
    select: { id: true, stem: true, topic: true },
  });
  let trivial = 0; const topicCount = {};
  const sample = [];
  for (const r of rows) {
    const hit = TRIVIAL.some((re) => re.test(r.stem));
    if (hit) {
      trivial++;
      topicCount[r.topic] = (topicCount[r.topic]||0)+1;
      if (sample.length < 8) sample.push(`[${r.topic}] ${r.stem.slice(0,90)}`);
    }
  }
  console.log("SEED MEDIUM total:", rows.length);
  console.log("Matched trivial:", trivial);
  console.log("By topic:", topicCount);
  console.log("\nSamples:"); sample.forEach(s=>console.log(" ", s));
  await p.$disconnect();
})();
