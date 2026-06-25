// Fill ALL curated subjects (GK / GS / English) across every exam with
// previous-year-pattern questions via the free AI provider. Runs in the
// background — start it and ignore it. Stops gracefully if the free quota runs
// out (it resets daily, so just run it again tomorrow).
//
// Usage:
//   node scripts/ai-fill.mjs            (default target 120 per section)
//   node scripts/ai-fill.mjs 300        (target 300 per section)

const target = Number(process.argv[2]) || 120;
const base = process.env.BASE_URL || "http://localhost:3000";
const adminKey = process.env.ADMIN_KEY || "dev-admin";
const delayMs = Number(process.env.DELAY_MS) || 4200;
const perCall = Math.min(50, Number(process.env.COUNT) || 40);

const GA_TOPICS = ["History", "Geography", "Indian Polity", "Economy", "General Science", "Static GK", "Sports", "Awards"];
const GS_TOPICS = ["Indian Polity", "History of India", "Geography", "Economy", "Environment", "Science and Technology", "Current Affairs"];
const EN_TOPICS = ["Synonyms", "Antonyms", "Idioms", "One Word Substitution", "Spotting Errors", "Fill in the Blanks", "Sentence Improvement"];

const SECTIONS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "general-awareness", topics: GA_TOPICS },
  { examCode: "ssc-cgl-tier1", sectionCode: "english", topics: EN_TOPICS },
  { examCode: "ssc-chsl-tier1", sectionCode: "general-awareness", topics: GA_TOPICS },
  { examCode: "ssc-chsl-tier1", sectionCode: "english", topics: EN_TOPICS },
  { examCode: "ibps-po-prelims", sectionCode: "english", topics: EN_TOPICS },
  { examCode: "rrb-ntpc-cbt1", sectionCode: "general-awareness", topics: GA_TOPICS },
  { examCode: "upsc-prelims-gs1", sectionCode: "general-studies", topics: GS_TOPICS },
];

const difficulties = ["EASY", "MEDIUM", "HARD"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  let grandTotal = 0;
  for (const sec of SECTIONS) {
    console.log(`\n=== ${sec.examCode} / ${sec.sectionCode} (target ${target}) ===`);
    let total = 0;
    let i = 0;
    let consecutiveErrors = 0;
    while (total < target) {
      const topic = sec.topics[i % sec.topics.length];
      const difficulty = difficulties[i % difficulties.length];
      i++;
      try {
        const res = await fetch(`${base}/api/admin/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
          body: JSON.stringify({ examCode: sec.examCode, sectionCode: sec.sectionCode, topic, difficulty, count: perCall }),
        });
        const d = await res.json();
        if (!res.ok) {
          console.error(`  error: ${typeof d.error === "string" ? d.error.slice(0, 120) : JSON.stringify(d.error)}`);
          if (++consecutiveErrors >= 4) {
            console.error("  Quota likely exhausted — stopping this section.");
            break;
          }
          await sleep(delayMs);
          continue;
        }
        consecutiveErrors = 0;
        total += d.inserted;
        grandTotal += d.inserted;
        console.log(`  +${d.inserted} (section ${total}/${target}, overall ${grandTotal}) [${difficulty} · ${topic}]`);
      } catch (e) {
        console.error(`  failed: ${e.message}`);
        if (++consecutiveErrors >= 4) break;
      }
      if (total < target) await sleep(delayMs);
    }
  }
  console.log(`\nAll done. Inserted ${grandTotal} questions across all subjects.`);
})();
