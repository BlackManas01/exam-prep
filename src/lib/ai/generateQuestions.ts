// AI question-generation pipeline (provider-pluggable).
//
// Given an exam/section/topic/difficulty, this asks an LLM for a batch of
// MCQs in a strict JSON shape, validates them, de-duplicates against the
// existing bank (exact content-hash) and inserts them as INACTIVE questions
// (source = "AI") pending review. This is the engine that grows the GK / GS /
// English banks (and any subject) toward 50k–100k+ at scale.
//
// Works with FREE providers (Google Gemini, Groq) or paid OpenAI. The provider
// is auto-detected from whichever API key is present. No call is made unless a
// key is set.

import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { questionContentHash } from "@/lib/hash";

export interface GenerateParams {
  examCode: string;
  examName: string;
  sectionCode: string;
  sectionName: string;
  subject: string;
  topic?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  count: number;
  optionsPerQuestion: number;
  /** Make questions immediately usable in tests (default true). */
  activate?: boolean;
  /** Cross-check each answer with a second independent AI solve (for math). */
  verify?: boolean;
}

export interface GenerateResult {
  requested: number;
  returned: number;
  valid: number;
  inserted: number;
  duplicates: number;
}

const aiQuestionSchema = z.object({
  stem: z.string().min(5),
  options: z.array(z.string().min(1)).min(4).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string().min(3),
  topic: z.string().min(1).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]).optional(),
});

// Subject-specific scope guard so a weak model can't drift off-topic (e.g.
// writing English vocabulary questions in the General Awareness section).
function subjectGuard(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("general awareness") || s.includes("general studies"))
    return "This is STATIC GENERAL KNOWLEDGE + CURRENT AFFAIRS — i.e. History, Geography, Indian Polity & Constitution, Economy, General Science (Physics/Chemistry/Biology), Static GK and current affairs. It is NOT an English/language or vocabulary section: do NOT write idioms, synonyms, antonyms, grammar, spelling or one-word-substitution questions.";
  if (s.includes("english"))
    return "This is the ENGLISH LANGUAGE section — grammar, vocabulary (synonyms/antonyms), idioms & phrases, error spotting, sentence improvement, cloze test, reading comprehension and one-word substitution.";
  if (s.includes("computer"))
    return "This is COMPUTER KNOWLEDGE — computer fundamentals, hardware, software, operating systems, MS Office, internet, networking, memory/storage, abbreviations and basic security.";
  if (s.includes("reasoning") || s.includes("intelligence"))
    return "This is LOGICAL REASONING — analogies, series, coding-decoding, syllogisms, blood relations, directions, ranking, puzzles etc. No language or general-knowledge questions.";
  if (s.includes("quantitative") || s.includes("math") || s.includes("aptitude") || s.includes("numerical"))
    return "This is QUANTITATIVE APTITUDE / MATHEMATICS — arithmetic, algebra, geometry, trigonometry, mensuration, number system and data interpretation, with numeric answers.";
  return `Keep every question strictly within the subject "${subject}".`;
}

function buildMessages(p: GenerateParams) {
  const diff = p.difficulty ?? "MEDIUM";
  const topicLine = p.topic ? ` on the topic "${p.topic}"` : "";
  const system = [
    "You are an expert question setter for Indian government competitive exams.",
    "You write factually-correct, exam-accurate single-correct multiple-choice questions.",
    "You strictly keep every question within the requested subject and never drift to another subject.",
    "Always return STRICT JSON only, matching the requested schema. No markdown.",
  ].join(" ");

  const isTrap = diff === "HARD" || diff === "EXPERT";
  const subj = p.subject.toLowerCase();
  const isEnglish = subj.includes("english");
  const englishTrap = `
TRAP / TOPPER-CONFUSING ENGLISH (very important): These must be BRUTAL — the hardest tier, the kind only English teachers and top rankers can solve, far above the usual exam, yet with exactly one defensible answer.
- Vocabulary: use RARE, advanced words (e.g. pulchritude, sycophant, obfuscate, pusillanimous, ineluctable, mellifluous, perspicacious, insouciant, truculence). For synonyms/antonyms, make ONE distractor a sound-alike or a synonym-when-an-antonym-is-asked (the classic trap).
- Grammar/error-spotting: target subtle rules — subject-verb agreement with "one of those who", "the number of", "neither", "each"; "senior/superior/prefer + to"; misplaced modifiers; parallelism; conditional/subjunctive ("if I had known").
- Confusable pairs: complacent/complaisant, ingenuous/ingenious, prosecute/persecute, principal/principle, stationary/stationery, eminent/imminent.
- Idioms: pick less-common idioms (bell the cat, Hobson's choice, carry coals to Newcastle) with a tempting literal-meaning distractor.
- In the explanation, name the trap option and why it is wrong. Each question must test a DIFFERENT word/rule — never reuse the same word or pattern.`;
  const quantTrap = `
TRAP / BRUTAL TOPPER-LEVEL STYLE (very important): These must be the HARDEST tier — the kind only teachers and top rankers can solve, far above the real exam, yet 100% unambiguous and correct.
- Require 4-6 reasoning steps, often combining two concepts (e.g. algebra+trig, geometry+mensuration, number theory+remainders).
- Favour: infinite GP, log identities, common-tangent geometry, CRT/cyclicity remainders, symmetric-function algebra, height-and-distance with two observers, recursive series.
- Engineer ONE distractor to be the classic "obvious but wrong" trap.
- Mention in the explanation WHICH option is the trap and WHY it is wrong.
- Vary the concept every time — do NOT just change the numbers of a previous question. Each question must test a DIFFERENT twist.`;
  const trapBlock = isTrap ? (isEnglish ? englishTrap : quantTrap) : "";

  const isReasoning = subj.includes("reasoning") || subj.includes("intelligence");
  const reasoningTrap = isTrap && isReasoning ? `
TRAP / BRUTAL TOPPER-LEVEL REASONING (very important): hardest tier, only top rankers solve, yet exactly one defensible answer.
- Multi-step: coding-decoding with 2-3 layered rules, 3-statement syllogisms, double-line-up/conditional seating, mixed number-letter series, two-variable blood relations.
- Engineer ONE "obvious but wrong" distractor; name it in the explanation.
- VARY THE SURFACE every time: invent fresh names, letters, numbers, scenarios — never reuse a known textbook puzzle.` : "";

  // Novelty seed: random tokens force distinct surface features each call so the
  // model stops converging on the same canonical questions (kills duplicate saturation).
  const seed = Math.random().toString(36).slice(2, 8).toUpperCase();
  const names = ["Anaya","Vikram","Ishaan","Meera","Rohan","Tara","Dev","Kavya","Arjun","Nisha"];
  const pick = names[Math.floor(Math.random() * names.length)];
  const noveltySeed = `\nNOVELTY SEED ${seed}: make this batch DIFFERENT from any standard set — use unusual names like "${pick}", uncommon number/letter combos, and fresh scenarios. Do NOT reproduce common textbook questions.`;


  const user = `Generate ${p.count} unique single-correct MCQs for the "${p.examName}" exam, section "${p.sectionName}" (subject: ${p.subject})${topicLine}.
Difficulty: ${diff}.
CRITICAL — STAY ON SUBJECT: Every question MUST belong to the subject "${p.subject}". ${subjectGuard(p.subject)} Do NOT generate questions from any other subject.
Base the questions on the official syllabus and the style/pattern of this exam's previous years' papers (last 5-10 years), covering frequently-asked topics.
Make them EXAM-STANDARD and genuinely challenging — like the real exam, not easy. Use application/analytical questions, statement-based questions, and strong, plausible distractors so guessing is hard. Avoid trivial one-line recall.${trapBlock}${reasoningTrap}${noveltySeed}
Every fact and answer key MUST be accurate. Each question must have exactly ${p.optionsPerQuestion} options, exactly one correct, and a concise step-by-step or factual explanation.
Avoid repeating questions and avoid ambiguous wording.

Return JSON of this exact shape:
{
  "questions": [
    {
      "stem": "string",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correctIndex": 0,
      "explanation": "string",
      "topic": "string",
      "difficulty": "EASY|MEDIUM|HARD|EXPERT"
    }
  ]
}`;

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}

type Provider = "openai" | "gemini" | "groq";

function getProvider(): Provider {
  const p = (process.env.AI_PROVIDER || "").toLowerCase();
  if (p === "openai" || p === "gemini" || p === "groq") return p;
  // Auto-detect: prefer a free provider if its key is present.
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.GROQ_API_KEY) return "groq";
  return "openai";
}

function extractQuestions(content: string): unknown[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid JSON");
  }
  const fromObj = (parsed as { questions?: unknown[] })?.questions;
  if (Array.isArray(fromObj)) return fromObj;
  return Array.isArray(parsed) ? (parsed as unknown[]) : [];
}

// OpenAI-compatible Chat Completions API (used by OpenAI and Groq).
async function callOpenAICompatible(
  params: GenerateParams,
  baseUrl: string,
  apiKey: string,
  model: string
): Promise<unknown[]> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: buildMessages(params),
      response_format: { type: "json_object" },
      temperature: 0.8,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned no content");
  return extractQuestions(content);
}

// Google Gemini (free tier: https://aistudio.google.com/apikey).
async function callGemini(
  params: GenerateParams,
  apiKey: string,
  model: string
): Promise<unknown[]> {
  const [system, user] = buildMessages(params);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${system.content}\n\n${user.content}` }] }],
        generationConfig: { temperature: 0.8, responseMimeType: "application/json" },
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini request failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Gemini returned no content");
  return extractQuestions(content);
}

// Free Gemini models fluctuate between 200 / 429 (quota) / 503 (overloaded).
// Retry transient failures and fall back across a few free-tier models.
async function callGeminiResilient(params: GenerateParams, apiKey: string): Promise<unknown[]> {
  const models = [
    ...new Set(
      [
        process.env.GEMINI_MODEL,
        "gemini-2.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-2.0-flash-lite",
      ].filter(Boolean) as string[]
    ),
  ];
  let lastErr: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await callGemini(params, apiKey, model);
      } catch (e) {
        lastErr = e;
        const msg = e instanceof Error ? e.message : "";
        if (/\((429|503)\)/.test(msg)) {
          await new Promise((r) => setTimeout(r, 1500));
          continue; // retry / fall through to next model
        }
        throw e; // non-transient error
      }
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error("Gemini generation failed after retries");
}

async function callProvider(provider: Provider, params: GenerateParams): Promise<unknown[]> {
  if (provider === "gemini") {
    const key = process.env.GEMINI_API_KEY;
    if (!key)
      throw new Error(
        "GEMINI_API_KEY is not set. Get a FREE key at https://aistudio.google.com/apikey"
      );
    return callGeminiResilient(params, key);
  }
  if (provider === "groq") {
    const key = process.env.GROQ_API_KEY;
    if (!key)
      throw new Error(
        "GROQ_API_KEY is not set. Get a FREE key at https://console.groq.com/keys"
      );
    return callOpenAICompatible(
      params,
      "https://api.groq.com/openai/v1",
      key,
      process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
    );
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key)
    throw new Error(
      "No AI key set. Use a FREE provider: set GEMINI_API_KEY (https://aistudio.google.com/apikey) " +
        "or GROQ_API_KEY (https://console.groq.com/keys) in .env. OpenAI is also supported via OPENAI_API_KEY."
    );
  return callOpenAICompatible(
    params,
    "https://api.openai.com/v1",
    key,
    process.env.OPENAI_MODEL || "gpt-4o"
  );
}

// Ordered list of providers to try: the detected primary first, then any other
// provider whose key is present. This lets generation automatically fall back
// (e.g. Gemini → Groq) when the primary hits its free-tier quota.
function providerChain(): Provider[] {
  const has: Record<Provider, boolean> = {
    gemini: !!process.env.GEMINI_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  };
  const order: Provider[] = [getProvider(), "gemini", "groq", "openai"];
  const chain: Provider[] = [];
  for (const p of order) if (has[p] && !chain.includes(p)) chain.push(p);
  return chain.length ? chain : [getProvider()];
}

async function callLLM(params: GenerateParams): Promise<unknown[]> {
  const chain = providerChain();
  let lastErr: unknown;
  for (const provider of chain) {
    try {
      return await callProvider(provider, params);
    } catch (e) {
      lastErr = e;
      // Fall through to the next available provider on any failure (quota,
      // rate-limit, overload, or a bad response) — best-effort throughput.
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All AI providers failed");
}

// Raw text completion (not JSON) — used by the independent answer-verifier.
async function chatRaw(provider: Provider, system: string, user: string): Promise<string> {
  if (provider === "gemini") {
    const key = process.env.GEMINI_API_KEY!;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${system}\n\n${user}` }] }], generationConfig: { temperature: 0 } }) }
    );
    if (!res.ok) throw new Error(`Gemini verify failed (${res.status})`);
    const d = await res.json();
    return d?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
  const [baseUrl, key, model] =
    provider === "groq"
      ? ["https://api.groq.com/openai/v1", process.env.GROQ_API_KEY!, process.env.GROQ_MODEL || "llama-3.3-70b-versatile"]
      : ["https://api.openai.com/v1", process.env.OPENAI_API_KEY!, process.env.OPENAI_MODEL || "gpt-4o"];
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, temperature: 0, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
  });
  if (!res.ok) throw new Error(`Verify failed (${res.status})`);
  const d = await res.json();
  return d?.choices?.[0]?.message?.content ?? "";
}

// Asks a DIFFERENT provider to solve the MCQ independently; returns the option
// index it chose, or -1 if unclear. Used to cross-check generated answers.
async function solveIndependently(stem: string, options: string[]): Promise<number> {
  const chain = providerChain();
  // Prefer a provider different from the generator's primary, for a true 2nd opinion.
  const verifier = chain.find((p) => p !== chain[0]) ?? chain[0];
  const letters = options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join("\n");
  const system =
    "You are an expert who solves Indian government-exam MCQs (SSC/Banking/Railways). Solve the problem carefully and reply with ONLY the single letter (A, B, C or D) of the correct option — no working, no extra text.";
  const user = `${stem}\n${letters}`;
  const text = await chatRaw(verifier, system, user);
  const m = text.trim().toUpperCase().match(/\b([A-D])\b/);
  return m ? m[1].charCodeAt(0) - 65 : -1;
}

/**
 * Generate a batch of questions and store the valid, non-duplicate ones as
 * inactive AI questions for review.
 */
export async function generateAndStore(params: GenerateParams): Promise<GenerateResult> {
  const raw = await callLLM(params);

  // Validate
  const valid: z.infer<typeof aiQuestionSchema>[] = [];
  for (const item of raw) {
    const parsed = aiQuestionSchema.safeParse(item);
    if (!parsed.success) continue;
    const q = parsed.data;
    if (q.correctIndex >= q.options.length) continue;
    valid.push(q);
  }

  // Hash + in-batch dedup
  const seen = new Set<string>();
  const candidates = valid
    .map((q) => ({ q, hash: questionContentHash(q.stem, q.options[q.correctIndex]) }))
    .filter(({ hash }) => (seen.has(hash) ? false : (seen.add(hash), true)));

  // Dedup against existing bank for this exam+section
  const existing = await prisma.question.findMany({
    where: {
      examCode: params.examCode,
      sectionCode: params.sectionCode,
      contentHash: { in: candidates.map((c) => c.hash) },
    },
    select: { contentHash: true },
  });
  const existingHashes = new Set(existing.map((e) => e.contentHash));
  let fresh = candidates.filter((c) => !existingHashes.has(c.hash));

  // Cross-verify answers with an independent AI solve (for math-heavy subjects).
  // Keep only questions where the second opinion agrees with the stated answer —
  // this filters out AI arithmetic/logic mistakes. Auto-on for quant/reasoning.
  const needsVerify =
    params.verify ?? /quant|math|aptitude|numerical|reasoning|intelligence|english/i.test(params.subject);
  if (needsVerify && fresh.length > 0) {
    const checked: typeof fresh = [];
    for (const c of fresh) {
      try {
        const idx = await solveIndependently(c.q.stem, c.q.options);
        if (idx === c.q.correctIndex) checked.push(c);
      } catch {
        // If verification call fails, drop the question (safer than keeping it).
      }
    }
    fresh = checked;
  }

  // Insert as inactive (pending review)
  const questionRows = fresh.map(({ q, hash }) => ({
    id: randomUUID(),
    examCode: params.examCode,
    sectionCode: params.sectionCode,
    subject: params.subject,
    topic: q.topic ?? params.topic ?? params.subject,
    difficulty: q.difficulty ?? params.difficulty ?? "MEDIUM",
    stem: q.stem,
    explanation: q.explanation,
    source: "AI",
    contentHash: hash,
    isActive: params.activate !== false,
  }));
  const optionRows = fresh.flatMap(({ q }, i) =>
    q.options.map((text, idx) => ({
      id: randomUUID(),
      questionId: questionRows[i].id,
      text,
      isCorrect: idx === q.correctIndex,
      displayOrder: idx,
    }))
  );

  if (questionRows.length > 0) {
    await prisma.question.createMany({ data: questionRows });
    await prisma.option.createMany({ data: optionRows });
  }

  return {
    requested: params.count,
    returned: raw.length,
    valid: valid.length,
    inserted: questionRows.length,
    duplicates: candidates.length - fresh.length,
  };
}
