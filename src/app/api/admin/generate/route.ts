import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getExamBlueprint } from "@/lib/examConfig";
import { generateAndStore } from "@/lib/ai/generateQuestions";
import { isAdminRequest } from "@/lib/auth";

const schema = z.object({
  examCode: z.string().min(1),
  sectionCode: z.string().min(1),
  topic: z.string().trim().min(1).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]).optional(),
  count: z.number().int().min(1).max(50).default(10),
  activate: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { examCode, sectionCode, topic, difficulty, count, activate } = parsed.data;

  const exam = getExamBlueprint(examCode);
  if (!exam) return NextResponse.json({ error: "Unknown exam" }, { status: 404 });
  const section = exam.sections.find((s) => s.code === sectionCode);
  if (!section) return NextResponse.json({ error: "Unknown section" }, { status: 404 });

  try {
    const result = await generateAndStore({
      examCode,
      examName: exam.name,
      sectionCode,
      sectionName: section.name,
      subject: section.subject,
      topic,
      difficulty,
      count,
      optionsPerQuestion: exam.optionsPerQuestion,
      activate,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 }
    );
  }
}
