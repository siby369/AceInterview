"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/components/utils";
import type { Difficulty, InterviewType, PersonaType } from "@/lib/types";

const INTERVIEW_TYPES: { id: InterviewType; label: string; description: string }[] = [
  {
    id: "technical",
    label: "Technical",
    description: "Coding and system design style questions."
  },
  {
    id: "behavioral",
    label: "Behavioral",
    description: "Voice-based HR and communication questions."
  },
  {
    id: "mixed",
    label: "Mixed",
    description: "Blend of coding and behavioral practice."
  }
];

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const DURATIONS = [15, 30, 45];

const PERSONA_GOALS: { id: PersonaType; label: string; helper: string }[] = [
  {
    id: "student",
    label: "CS / IT final-year",
    helper: "Focus on DSA + HR for campus placements."
  },
  {
    id: "bootcamp",
    label: "Bootcamp / self‑taught dev",
    helper: "Realistic web/backend questions."
  },
  {
    id: "esl",
    label: "ESL learner",
    helper: "Low-pressure English speaking practice."
  }
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [interviewType, setInterviewType] = useState<InterviewType>("mixed");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [duration, setDuration] = useState<number>(30);
  const [roleTarget, setRoleTarget] = useState<string>("SDE");
  const [personaType, setPersonaType] = useState<PersonaType>("student");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    if (session.user.preferredInterviewType) {
      setInterviewType(session.user.preferredInterviewType as InterviewType);
    }
    if (session.user.personaType) {
      setPersonaType(session.user.personaType as PersonaType);
    }
    if (session.user.roleTarget) {
      setRoleTarget(session.user.roleTarget);
    }
  }, [session?.user]);

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/create", {
        method: "POST",
        body: JSON.stringify({
          type: interviewType,
          difficulty,
          durationMin: duration,
          roleTarget,
          personaType
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error("Failed to create session");
      }

      const data = (await res.json()) as { sessionId: string };
      router.push(`/interview/live/${data.sessionId}`);
    } catch (e) {
      setError("Could not start interview. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Set up your mock interview</h1>
        <p className="mt-1 text-sm text-slate-400">
          Simple, friendly setup. You can adjust anything later — this is just to tailor questions
          to you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1.4fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview type</CardTitle>
              <CardDescription>
                Choose what you want to focus on today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {INTERVIEW_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setInterviewType(t.id)}
                    className={cn(
                      "flex flex-col rounded-2xl border px-3 py-3 text-left text-sm transition",
                      interviewType === t.id
                        ? "border-brand-400 bg-slate-900 text-slate-50 shadow-sm"
                        : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-600"
                    )}
                  >
                    <span className="font-medium">{t.label}</span>
                    <span className="mt-1 text-xs text-slate-400">
                      {t.description}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Difficulty & duration</CardTitle>
              <CardDescription>
                Start easy and move up as your confidence grows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Difficulty
                </div>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium capitalize",
                        difficulty === level
                          ? "bg-brand-500 text-white"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Duration
                </div>
                <div className="flex gap-2">
                  {DURATIONS.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setDuration(minutes)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        duration === minutes
                          ? "bg-brand-500 text-white"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      )}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Target role</CardTitle>
              <CardDescription>
                This helps choose relevant questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex flex-col gap-1 text-xs text-slate-300">
                Role
                <select
                  value={roleTarget}
                  onChange={(e) => setRoleTarget(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:border-brand-400"
                >
                  <option value="SDE">SDE / Backend</option>
                  <option value="Web Dev">Web Developer / Frontend</option>
                  <option value="Data">Data / ML</option>
                </select>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your main goal</CardTitle>
              <CardDescription>
                We tune difficulty and feedback style based on this.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {PERSONA_GOALS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersonaType(p.id)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left text-xs transition",
                      personaType === p.id
                        ? "border-brand-400 bg-slate-900 text-slate-50"
                        : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-600"
                    )}
                  >
                    <div className="font-medium">{p.label}</div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      {p.helper}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <Button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full py-2 text-sm"
            >
              {isStarting ? "Starting…" : "Start interview"}
            </Button>
            <p className="text-[11px] text-slate-500">
              This is just practice. You can always reset and try again — the goal is steady
              improvement, not perfection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}