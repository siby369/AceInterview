"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-6 py-8 shadow-lg">
        <h1 className="text-lg font-semibold text-slate-50">
          Sign in to your practice workspace
        </h1>
        <p className="mt-2 max-w-md text-xs text-slate-400">
          Save your interview sessions, track your progress, and sync your preferred persona
          across devices.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full justify-center px-4 py-2 text-sm"
          >
            {loading ? "Opening Google…" : "Continue with Google"}
          </Button>
        </div>
      </div>
      <p className="max-w-md text-[11px] text-slate-500">
        We only use your email to create your account and sync your settings. You can practice
        interviews as much as you like — no spam, no surprise charges.
      </p>
    </div>
  );
}