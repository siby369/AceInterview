"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const personas = [
  {
    title: "CS / IT final‑year",
    subtitle: "Campus placements",
    body: "DSA drills + HR questions tuned for campus interviews.",
    tag: "Student"
  },
  {
    title: "Bootcamp / self‑taught",
    subtitle: "Web & backend roles",
    body: "Real-feeling coding and system design prompts.",
    tag: "Web / Backend"
  },
  {
    title: "ESL learner",
    subtitle: "English speaking",
    body: "Low-pressure voice practice with gentle feedback.",
    tag: "ESL"
  }
];

export default function HomePage() {
  return (
    <div className="relative flex flex-col gap-12 pb-16">
      <HeroSection />
      <PersonasSection />
      <HowItWorksSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950/70 px-5 py-10 shadow-[0_24px_60px_rgba(15,23,42,0.85)]">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute -top-40 -left-32 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          The AI Interview Practice Workspace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
          Practice interviews like the real thing,
          <span className="block text-[2.05rem] font-semibold text-slate-300 md:text-[2.4rem]">
            without burning out.
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-[15px]">
          One workspace for technical, behavioral, and English-speaking practice. Designed
          for final-year students, bootcamp devs, and ESL learners who want a calm way to
          get interview-ready.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          className="mt-7 w-full max-w-2xl"
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-left text-sm text-slate-200 shadow-inner backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px]">
                ?
              </span>
              <span>What do you want to practice today?</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-slate-200">
                DSA mock round
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-slate-200">
                Behavioral (STAR) answers
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-slate-200">
                English fluency &amp; pronunciation
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link href="/interview/setup">
              <Button className="px-5 py-2 text-sm">
                Start a 15-minute session
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="px-4 py-2 text-xs">
                View my progress
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
        className="pointer-events-none mt-10 flex flex-col items-center gap-3 md:flex-row md:justify-center"
      >
        <FloatingBubble
          className="md:-translate-y-2"
          text="Need to warm up for tomorrow’s DSA round."
        />
        <FloatingBubble
          className="md:translate-y-3"
          text="Let’s do 3 medium questions and 2 behavioral answers."
          variant="secondary"
        />
        <FloatingBubble
          className="md:-translate-y-1"
          text="Perfect. I’ll coach you gently, no harsh feedback."
          variant="accent"
        />
      </motion.div>
    </section>
  );
}

function FloatingBubble({
  text,
  variant = "primary",
  className
}: {
  text: string;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
}) {
  const base =
    "inline-flex max-w-xs items-center rounded-full px-4 py-2 text-[11px] shadow-lg backdrop-blur";
  const styles =
    variant === "primary"
      ? "bg-slate-900/90 text-slate-50 border border-slate-700"
      : variant === "secondary"
      ? "bg-slate-900/70 text-slate-100 border border-slate-700/70"
      : "bg-brand-500 text-slate-950 border border-brand-400";
  return (
    <motion.div
      className={`${base} ${styles} ${className ?? ""}`}
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span>{text}</span>
    </motion.div>
  );
}

function PersonasSection() {
  return (
    <section id="personas" className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
          Built for your path
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Choose the practice style that fits you today. Switch personas any time.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {personas.map((p, index) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.05 * index, duration: 0.45, ease: "easeOut" }}
          >
            <Card className="h-full overflow-hidden border-slate-800 bg-slate-950/80 shadow-md transition hover:-translate-y-1.5 hover:border-slate-500 hover:shadow-[0_18px_40px_rgba(15,23,42,0.9)]">
              <CardHeader>
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {p.tag}
                </div>
                <CardTitle>{p.title}</CardTitle>
                <p className="text-xs text-slate-400">{p.subtitle}</p>
              </CardHeader>
              <CardContent>
                <CardDescription>{p.body}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="mt-2 rounded-3xl border border-slate-900 bg-slate-950/70 p-6 text-sm text-slate-200"
    >
      <div className="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-50">
            Here&apos;s what you can get done in a week.
          </h2>
          <p className="text-xs text-slate-400">
            Short, repeatable practice that stacks up to real confidence.
          </p>
        </div>
        <div className="flex gap-2 text-[11px] text-slate-400">
          <span className="rounded-full bg-slate-900 px-3 py-1">Today</span>
          <span className="rounded-full bg-slate-900 px-3 py-1">3 Days In</span>
          <span className="rounded-full bg-slate-900 px-3 py-1">Week In</span>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <StepCard
          title="Get started"
          items={[
            "Set your persona and target role.",
            "Run a 15-minute warm-up interview.",
            "Review gentle feedback, not harsh scores."
          ]}
        />
        <StepCard
          title="Get moving"
          items={[
            "Mix coding + behavioral sessions.",
            "Track your scores without obsessing over them.",
            "Refine your answers with structured prompts."
          ]}
        />
        <StepCard
          title="Feel ready"
          items={[
            "Simulate real on-site interviews.",
            "Spot patterns in your strengths and gaps.",
            "Walk into interviews feeling prepared, not perfect."
          ]}
        />
      </div>
    </section>
  );
}

function StepCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
      <h3 className="mb-2 text-sm font-semibold text-slate-50">{title}</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-[3px] h-3 w-3 rounded-full border border-slate-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}