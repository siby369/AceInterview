"use client";

import { useState } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [behavioralFeedbacks, setBehavioralFeedbacks] = useState<
    Record<string, BehavioralAnswerFeedback>
  >({});
  const [technicalFeedbacks, setTechnicalFeedbacks] = useState<
    Record<string, TechnicalAnswerFeedback>
  >({});

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

      <div className="flex items-center justify-between text-xs text-slate-300">
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
          disabled={currentIndex === questions.length - 1}
          className="rounded-full border border-slate-700 px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}