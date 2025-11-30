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
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#1e293b_0,_#020617_50%,_#000000_100%)]" />
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
          <header className="mb-8 flex justify-center">
            <div className="pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.7)] backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-brand-300 text-xs font-bold text-slate-950 shadow-md">
                  AI
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-slate-50">
                    Interview Coach
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Practice without the pressure.
                  </div>
                </div>
              </div>
              <nav className="hidden items-center gap-5 text-xs font-medium text-slate-300 md:flex">
                <a href="/#features" className="transition hover:text-slate-50">
                  Features
                </a>
                <a href="/#personas" className="transition hover:text-slate-50">
                  Personas
                </a>
                <a href="/#how-it-works" className="transition hover:text-slate-50">
                  How it works
                </a>
              </nav>
              <div className="flex items-center gap-2 text-xs">
                <a
                  href="/dashboard"
                  className="hidden rounded-full px-3 py-1 text-slate-300 hover:text-slate-50 md:inline-block"
                >
                  Dashboard
                </a>
                <a
                  href="/interview/setup"
                  className="rounded-full bg-slate-50 px-3 py-1 font-semibold text-slate-900 shadow-sm transition hover:bg-slate-200"
                >
                  Start for free
                </a>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-10 border-t border-slate-800 pt-4 text-xs text-slate-500">
            Built for students, bootcamp devs, and ESL learners. Practice interviews, not perfection.
          </footer>
        </div>
      </body>
    </html>
  );
}