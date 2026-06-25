import { prisma } from "./prisma";
import {
  DIFFICULTY_DISTRIBUTION,
  DifficultyLevelKey,
  getExamBlueprint,
} from "./examConfig";

type Diff = "EASY" | "MEDIUM" | "HARD" | "EXPERT";
const DIFFS: Diff[] = ["EASY", "MEDIUM", "HARD", "EXPERT"];

export interface AssembledItem {
  questionId: string;
  sectionCode: string;
  displayOrder: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Split a section's question count across difficulties per the chosen level. */
function difficultyCounts(total: number, level: DifficultyLevelKey): Record<Diff, number> {
  const dist = DIFFICULTY_DISTRIBUTION[level];
  const counts: Record<Diff, number> = { EASY: 0, MEDIUM: 0, HARD: 0, EXPERT: 0 };
  let assigned = 0;
  for (const d of DIFFS) {
    counts[d] = Math.floor(total * dist[d]);
    assigned += counts[d];
  }
  // distribute the rounding remainder onto the most-weighted buckets
  let remainder = total - assigned;
  const order = [...DIFFS].sort((a, b) => dist[b] - dist[a]);
  let i = 0;
  while (remainder > 0) {
    counts[order[i % order.length]]++;
    remainder--;
    i++;
  }
  return counts;
}

/**
 * Assemble a full mock test for an exam. Picks questions per section honoring
 * the difficulty distribution of the chosen level, sampling without
 * replacement. If a section's bank is smaller than required, it borrows from
 * adjacent difficulty buckets and, as a last resort, cycles existing questions
 * so the paper is always complete (the AI pipeline keeps the bank large enough
 * that this fallback is rarely needed in production).
 */
export async function assembleAttempt(
  examCode: string,
  level: DifficultyLevelKey
): Promise<AssembledItem[]> {
  const blueprint = getExamBlueprint(examCode);
  if (!blueprint) throw new Error(`Unknown exam: ${examCode}`);

  const items: AssembledItem[] = [];
  let order = 0;

  for (const section of blueprint.sections) {
    const chosen = await pickSectionQuestionIds(
      examCode,
      section.code,
      section.questionCount,
      level
    );
    for (const questionId of shuffle(chosen)) {
      items.push({ questionId, sectionCode: section.code, displayOrder: order++ });
    }
  }

  return items;
}

// Pick question ids for one section honoring the difficulty distribution.
async function pickSectionQuestionIds(
  examCode: string,
  sectionCode: string,
  count: number,
  level: DifficultyLevelKey,
  verifiedOnly = false,
  topic?: string
): Promise<string[]> {
  const questions = await prisma.question.findMany({
    where: {
      examCode,
      sectionCode,
      isActive: true,
      // "Verified only" excludes AI-generated questions, leaving the
      // hand-written / procedurally-correct (SEED) and manual items.
      ...(verifiedOnly ? { source: { in: ["SEED", "MANUAL"] } } : {}),
      // Topic-wise practice: drill a single topic (e.g. only Compound Interest).
      ...(topic ? { topic } : {}),
    },
    select: { id: true, difficulty: true },
  });

  const byDiff: Record<Diff, string[]> = { EASY: [], MEDIUM: [], HARD: [], EXPERT: [] };
  for (const q of questions) byDiff[q.difficulty as Diff].push(q.id);
  for (const d of DIFFS) byDiff[d] = shuffle(byDiff[d]);

  const need = difficultyCounts(count, level);
  const chosen: string[] = [];
  const used = new Set<string>();

  // Primary pass: take from each difficulty bucket.
  for (const d of DIFFS) {
    let take = need[d];
    while (take > 0 && byDiff[d].length > 0) {
      const id = byDiff[d].pop()!;
      if (!used.has(id)) {
        used.add(id);
        chosen.push(id);
        take--;
      }
    }
    need[d] = take;
  }

  // Borrow pass: fill leftover demand from any remaining unused question.
  const remainingPool = shuffle(questions.map((q) => q.id).filter((id) => !used.has(id)));
  let deficit = count - chosen.length;
  while (deficit > 0 && remainingPool.length > 0) {
    const id = remainingPool.pop()!;
    used.add(id);
    chosen.push(id);
    deficit--;
  }

  // Last-resort cyclic fill (only when the bank is too small).
  if (deficit > 0 && questions.length > 0) {
    const all = shuffle(questions.map((q) => q.id));
    let k = 0;
    while (deficit > 0) {
      chosen.push(all[k % all.length]);
      k++;
      deficit--;
    }
  }

  return chosen;
}

/**
 * Assemble a single-subject practice test: `count` questions from one section
 * of an exam, honoring the chosen difficulty level. When `verifiedOnly` is set,
 * only hand-verified (non-AI) questions are used. When `topic` is set, only
 * questions from that topic are used (topic-wise drilling).
 */
export async function assembleSection(
  examCode: string,
  sectionCode: string,
  level: DifficultyLevelKey,
  count: number,
  verifiedOnly = false,
  topic?: string
): Promise<AssembledItem[]> {
  const chosen = await pickSectionQuestionIds(examCode, sectionCode, count, level, verifiedOnly, topic);
  return shuffle(chosen).map((questionId, i) => ({
    questionId,
    sectionCode,
    displayOrder: i,
  }));
}
