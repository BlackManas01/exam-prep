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

function buildMessages(p: GenerateParams) {
  const diff = p.difficulty ?? "MEDIUM";
  const topicLine = p.topic ? ` on the topic "${p.topic}"` : "";
  const system = [
    "You are an expert question setter for Indian government competitive exams.",
    "You write factually-correct, exam-accurate single-correct multiple-choice questions.",
    "Always return STRICT JSON only, matching the requested schema. No markdown.",
  ].join(" ");

  const user = `Generate ${p.count} unique single-correct MCQs for the "${p.examName}" exam, section "${p.sectionName}" (subject: ${p.subject})${topicLine}.
Difficulty: ${diff}.
Base the questions on the official syllabus and the style/pattern of this exam's previous years' papers (last 5-10 years), covering frequently-asked topics.
Make them EXAM-STANDARD and genuinely challenging — like the real exam, not easy. Use application/analytical questions, statement-based questions, and strong, plausible distractors so guessing is hard. Avoid trivial one-line recall.
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

async function callLLM(params: GenerateParams): Promise<unknown[]> {
  const provider = getProvider();
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
  const fresh = candidates.filter((c) => !existingHashes.has(c.hash));

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
