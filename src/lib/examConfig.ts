// Central blueprint for every exam the platform simulates.
// Verified against official 2026 exam patterns. These objects drive both the
// database seed and the runtime test-assembly engine, so the mock test mirrors
// the real exam's section order, question count, marking scheme and timing.

export type ExamCategory = "SSC" | "BANKING" | "RAILWAYS" | "UPSC";

export interface SectionBlueprint {
  code: string;
  name: string;
  subject: string;
  questionCount: number;
  /** Used only when the exam enforces per-section timing (e.g. IBPS PO). */
  sectionDurationSeconds?: number;
  /** Representative topics used by the seed + AI generator. */
  topics: string[];
}

export interface ExamBlueprint {
  code: string;
  name: string;
  shortName: string;
  category: ExamCategory;
  description: string;
  totalDurationSeconds: number;
  marksPerCorrect: number;
  negativeMarkPerWrong: number;
  hasSectionalTiming: boolean;
  optionsPerQuestion: number;
  displayOrder: number;
  sections: SectionBlueprint[];
}

const m = (minutes: number) => minutes * 60;

export const EXAM_BLUEPRINTS: ExamBlueprint[] = [
  {
    code: "ssc-cgl-tier1",
    name: "SSC CGL Tier 1",
    shortName: "SSC CGL",
    category: "SSC",
    description:
      "Staff Selection Commission - Combined Graduate Level, Tier 1. 100 questions, 200 marks, 60 minutes with sectional timing (15 min per section).",
    totalDurationSeconds: m(60),
    marksPerCorrect: 2,
    negativeMarkPerWrong: 0.5,
    hasSectionalTiming: true,
    optionsPerQuestion: 4,
    displayOrder: 1,
    sections: [
      {
        code: "reasoning",
        name: "General Intelligence & Reasoning",
        subject: "Reasoning",
        questionCount: 25,
        topics: ["Analogy", "Series", "Coding-Decoding", "Syllogism", "Blood Relations", "Direction Sense"],
      },
      {
        code: "general-awareness",
        name: "General Awareness",
        subject: "General Awareness",
        questionCount: 25,
        topics: ["History", "Geography", "Polity", "Economy", "Science", "Current Affairs"],
      },
      {
        code: "quant",
        name: "Quantitative Aptitude",
        subject: "Quantitative Aptitude",
        questionCount: 25,
        topics: ["Percentage", "Ratio & Proportion", "Time & Work", "Geometry", "Algebra", "Data Interpretation"],
      },
      {
        code: "english",
        name: "English Comprehension",
        subject: "English",
        questionCount: 25,
        topics: ["Synonyms", "Antonyms", "Error Spotting", "Fill in the Blanks", "Idioms", "Reading Comprehension"],
      },
    ],
  },
  {
    code: "ssc-chsl-tier1",
    name: "SSC CHSL Tier 1",
    shortName: "SSC CHSL",
    category: "SSC",
    description:
      "Staff Selection Commission - Combined Higher Secondary Level, Tier 1. 100 questions, 200 marks, 60 minutes with sectional timing (15 min per section).",
    totalDurationSeconds: m(60),
    marksPerCorrect: 2,
    negativeMarkPerWrong: 0.5,
    hasSectionalTiming: true,
    optionsPerQuestion: 4,
    displayOrder: 2,
    sections: [
      {
        code: "general-intelligence",
        name: "General Intelligence",
        subject: "Reasoning",
        questionCount: 25,
        topics: ["Analogy", "Classification", "Series", "Coding-Decoding", "Non-Verbal Reasoning"],
      },
      {
        code: "general-awareness",
        name: "General Awareness",
        subject: "General Awareness",
        questionCount: 25,
        topics: ["History", "Geography", "Polity", "Economy", "Science", "Current Affairs"],
      },
      {
        code: "quant",
        name: "Quantitative Aptitude",
        subject: "Quantitative Aptitude",
        questionCount: 25,
        topics: ["Number System", "Percentage", "Average", "Time & Distance", "Mensuration", "Trigonometry"],
      },
      {
        code: "english",
        name: "English Language",
        subject: "English",
        questionCount: 25,
        topics: ["Spelling", "Synonyms", "Antonyms", "Sentence Improvement", "Cloze Test", "One Word Substitution"],
      },
    ],
  },
  {
    code: "ibps-po-prelims",
    name: "IBPS PO Prelims",
    shortName: "IBPS PO",
    category: "BANKING",
    description:
      "Institute of Banking Personnel Selection - Probationary Officer, Preliminary. 100 questions, 100 marks, 60 minutes with sectional timing.",
    totalDurationSeconds: m(60),
    marksPerCorrect: 1,
    negativeMarkPerWrong: 0.25,
    hasSectionalTiming: true,
    optionsPerQuestion: 5,
    displayOrder: 3,
    sections: [
      {
        code: "english",
        name: "English Language",
        subject: "English",
        questionCount: 30,
        sectionDurationSeconds: m(20),
        topics: ["Reading Comprehension", "Cloze Test", "Para Jumbles", "Error Spotting", "Fill in the Blanks"],
      },
      {
        code: "quant",
        name: "Quantitative Aptitude",
        subject: "Quantitative Aptitude",
        questionCount: 35,
        sectionDurationSeconds: m(20),
        topics: ["Simplification", "Number Series", "Data Interpretation", "Quadratic Equations", "Arithmetic"],
      },
      {
        code: "reasoning",
        name: "Reasoning Ability",
        subject: "Reasoning",
        questionCount: 35,
        sectionDurationSeconds: m(20),
        topics: ["Puzzles", "Seating Arrangement", "Syllogism", "Inequalities", "Blood Relations", "Coding-Decoding"],
      },
    ],
  },
  {
    code: "rrb-ntpc-cbt1",
    name: "RRB NTPC CBT 1",
    shortName: "RRB NTPC",
    category: "RAILWAYS",
    description:
      "Railway Recruitment Board - Non-Technical Popular Categories, CBT 1. 100 questions, 100 marks, 90 minutes.",
    totalDurationSeconds: m(90),
    marksPerCorrect: 1,
    negativeMarkPerWrong: 1 / 3,
    hasSectionalTiming: false,
    optionsPerQuestion: 4,
    displayOrder: 4,
    sections: [
      {
        code: "maths",
        name: "Mathematics",
        subject: "Quantitative Aptitude",
        questionCount: 30,
        topics: ["Number System", "Percentage", "Profit & Loss", "Time & Work", "Geometry", "Mensuration"],
      },
      {
        code: "reasoning",
        name: "General Intelligence & Reasoning",
        subject: "Reasoning",
        questionCount: 30,
        topics: ["Analogy", "Series", "Coding-Decoding", "Syllogism", "Venn Diagrams", "Statement & Conclusion"],
      },
      {
        code: "general-awareness",
        name: "General Awareness",
        subject: "General Awareness",
        questionCount: 40,
        topics: ["History", "Geography", "Polity", "Science", "Static GK", "Current Affairs"],
      },
    ],
  },
  {
    code: "upsc-prelims-gs1",
    name: "UPSC Prelims GS Paper 1",
    shortName: "UPSC Prelims",
    category: "UPSC",
    description:
      "Union Public Service Commission - Civil Services Preliminary, General Studies Paper 1. 100 questions, 200 marks, 120 minutes.",
    totalDurationSeconds: m(120),
    marksPerCorrect: 2,
    negativeMarkPerWrong: 2 / 3,
    hasSectionalTiming: false,
    optionsPerQuestion: 4,
    displayOrder: 5,
    sections: [
      {
        code: "general-studies",
        name: "General Studies",
        subject: "General Studies",
        questionCount: 100,
        topics: [
          "History of India",
          "Indian & World Geography",
          "Indian Polity & Governance",
          "Economic & Social Development",
          "Environmental Ecology",
          "General Science",
          "Current Events",
        ],
      },
    ],
  },
  {
    code: "ssc-cgl-tier2",
    name: "SSC CGL Tier 2",
    shortName: "SSC CGL T2",
    category: "SSC",
    description:
      "Staff Selection Commission - CGL Tier 2 (Paper 1, compulsory for all posts). 150 questions, 450 marks, 135 minutes with sectional timing. +3 / −1.",
    totalDurationSeconds: m(135),
    marksPerCorrect: 3,
    negativeMarkPerWrong: 1,
    hasSectionalTiming: true,
    optionsPerQuestion: 4,
    displayOrder: 6,
    sections: [
      {
        code: "math",
        name: "Mathematical Abilities",
        subject: "Quantitative Aptitude",
        questionCount: 30,
        sectionDurationSeconds: m(30),
        topics: ["Number System", "Algebra", "Geometry", "Trigonometry", "Mensuration", "Data Interpretation"],
      },
      {
        code: "reasoning",
        name: "Reasoning & General Intelligence",
        subject: "Reasoning",
        questionCount: 30,
        sectionDurationSeconds: m(30),
        topics: ["Analogy", "Series", "Coding-Decoding", "Syllogism", "Matrix", "Puzzles"],
      },
      {
        code: "english",
        name: "English Language & Comprehension",
        subject: "English",
        questionCount: 45,
        sectionDurationSeconds: m(40),
        topics: ["Reading Comprehension", "Synonyms", "Antonyms", "Error Spotting", "Cloze Test", "Idioms", "One Word Substitution"],
      },
      {
        code: "general-awareness",
        name: "General Awareness",
        subject: "General Awareness",
        questionCount: 25,
        sectionDurationSeconds: m(20),
        topics: ["History", "Geography", "Polity", "Economy", "Science", "Current Affairs"],
      },
      {
        code: "computer",
        name: "Computer Knowledge",
        subject: "Computer Knowledge",
        questionCount: 20,
        sectionDurationSeconds: m(15),
        topics: ["Computer Basics", "MS Office", "Internet", "Networking", "Hardware & Software", "Security"],
      },
    ],
  },
];

export const DIFFICULTY_LEVELS = [
  {
    key: "REAL",
    label: "Real Exam Level",
    description: "Mirrors the actual exam difficulty distribution.",
  },
  {
    key: "SLIGHTLY_HARDER",
    label: "Slightly Harder",
    description: "A notch above the real exam to build a buffer.",
  },
  {
    key: "TWO_X",
    label: "2x Harder",
    description: "Significantly tougher questions for advanced practice.",
  },
] as const;

export type DifficultyLevelKey = (typeof DIFFICULTY_LEVELS)[number]["key"];

// Difficulty distribution (share of EASY/MEDIUM/HARD/EXPERT) per level.
// The assembly engine samples questions to match these weights.
export const DIFFICULTY_DISTRIBUTION: Record<
  DifficultyLevelKey,
  { EASY: number; MEDIUM: number; HARD: number; EXPERT: number }
> = {
  // Calibrated to the REAL SSC CGL exam, where most questions are multi-step.
  // The single-step procedural items live in EASY and are only a small slice.
  REAL: { EASY: 0.15, MEDIUM: 0.25, HARD: 0.45, EXPERT: 0.15 },
  SLIGHTLY_HARDER: { EASY: 0.05, MEDIUM: 0.2, HARD: 0.45, EXPERT: 0.3 },
  TWO_X: { EASY: 0.0, MEDIUM: 0.1, HARD: 0.45, EXPERT: 0.45 },
};

export function getExamBlueprint(code: string): ExamBlueprint | undefined {
  return EXAM_BLUEPRINTS.find((e) => e.code === code);
}

export function totalQuestions(exam: ExamBlueprint): number {
  return exam.sections.reduce((sum, s) => sum + s.questionCount, 0);
}

export function totalMarks(exam: ExamBlueprint): number {
  return totalQuestions(exam) * exam.marksPerCorrect;
}

/**
 * Time allotted to a section. When an exam has sectional timing but a section
 * does not declare an explicit duration, the total time is split equally across
 * sections (e.g. SSC: 60 min / 4 = 15 min each).
 */
export function sectionDurationSeconds(
  exam: Pick<ExamBlueprint, "totalDurationSeconds" | "sections">,
  section: Pick<SectionBlueprint, "sectionDurationSeconds">
): number {
  return (
    section.sectionDurationSeconds ??
    Math.floor(exam.totalDurationSeconds / exam.sections.length)
  );
}
