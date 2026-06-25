import { getExamBlueprint } from "./examConfig";

export interface SectionResult {
  sectionCode: string;
  sectionName: string;
  total: number;
  correct: number;
  wrong: number;
  unattempted: number;
  scoredMarks: number;
  accuracy: number;
}

export interface ScoreSummary {
  totalQuestions: number;
  totalMarks: number;
  scoredMarks: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  accuracy: number;
  sections: SectionResult[];
}

interface EvaluatedItem {
  sectionCode: string;
  isAttempted: boolean;
  isCorrect: boolean;
}

/** Apply the exam's marking scheme to evaluated items. */
export function scoreAttempt(examCode: string, items: EvaluatedItem[]): ScoreSummary {
  const blueprint = getExamBlueprint(examCode);
  if (!blueprint) throw new Error(`Unknown exam: ${examCode}`);

  const sectionMap = new Map<string, SectionResult>();
  for (const s of blueprint.sections) {
    sectionMap.set(s.code, {
      sectionCode: s.code,
      sectionName: s.name,
      total: 0,
      correct: 0,
      wrong: 0,
      unattempted: 0,
      scoredMarks: 0,
      accuracy: 0,
    });
  }

  let correct = 0;
  let wrong = 0;
  let unattempted = 0;

  for (const item of items) {
    const sec = sectionMap.get(item.sectionCode);
    if (sec) sec.total++;

    if (!item.isAttempted) {
      unattempted++;
      if (sec) sec.unattempted++;
      continue;
    }
    if (item.isCorrect) {
      correct++;
      if (sec) {
        sec.correct++;
        sec.scoredMarks += blueprint.marksPerCorrect;
      }
    } else {
      wrong++;
      if (sec) {
        sec.wrong++;
        sec.scoredMarks -= blueprint.negativeMarkPerWrong;
      }
    }
  }

  for (const sec of sectionMap.values()) {
    const attempted = sec.correct + sec.wrong;
    sec.accuracy = attempted > 0 ? (sec.correct / attempted) * 100 : 0;
    sec.scoredMarks = Math.round(sec.scoredMarks * 100) / 100;
  }

  const attemptedTotal = correct + wrong;
  const scoredMarks =
    Math.round(
      (correct * blueprint.marksPerCorrect - wrong * blueprint.negativeMarkPerWrong) * 100
    ) / 100;

  return {
    totalQuestions: items.length,
    totalMarks: items.length * blueprint.marksPerCorrect,
    scoredMarks,
    correctCount: correct,
    wrongCount: wrong,
    unattemptedCount: unattempted,
    accuracy: attemptedTotal > 0 ? Math.round((correct / attemptedTotal) * 10000) / 100 : 0,
    sections: Array.from(sectionMap.values()),
  };
}
