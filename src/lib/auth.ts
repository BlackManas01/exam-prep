import { auth, currentUser } from "@clerk/nextjs/server";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

/** Lower-cased list of admin emails from the ADMIN_EMAILS env var. */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns the signed-in Clerk user mapped to our SessionUser shape, or null.
 * `id` is the Clerk user id (stored on Attempt.userId).
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  if (!user) return null;
  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    "";
  const name =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    email.split("@")[0] ||
    "User";
  return { id: userId, email, name };
}

/** True when the signed-in user's email is listed in ADMIN_EMAILS. */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || !user.email) return false;
  return adminEmails().includes(user.email.toLowerCase());
}

/**
 * Authorize an admin API request. Passes when EITHER the caller is a signed-in
 * admin (Clerk session) OR sends a valid `x-admin-key` header — the latter lets
 * local CLI scripts (bulk generation) keep working without a browser session.
 */
export async function isAdminRequest(req: Request): Promise<boolean> {
  const expected = process.env.ADMIN_KEY;
  const key = req.headers.get("x-admin-key");
  if (expected && key && key === expected) return true;
  return isAdmin();
}
