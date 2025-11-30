import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-6 shadow-lg">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-300">
          AI Mock Interview Coach
        </div>
        <h1 className="mb-3 text-2xl font-semibold text-slate-50">
          Practice real interview scenarios,{" "}
          <span className="text-brand-300">without the pressure.</span>
        </h1>
        <p className="max-w-xl text-sm text-slate-300">
          Tailored mock interviews for final-year CS students, bootcamp grads, and ESL learners.
          Get coding, behavioral, and communication feedback in one place.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href="/interview/setup">
            <Button>Start a practice interview</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">View my progress</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>CS / IT Students</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Practice DSA + HR-style questions for campus placements. Friendly feedback that
              builds confidence, not anxiety.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bootcamp / Self‑Taught</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Real-feeling coding and system design prompts so you can practice like it&apos;s a real
              web/backend interview.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ESL Learners</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Low-pressure behavioral practice. Improve fluency, structure, and pronunciation with
              gentle feedback.
            </CardDescription>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}