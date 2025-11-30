"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type {
  Question,
  TechnicalAnswerFeedback,
  Language
} from "@/lib/types";

interface Props {
  sessionId: string;
  question: Question;
  index: number;
  total: number;
  onSubmitted: (payload: {
    code: string;
    language: Language;
    passedTests: number;
    totalTests: number;
    feedback: TechnicalAnswerFeedback;
  }) => void;
}

interface TestResult {
  name: string;
  passed: boolean;
  output: string;
  expected: string;
}

export function TechnicalSection({
  sessionId,
  question,
  index,
  total,
  onSubmitted
}: Props) {
  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState(
    language === "javascript"
      ? "// Write your solution here\n"
      : "# Write your solution here\n"
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [feedback, setFeedback] = useState<TechnicalAnswerFeedback | null>(
    null
  );

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code,
          language,
          questionId: question.id
        })
      });

      if (!res.ok) {
        throw new Error("Failed to run code");
      }

      const data = (await res.json()) as {
        tests: TestResult[];
      };
      setTestResults(data.tests);
    } catch (e) {
      setTestResults([
        {
          name: "Sample test",
          passed: false,
          output: "Runtime error or compilation failure.",
          expected: "See logs on server."
        }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/interview/${sessionId}/code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          questionId: question.id,
          code,
          language
        })
      });

      if (!res.ok) {
        throw new Error("Failed to submit code");
      }

      const data = (await res.json()) as {
        feedback: TechnicalAnswerFeedback;
        passedTests: number;
        totalTests: number;
        tests: TestResult[];
      };
      setFeedback(data.feedback);
      setTestResults(data.tests);
      onSubmitted({
        code,
        language,
        passedTests: data.passedTests,
        totalTests: data.totalTests,
        feedback: data.feedback
      });
    } catch (e) {
      // Keep silent in UI for MVP
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          Technical question {index + 1} of {total}
        </CardTitle>
        <CardDescription>
          Focus on correctness first, then think about efficiency.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-slate-900/80 p-3 text-sm text-slate-100">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Problem
          </div>
          <div className="font-medium">{question.title}</div>
          <p className="mt-1 whitespace-pre-line text-xs text-slate-300">
            {question.body}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  className={
                    language === "javascript"
                      ? "rounded-full bg-brand-500 px-3 py-1 text-white"
                      : "rounded-full bg-slate-800 px-3 py-1 text-slate-200"
                  }
                  onClick={() => setLanguage("javascript")}
                >
                  JavaScript
                </button>
                <button
                  type="button"
                  className={
                    language === "python"
                      ? "rounded-full bg-brand-500 px-3 py-1 text-white"
                      : "rounded-full bg-slate-800 px-3 py-1 text-slate-200"
                  }
                  onClick={() => setLanguage("python")}
                >
                  Python
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/90 p-3 font-mono text-xs text-slate-100 outline-none focus:border-brand-400"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-xs"
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? "Running…" : "Run sample tests"}
              </Button>
              <Button
                type="button"
                className="flex-1 text-xs"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting…" : "Submit answer"}
              </Button>
            </div>
          </div>

          <div className="mt-2 w-full space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-200 md:mt-0 md:w-80">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Sample tests
            </div>
            {testResults.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                Run the sample tests to see how your solution behaves.
              </p>
            ) : (
              <ul className="space-y-2">
                {testResults.map((t) => (
                  <li key={t.name}>
                    <div className="flex items-center justify-between">
                      <span>{t.name}</span>
                      <span
                        className={
                          t.passed ? "text-emerald-300" : "text-rose-300"
                        }
                      >
                        {t.passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      <div>Output: {t.output}</div>
                      <div>Expected: {t.expected}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {feedback && (
              <div className="mt-2 space-y-1 rounded-lg bg-slate-900/80 p-2">
                <div className="flex gap-2 text-[11px]">
                  <span>Correctness: {feedback.correctnessScore}/10</span>
                  <span>Efficiency: {feedback.efficiencyScore}/10</span>
                  <span>Quality: {feedback.qualityScore}/10</span>
                </div>
                <div className="mt-1 grid gap-2 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[11px] font-semibold text-emerald-300">
                      What went well
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-200">
                      {feedback.whatWentWell.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] font-semibold text-amber-300">
                      Improve next time
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-200">
                      {feedback.improveNextTime.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}