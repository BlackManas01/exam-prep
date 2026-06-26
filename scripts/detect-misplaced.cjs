// Detects questions whose content/topic belongs to a DIFFERENT subject than the
// section they're stored in (e.g. an English idiom inside General Awareness).
// REPORT ONLY by default. Pass --apply to relocate them to the correct section
// of the SAME exam (only when that exam actually has the target section). Never
// deletes anything.
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

function contentHash(stem, correctAnswer) {
  const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
  return crypto.createHash("sha256").update(`${norm(stem)}::${norm(correctAnswer)}`).digest("hex");
}

// What subject a section represents.
function sectionSubject(sectionCode) {
  if (/general-awareness|general-studies/.test(sectionCode)) return "gk";
  if (sectionCode === "english") return "english";
  if (sectionCode === "computer") return "computer";
  if (/reasoning|intelligence/.test(sectionCode)) return "reasoning";
  if (/quant|math/.test(sectionCode)) return "quant";
  return "other";
}

// Map a subject back to the section code within an exam (so we can relocate).
function targetSection(subject, exam) {
  const wanted = {
    english: ["english"],
    computer: ["computer"],
    gk: ["general-awareness", "general-studies"],
    reasoning: ["reasoning", "general-intelligence"],
    quant: ["quant", "math", "maths"],
  }[subject] || [];
  return exam.find((s) => wanted.includes(s));
}

// Classify a question into a subject using strong topic/stem keyword signals.
// Returns null when it's not clearly another subject (conservative).
function classify(topic, stem) {
  const t = `${topic} ${stem}`.toLowerCase();
  const english =
    /\b(synonym|antonym|idiom|one[- ]word substitution|spelling|error spot|sentence improvement|cloze|phrasal verb|homophone|narration|active and passive|direct and indirect|preposition|fill in the blank|para ?jumble|sentence rearrangement|vocabulary)\b/;
  const computer =
    /\b(cpu|ram\b|rom\b|microprocessor|operating system|ms[- ]?(word|excel|power ?point|office)|motherboard|binary|byte|kilobyte|megabyte|gigabyte|url|html|http|hyperlink|spreadsheet|keyboard shortcut|ctrl\+|dbms|sql|booting|antivirus|malware|lan\b|wan\b|modem|router|ethernet|usb\b|firmware|gui\b)\b/;
  const reasoning =
    /\b(coding[- ]decoding|blood relation|syllogism|odd one out|mirror image|water image|seating arrangement|direction sense|number series|letter series|analogy)\b/;
  // Order matters: check the most specific first.
  if (computer.test(t)) return "computer";
  if (english.test(t)) return "english";
  if (reasoning.test(t)) return "reasoning";
  return null;
}

(async () => {
  const exams = await prisma.exam.findMany({ include: { sections: true } });
  const sectionsByExam = {};
  for (const e of exams) sectionsByExam[e.code] = e.sections.map((s) => s.code);

  const all = await prisma.question.findMany({
    select: { id: true, examCode: true, sectionCode: true, subject: true, topic: true, stem: true },
  });

  const misplaced = [];
  for (const q of all) {
    const sec = sectionSubject(q.sectionCode);
    const detected = classify(q.topic, q.stem);
    if (detected && detected !== sec) {
      misplaced.push({ ...q, detected });
    }
  }

  // Summarise
  const byBucket = {};
  for (const m of misplaced) {
    const key = `${m.examCode} | ${m.sectionCode} → ${m.detected}`;
    byBucket[key] = (byBucket[key] || 0) + 1;
  }
  console.log(`Scanned ${all.length} questions. Found ${misplaced.length} likely misplaced.\n`);
  for (const [k, n] of Object.entries(byBucket).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${n}`);
  }

  if (!APPLY) {
    console.log("\n(REPORT ONLY — re-run with --apply to relocate them. Nothing deleted.)");
    await prisma.$disconnect();
    return;
  }

  // Relocate
  let moved = 0, blocked = 0, noTarget = 0;
  const SUBJECT_NAME = {
    english: "English",
    computer: "Computer Knowledge",
    gk: "General Awareness",
    reasoning: "Reasoning",
    quant: "Quantitative Aptitude",
  };
  for (const m of misplaced) {
    const exam = sectionsByExam[m.examCode] || [];
    const tgt = targetSection(m.detected, exam);
    if (!tgt) { noTarget++; continue; }
    // Re-hash to check for an existing duplicate in the target section.
    const q = await prisma.question.findUnique({ where: { id: m.id }, include: { options: true } });
    const correct = q.options.find((o) => o.isCorrect);
    const hash = correct ? contentHash(q.stem, correct.text) : q.contentHash;
    const clash = await prisma.question.findFirst({
      where: { examCode: m.examCode, sectionCode: tgt, contentHash: hash, NOT: { id: m.id } },
      select: { id: true },
    });
    if (clash) { blocked++; continue; } // would duplicate in target — leave as is
    await prisma.question.update({
      where: { id: m.id },
      data: { sectionCode: tgt, subject: SUBJECT_NAME[m.detected], contentHash: hash },
    });
    moved++;
  }
  console.log(`\nRelocated ${moved}. Left in place (would duplicate target): ${blocked}. No target section in exam: ${noTarget}.`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
