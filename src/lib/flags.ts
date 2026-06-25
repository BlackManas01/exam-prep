import { promises as fs } from "fs";
import path from "path";

// Lightweight, file-based store for "report wrong answer" flags. Kept out of the
// database so it never interferes with question generation / backups.

const FILE = path.join(process.cwd(), "data", "flags.json");

export interface Flag {
  questionId: string;
  reason?: string;
  at: string;
}

export async function readFlags(): Promise<Flag[]> {
  try {
    const text = await fs.readFile(FILE, "utf8");
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeFlags(flags: Flag[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(flags, null, 2));
}

export async function addFlag(questionId: string, reason?: string): Promise<void> {
  const flags = await readFlags();
  const existing = flags.find((f) => f.questionId === questionId);
  if (existing) {
    if (reason) existing.reason = reason;
  } else {
    flags.push({ questionId, reason, at: new Date().toISOString() });
  }
  await writeFlags(flags);
}

export async function removeFlag(questionId: string): Promise<void> {
  const flags = await readFlags();
  await writeFlags(flags.filter((f) => f.questionId !== questionId));
}
