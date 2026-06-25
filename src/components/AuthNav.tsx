"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

// Small auth widget for the home hero: shows login/signup when logged out, or
// the user's name + logout (and an Admin link for admins) when logged in.
export default function AuthNav() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setIsAdmin(false);
      return;
    }
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setIsAdmin(Boolean(d.isAdmin)))
      .catch(() => setIsAdmin(false));
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) return <div className="h-9" />;

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3 text-sm text-white">
        <span className="text-slate-300">
          Hi,{" "}
          <span className="font-semibold text-white">
            {user?.firstName || user?.fullName || "there"}
          </span>
        </span>
        {isAdmin && (
          <Link href="/admin" className="text-amber-300 hover:underline">
            Admin
          </Link>
        )}
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="text-blue-300 hover:underline"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/sign-in"
        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-examnavy transition hover:bg-slate-100"
      >
        Log in
      </Link>
      <Link
        href="/sign-up"
        className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        Sign up free
      </Link>
    </div>
  );
}
