import { createHash } from "crypto";

/**
 * Deterministic content hash for a question, based on the normalized STEM plus
 * the CORRECT ANSWER. Two questions with the same stem and the same answer are
 * treated as the same question regardless of how the wrong options are shuffled
 * — this prevents the same (e.g. number-series) question from being stored
 * multiple times with different distractors. The DB enforces a unique
 * constraint on (examCode, sectionCode, contentHash), so duplicates are
 * rejected at insert time.
 */
export function questionContentHash(stem: string, correctAnswer: string): string {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s]/g, "")
      .trim();

  return createHash("sha256")
    .update(`${normalize(stem)}::${normalize(correctAnswer)}`)
    .digest("hex");
}
