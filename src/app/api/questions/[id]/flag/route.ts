import { NextRequest, NextResponse } from "next/server";
import { addFlag } from "@/lib/flags";

// Public: a student reports a question they believe has a wrong answer.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing question id" }, { status: 400 });
  }

  let reason: string | undefined;
  try {
    const body = await req.json();
    if (body && typeof body.reason === "string") {
      reason = body.reason.trim().slice(0, 300) || undefined;
    }
  } catch {
    // reason is optional
  }

  await addFlag(id, reason);
  return NextResponse.json({ ok: true });
}
