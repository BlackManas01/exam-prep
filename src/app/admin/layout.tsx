import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth";

// Server-side gate for every /admin page. Non-admins never see admin UI.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!(await isAdmin())) redirect("/");
  return <>{children}</>;
}
