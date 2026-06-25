// Smart, resumable bulk generator. For each topic it generates ALL THREE
// difficulty levels (Easy → Medium → Hard) before moving on, so every topic
// gets depth. Topics are weighted by exam importance (high-weight topics appear
// more often). Handles free-tier rate limits (429) with exponential backoff and
// is fully resumable (dedups against the existing bank, so just re-run to add
// more).
//
// Usage (dev server must be running and pointed at the target DB):
//   node scripts/ai-grow.mjs <examCode> <sectionCode> <targetNewQuestions>
// Examples:
//   node scripts/ai-grow.mjs ssc-cgl-tier2 general-awareness 10000
//   node scripts/ai-grow.mjs ssc-cgl-tier2 english 10000
//
// Env: BASE_URL (default http://localhost:3000), ADMIN_KEY (default dev-admin),
//      COUNT (per call, default 40), TOPICS (override, "topic:weight,..." or "topic,...")

const [examCode, sectionCode, targetArg = "10000"] = process.argv.slice(2);
if (!examCode || !sectionCode) {
  console.error("Usage: node scripts/ai-grow.mjs <examCode> <sectionCode> <target>");
  process.exit(1);
}
const target = Number(targetArg) || 10000;
const base = process.env.BASE_URL || "http://localhost:3000";
const adminKey = process.env.ADMIN_KEY || "dev-admin";
const perCall = Math.min(50, Number(process.env.COUNT) || 40);
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

// Importance-weighted, granular topic lists (higher weight = more questions).
// Granular sub-topics also maximise unique questions at large scale.
const TOPIC_WEIGHTS = {
  "general-awareness": {
    "Ancient Indian History": 3, "Medieval Indian History": 3,
    "Modern Indian History & Freedom Struggle": 5, "Indian National Movement": 4,
    "Indian Constitution & Polity": 5, "Fundamental Rights & Duties": 4,
    "Parliament & Judiciary": 4, "Constitutional Bodies": 3, "Panchayati Raj": 2,
    "Physical Geography of India": 4, "Indian Rivers & Mountains": 4,
    "Indian Climate & Soils": 3, "Agriculture & Minerals": 3, "World Geography": 3,
    "Physics": 4, "Chemistry": 4, "Biology": 4, "Human Body & Diseases": 3,
    "Inventions & Discoveries": 3, "Indian Economy": 4, "Banking & Finance": 3,
    "Budget & Taxation": 2, "Five Year Plans": 2, "National Parks & Wildlife": 2,
    "Awards & Honours": 2, "Books & Authors": 2, "Important Days": 2,
    "Dances & Festivals of India": 2, "First in India & Superlatives": 2,
    "Static GK": 3, "Sports GK": 2, "Current Affairs": 3,
  },
  english: {
    Synonyms: 5, Antonyms: 5, "One Word Substitution": 5, "Idioms and Phrases": 5,
    "Spelling Correction": 3, "Error Spotting": 4, "Sentence Improvement": 4,
    "Fill in the Blanks": 4, "Cloze Test": 3, "Active and Passive Voice": 3,
    "Direct and Indirect Speech": 3, "Phrasal Verbs": 3, "Homophones": 2,
    "Sentence Rearrangement": 3, "Reading Comprehension": 2,
  },
  computer: {
    "Computer Fundamentals": 4, "Generations of Computers": 2, "Input Devices": 2,
    "Output Devices": 2, "Memory and Storage": 4, "CPU and Processing": 3,
    "Operating Systems": 3, "MS Word": 3, "MS Excel": 3, "MS PowerPoint": 2,
    "Internet and WWW": 4, "Email": 2, "Computer Networking": 3,
    "Computer Security & Viruses": 3, "Database Basics": 2, "Programming Languages": 2,
    "Abbreviations and Full Forms": 3, "Shortcut Keys": 3, "Number Systems": 2,
  },
  "general-studies": {
    "Modern Indian History": 5, "Indian Polity & Governance": 5,
    "Indian & World Geography": 4, "Indian Economy": 4, "General Science": 4,
    "Environment & Ecology": 4, "Science & Technology": 3, "Current Affairs": 4,
    "Art & Culture": 3, "International Relations": 2,
  },
};

function buildTopicQueue() {
  const fromEnv = process.env.TOPICS;
  let entries;
  if (fromEnv) {
    entries = fromEnv.split(",").map((t) => {
      const [name, w] = t.split(":");
      return [name.trim(), Number(w) || 1];
    });
  } else {
    const map = TOPIC_WEIGHTS[sectionCode];
    entries = map ? Object.entries(map) : [["", 1]];
  }
  // Expand by weight so important topics recur more often.
  const queue = [];
  for (const [name, w] of entries) for (let i = 0; i < w; i++) queue.push(name);
  return queue;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function genOnce(topic, difficulty) {
  const res = await fetch(`${base}/api/admin/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
    body: JSON.stringify({ examCode, sectionCode, topic: topic || undefined, difficulty, count: perCall }),
  });
  const text = await res.text();
  let d = {};
  try { d = JSON.parse(text); } catch { /* keep raw */ }
  return { status: res.status, ok: res.ok, inserted: d.inserted ?? 0, error: d.error, raw: text };
}

(async () => {
  const queue = buildTopicQueue();
  console.log(
    `Growing ${examCode}/${sectionCode} → +${target} new questions, ` +
      `${new Set(queue).size} weighted topics × 3 levels. (Resumable; Ctrl+C to stop.)`
  );

  let total = 0;
  let qi = 0;
  let backoff = 4000; // adaptive delay; grows on 429
  let consec429 = 0;

  while (total < target) {
    const topic = queue[qi % queue.length];
    qi++;
    // Same topic, all three levels in sequence.
    for (const difficulty of DIFFICULTIES) {
      if (total >= target) break;
      let attempts = 0;
      while (true) {
        const r = await genOnce(topic, difficulty);
        if (r.ok) {
          total += r.inserted;
          consec429 = 0;
          backoff = Math.max(4000, Math.floor(backoff * 0.9));
          console.log(`  +${r.inserted}  (total ${total}/${target})  [${topic} · ${difficulty}]`);
          await sleep(backoff);
          break;
        }
        if (r.status === 429) {
          consec429++;
          const wait = Math.min(120000, 8000 * 2 ** Math.min(consec429, 4));
          console.log(`  ⏳ rate-limited (429) — waiting ${Math.round(wait / 1000)}s …`);
          await sleep(wait);
          if (consec429 >= 8) {
            console.log("Daily quota looks exhausted. Stopping — re-run later to continue.");
            console.log(`Inserted ${total} new questions this run.`);
            return;
          }
          continue; // retry same topic+difficulty
        }
        // Other (transient) error: small retry, then skip.
        if (++attempts >= 2) {
          console.log(`  ⚠ skip [${topic} · ${difficulty}]: ${typeof r.error === "string" ? r.error : r.status}`);
          await sleep(backoff);
          break;
        }
        await sleep(backoff);
      }
    }
  }
  console.log(`\nDone. Inserted ${total} new questions for ${examCode}/${sectionCode}.`);
})();
