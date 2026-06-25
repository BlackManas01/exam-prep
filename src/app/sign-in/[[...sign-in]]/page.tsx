import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-6">
      <Link href="/" className="mb-4 text-sm text-slate-500 hover:underline">
        ← Back to home
      </Link>
      <SignIn />
    </main>
  );
}
