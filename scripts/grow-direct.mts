// Standalone, server-less question grower used by CI (GitHub Actions) and CLI.
// Calls generateAndStore() directly (no HTTP server), so it runs anywhere with
// DATABASE_URL + an AI key set. Topic-deep (3 levels per topic) and weighted by
// importance, with provider fallback + rate-limit backoff. Fully resumable.
//
// Single section:
//   npx tsx scripts/grow-direct.mts <examCode> <sectionCode> <target>
// Priority plan (used by CI) — comma list of "exam:section:cap", processed in
// order, stopping globally once the AI quota is exhausted:
//   PLAN="ssc-cgl-tier2:general-awareness:10000,ssc-cgl-tier2:english:10000" \
//     npx tsx scripts/grow-direct.mts
import { generateAndStore } from "../src/lib/ai/generateQuestions";
import { EXAM_BLUEPRINTS } from "../src/lib/examConfig";

const perCall = Math.min(50, Number(process.env.COUNT) || 40);
// Brutal-tier only: every section now generates EXPERT questions to fill the
// Real Exam pool (which serves 100% EXPERT). Override with DIFFS env if needed.
function difficultiesFor(_sectionCode: string): readonly string[] {
  const env = process.env.DIFFS;
  if (env) return env.split(",").map((d) => d.trim().toUpperCase());
  return ["EXPERT"];
}

const TOPIC_WEIGHTS: Record<string, Record<string, number>> = {
  "general-awareness": {
    "Ancient Indian History": 3, "Medieval Indian History": 3,
    "Modern Indian History & Freedom Struggle": 5, "Indian National Movement": 4,
    "Indian Constitution & Polity": 5, "Fundamental Rights & Duties": 4,
    "Parliament & Judiciary": 4, "Constitutional Bodies": 3, "Panchayati Raj": 2,
    "Physical Geography of India": 4, "Indian Rivers & Mountains": 4,
    "Indian Climate & Soils": 3, "Agriculture & Minerals": 3, "World Geography": 3,
    Physics: 4, Chemistry: 4, Biology: 4, "Human Body & Diseases": 3,
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
    "Direct and Indirect Speech": 3, "Phrasal Verbs": 3, Homophones: 2,
    "Sentence Rearrangement": 3, "Reading Comprehension": 2,
  },
  computer: {
    "Computer Fundamentals": 4, "Generations of Computers": 2, "Input Devices": 2,
    "Output Devices": 2, "Memory and Storage": 4, "CPU and Processing": 3,
    "Operating Systems": 3, "MS Word": 3, "MS Excel": 3, "MS PowerPoint": 2,
    "Internet and WWW": 4, Email: 2, "Computer Networking": 3,
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function topicQueue(sectionCode: string): string[] {
  const env = process.env.TOPICS;
  const entries: [string, number][] = env
    ? env.split(",").map((t) => {
        const [n, w] = t.split(":");
        return [n.trim(), Number(w) || 1];
      })
    : Object.entries(TOPIC_WEIGHTS[sectionCode] ?? { "": 1 });
  const q: string[] = [];
  for (const [n, w] of entries) for (let i = 0; i < w; i++) q.push(n);
  return q;
}

// Grows one section toward `target`. Returns true if the AI quota looks
// exhausted (so the caller can stop the whole plan).
async function growSection(examCode: string, sectionCode: string, target: number): Promise<boolean> {
  const exam = EXAM_BLUEPRINTS.find((e) => e.code === examCode);
  const section = exam?.sections.find((s) => s.code === sectionCode);
  if (!exam || !section) {
    console.error(`Unknown exam/section: ${examCode}/${sectionCode} — skipping`);
    return false;
  }
  const queue = topicQueue(sectionCode);
  console.log(
    `\n▶ ${examCode}/${sectionCode} → +${target}, ${new Set(queue).size} weighted topics × 3 levels.`
  );

  let total = 0;
  let qi = 0;
  let backoff = 3500;
  let consecFail = 0;
  let consecEmpty = 0;

  const difficulties = difficultiesFor(sectionCode);

  while (total < target) {
    const topic = queue[qi % queue.length] || undefined;
    qi++;
    for (const difficulty of difficulties) {
      if (total >= target) break;
      try {
        const r = await generateAndStore({
          examCode,
          examName: exam.name,
          sectionCode,
          sectionName: section.name,
          subject: section.subject,
          topic,
          difficulty,
          count: perCall,
          optionsPerQuestion: exam.optionsPerQuestion,
          activate: true,
        });
        total += r.inserted;
        consecFail = 0;
        // Track "all duplicates" batches so we don't loop forever once a
        // section's unique pool is effectively exhausted.
        consecEmpty = r.inserted === 0 ? consecEmpty + 1 : 0;
        backoff = Math.max(3000, Math.floor(backoff * 0.9));
        console.log(`  +${r.inserted} (total ${total}/${target}) [${topic ?? "-"} · ${difficulty}]`);
        if (consecEmpty >= 12) {
          console.log(`  ⓘ ${examCode}/${sectionCode}: no new unique questions for a while — moving on.`);
          return false;
        }
        await sleep(backoff);
      } catch (e) {
        consecFail++;
        const msg = e instanceof Error ? e.message : String(e);
        const wait = Math.min(120000, 8000 * 2 ** Math.min(consecFail, 4));
        console.log(
          `  ⏳ ${/429|quota|rate/i.test(msg) ? "rate-limited" : "error"} — waiting ${Math.round(wait / 1000)}s (${msg.slice(0, 80)})`
        );
        await sleep(wait);
        if (consecFail >= 8) {
          console.log(`  ⛔ quota likely exhausted. Inserted ${total} for this section (resumable).`);
          return true;
        }
      }
    }
  }
  console.log(`  ✓ Done. Inserted ${total} for ${examCode}/${sectionCode}.`);
  return false;
}

(async () => {
  const plan = process.env.PLAN
    ? process.env.PLAN.split(",").map((p) => {
        const [exam, section, cap] = p.split(":");
        return { exam: exam.trim(), section: section.trim(), cap: Number(cap) || 1000 };
      })
    : (() => {
        const [examCode, sectionCode, targetArg = "500"] = process.argv.slice(2);
        return [{ exam: examCode, section: sectionCode, cap: Number(targetArg) || 500 }];
      })();

  for (const item of plan) {
    const quotaDone = await growSection(item.exam, item.section, item.cap);
    if (quotaDone) {
      console.log("\nStopping plan — AI quota exhausted for now. Re-run later to continue (resumable).");
      break;
    }
  }
})();
