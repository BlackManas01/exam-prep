// Lightweight client-side student identity (no auth in the MVP). The name is
// used as the attempt's candidateName and to look up progress.
const KEY = "examprep_student";

export function getStudentName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY) ?? "";
}

export function setStudentName(name: string): void {
  if (typeof window === "undefined") return;
  const v = name.trim().slice(0, 40);
  if (v) localStorage.setItem(KEY, v);
}
