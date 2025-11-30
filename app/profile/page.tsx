"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type PersonaType = "student" | "bootcamp" | "esl";
type InterviewType = "technical" | "behavioral" | "mixed";

interface ProfilePayload {
  roleTarget: string | null;
  experience: string | null;
  personaType: PersonaType | null;
  preferredInterviewType: InterviewType | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState<ProfilePayload>({
    roleTarget: null,
    experience: null,
    personaType: null,
    preferredInterviewType: null
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    setForm({
      roleTarget: (session.user.roleTarget as string | null) ?? null,
      experience: (session.user.experience as string | null) ?? null,
      personaType: (session.user.personaType as PersonaType | null) ?? null,
      preferredInterviewType:
        (session.user.preferredInterviewType as InterviewType | null) ?? null
    });
  }, [session?.user]);

  const handleChange = (
    key: keyof ProfilePayload,
    value: string | null
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!session?.user) {
      await signIn("google");
      return;
    }

    setLoading(true);
    setSaved(false);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-400">
        Loading your profile…
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-lg font-semibold text-slate-50">
          Save your interview preferences
        </h1>
        <p className="mt-2 max-w-md text-xs text-slate-400">
          Sign in to remember your persona, target role, and preferred interview type
          across sessions.
        </p>
        <Button
          className="mt-4 px-4 py-2 text-sm"
          onClick={() => signIn("google", { callbackUrl: "/profile" })}
        >
          Continue with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">
          Interview preferences
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          These defaults will pre-fill your mock interview setup so you can start
          practicing faster.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Persona &amp; experience</CardTitle>
          <CardDescription>
            Who you are and roughly where you are in your journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-300">Persona</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: "student", label: "CS / IT student" },
                { id: "bootcamp", label: "Bootcamp / self‑taught" },
                { id: "esl", label: "ESL learner" }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    handleChange("personaType", p.id as PersonaType)
                  }
                  className={
                    form.personaType === p.id
                      ? "rounded-full bg-brand-500 px-3 py-1 text-slate-950"
                      : "rounded-full bg-slate-900 px-3 py-1 text-slate-200"
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-300">
              Experience
            </div>
            <select
              value={form.experience ?? ""}
              onChange={(e) =>
                handleChange("experience", e.target.value || null)
              }
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand-400"
            >
              <option value="">Select...</option>
              <option value="student">Student / fresher</option>
              <option value="0-1">0–1 years</option>
              <option value="1-3">1–3 years</option>
              <option value="3+">3+ years</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target role &amp; interview type</CardTitle>
          <CardDescription>
            What you&apos;re aiming for and how you prefer to practice.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-300">
              Target role
            </div>
            <select
              value={form.roleTarget ?? ""}
              onChange={(e) =>
                handleChange("roleTarget", e.target.value || null)
              }
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-brand-400"
            >
              <option value="">Select...</option>
              <option value="SDE">SDE / Backend</option>
              <option value="Web Dev">Web Developer / Frontend</option>
              <option value="Data">Data / ML</option>
            </select>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-300">
              Preferred interview type
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: "technical", label: "Technical" },
                { id: "behavioral", label: "Behavioral" },
                { id: "mixed", label: "Mixed" }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    handleChange(
                      "preferredInterviewType",
                      t.id as InterviewType
                    )
                  }
                  className={
                    form.preferredInterviewType === t.id
                      ? "rounded-full bg-brand-500 px-3 py-1 text-slate-950"
                      : "rounded-full bg-slate-900 px-3 py-1 text-slate-200"
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 text-sm"
        >
          {loading ? "Saving…" : "Save preferences"}
        </Button>
        {saved && (
          <span className="text-[11px] text-emerald-400">
            Saved. Your next mock interview will use these defaults.
          </span>
        )}
      </div>
    </div>
  );
}