import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Mock Interview Coach",
  description:
    "Practice technical and behavioral interviews with AI tailored to students, bootcamp grads, and ESL learners."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold">
                AI
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">
                  Interview Coach
                </div>
                <div className="text-xs text-slate-400">
                  Practice. Improve. Get confident.
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
            Built for students, self-taught devs, and ESL learners.
          </footer>
        </div>
      </body>
    </html>
  );
}