// Bulk AI question generator — loops the /api/admin/generate endpoint to build
// up the bank for a section. Works with the free Gemini/Groq providers.
//
// Usage (dev server must be running):
//   node scripts/ai-bulk.mjs <examCode> <sectionCode> <target>
// Examples:
//   node scripts/ai-bulk.mjs upsc-prelims-gs1 general-studies 300
//   node scripts/ai-bulk.mjs ssc-cgl-tier1 general-awareness 300
//   node scripts/ai-bulk.mjs ssc-cgl-tier1 english 300
//
// Env: BASE_URL (default http://localhost:3000), ADMIN_KEY (default dev-admin),
//      DELAY_MS (default 4500 — keeps under free-tier rate limits),
//      TOPICS (comma-separated, optional).

const [examCode = "upsc-prelims-gs1", sectionCode = "general-studies", targetArg = "200"] =
  process.argv.slice(2);
const target = Number(targetArg) || 200;
const base = process.env.BASE_URL || "http://localhost:3000";
const adminKey = process.env.ADMIN_KEY || "dev-admin";
const delayMs = Number(process.env.DELAY_MS) || 4200;
const perCall = Math.min(50, Number(process.env.COUNT) || 40);
const topics = process.env.TOPICS ? process.env.TOPICS.split(",").map((t) => t.trim()) : [""];
const difficulties = ["EASY", "MEDIUM", "HARD"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log(`Bulk generating for ${examCode}/${sectionCode}, target ${target}...`);
  let total = 0;
  let i = 0;
  let consecutiveErrors = 0;
  while (total < target) {
    const topic = topics[i % topics.length] || undefined;
    const difficulty = difficulties[i % difficulties.length];
    i++;
    try {
      const res = await fetch(`${base}/api/admin/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ examCode, sectionCode, topic, difficulty, count: perCall }),
      });
      const d = await res.json();
      if (!res.ok) {
        console.error(`  batch ${i} error: ${typeof d.error === "string" ? d.error : JSON.stringify(d.error)}`);
        if (++consecutiveErrors >= 3) {
          console.error("Too many errors — stopping.");
          break;
        }
        await sleep(delayMs);
        continue;
      }
      consecutiveErrors = 0;
      total += d.inserted;
      console.log(
        `  batch ${i}: +${d.inserted} new (total ${total}/${target}) [${difficulty}${topic ? " · " + topic : ""}]`
      );
    } catch (e) {
      console.error(`  batch ${i} failed: ${e.message}`);
      if (++consecutiveErrors >= 3) break;
    }
    if (total < target) await sleep(delayMs);
  }
  console.log(`Done. Inserted ${total} new questions (pending review in /admin).`);
})();
