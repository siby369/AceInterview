"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BehavioralSection } from "@/components/interview/behavioral-section";
import { TechnicalSection } from "@/components/interview/technical-section";
import type {
  BehavioralAnswerFeedback,
  InterviewSession,
  Question,
  TechnicalAnswerFeedback
} from "@/lib/types";

interface Props {
  session: InterviewSession;
  questions: Question[];
}

export function InterviewClient({ session, questions }: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [behavioralFeedbacks, setBehavioralFeedbacks] = useState<
    Record<string, BehavioralAnswerFeedback>
  >({});
  const [technicalFeedbacks, setTechnicalFeedbacks] = useState<
    Record<string, TechnicalAnswerFeedback>
  >({});
  const [isCompleting, setIsCompleting] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = async () => {
    setIsCompleting(true);
    try {
      await fetch(`/api/interview/${session.id}/complete`, {
        method: "POST"
      });
    } catch (e) {
      // For MVP, ignore errors and still navigate to report.
    } finally {
      setIsCompleting(false);
      router.push(`/report/${session.id}`);
    }
  };

  const onLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="space-y-4">
      {currentQuestion.kind === "behavioral" ? (
        <BehavioralSection
          sessionId={session.id}
          question={currentQuestion}
          index={currentIndex}
          total={questions.length}
          personaType={session.personaType}
          onAnswered={({ feedback }) => {
            setBehavioralFeedbacks((prev) => ({
              ...prev,
              [currentQuestion.id]: feedback
            }));
          }}
        />
      ) : (
        <TechnicalSection
          sessionId={session.id}
          question={currentQuestion}
          index={currentIndex}
          total={questions.length}
          onSubmitted={({ feedback }) => {
            setTechnicalFeedbacks((prev) => ({
              ...prev,
              [currentQuestion.id]: feedback
            }));
          }}
        />
      )}

      <div className="flex flex-col gap-2 text-xs text-slate-300">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="rounded-full border border-slate-700 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={onLastQuestion}
            className="rounded-full border border-slate-700 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleFinish}
            disabled={isCompleting}
            className="rounded-full border border-brand-400 px-4 py-1 text-xs font-medium text-brand-100 hover:bg-brand-500/10 disabled:opacity-60"
          >
            {isCompleting ? "Finishing…" : onLastQuestion ? "Finish & view summary" : "Finish now"}
          </button>
        </div>
      </div>
    </div>
  );
}