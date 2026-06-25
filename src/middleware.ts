import { clerkMiddleware } from "@clerk/nextjs/server";

// Enables Clerk auth across the app. Admin-route protection is enforced in
// src/app/admin/layout.tsx (server-side, where the user's email is available).
export default clerkMiddleware();

export const config = {
  matcher: [
    // Run on everything except Next internals and static files…
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // …and always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
