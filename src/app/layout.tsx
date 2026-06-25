import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExamPrep — Govt Exam Mock Tests",
  description:
    "AI-powered mock test platform simulating SSC CGL, SSC CHSL, IBPS PO, RRB NTPC and UPSC Prelims.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}

