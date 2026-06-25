import { generateQuestionPool, resetSeed } from "../src/lib/generators";

// Generate a large pool, validate structure, and print samples per topic so the
// math can be eyeballed. Structural checks catch duplicate options / bad indices.
resetSeed(2024);

function audit(subject: string, n: number, opts: number) {
  const pool = generateQuestionPool(subject, n, opts);
  const byTopic = new Map<string, typeof pool>();
  let structErrors = 0;
  for (const q of pool) {
    // structural validation
    const distinct = new Set(q.options).size === q.options.length;
    const idxOk = q.correctIndex >= 0 && q.correctIndex < q.options.length;
    const enough = q.options.length >= 4;
    if (!distinct || !idxOk || !enough) {
      structErrors++;
      if (structErrors <= 5)
        console.log(`  ✗ STRUCT [${q.topic}] distinct=${distinct} idxOk=${idxOk} opts=${q.options.length} :: ${q.stem.slice(0, 60)}`);
    }
    if (!byTopic.has(q.topic)) byTopic.set(q.topic, []);
    byTopic.get(q.topic)!.push(q);
  }
  console.log(`\n=== ${subject}: ${pool.length} generated, ${structErrors} structural errors ===`);
  for (const [topic, qs] of byTopic) {
    const s = qs[0];
    console.log(`\n[${topic}] (${qs.length})`);
    for (const q of qs.slice(0, 2)) {
      console.log(`  Q: ${q.stem.replace(/\n/g, " ")}`);
      console.log(`     Options: ${q.options.join(" | ")}`);
      console.log(`     ✓ Answer: ${q.options[q.correctIndex]}`);
    }
    void s;
  }
}

audit("Quantitative Aptitude", 1200, 4);
audit("Reasoning", 1200, 4);
