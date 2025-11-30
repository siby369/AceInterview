"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { BehavioralAnswerFeedback, Question } from "@/lib/types";

interface Props {
  sessionId: string;
  question: Question;
  index: number;
  total: number;
  personaType: string;
  onAnswered: (payload: {
    transcript: string;
    feedback: BehavioralAnswerFeedback;
  }) => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognition;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    SpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function BehavioralSection({
  sessionId,
  question,
  index,
  total,
  personaType,
  onAnswered
}: Props) {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<BehavioralAnswerFeedback | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setTranscript("");
    setFeedback(null);
    stopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const startRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionImpl =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      // Browser doesn't support Web Speech API; fall back to manual typing.
      return;
    }

    const recognizer = new SpeechRecognitionImpl();
    recognizer.lang = "en-US";
    recognizer.continuous = true;
    recognizer.interimResults = true;

    recognizer.onresult = (event: SpeechRecognitionEvent) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognizer.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognizer;
    recognizer.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/interview/${sessionId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          questionId: question.id,
          transcript,
          personaType
        })
      });

      if (!res.ok) {
        throw new Error("Failed to submit answer");
      }

      const data = (await res.json()) as {
        feedback: BehavioralAnswerFeedback;
      };
      setFeedback(data.feedback);
      onAnswered({ transcript, feedback: data.feedback });
    } catch (error) {
      // For MVP, we quietly fail; UI is kept simple.
    } finally {
      setIsSubmitting(false);
    }
  };

  const canUseSpeechApi =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          Behavioral question {index + 1} of {total}
        </CardTitle>
        <CardDescription>
          Low-pressure practice. You can always re-record.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-slate-900/80 p-3 text-sm text-slate-100">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Question
          </div>
          <div className="font-medium">{question.title}</div>
          <p className="mt-1 whitespace-pre-line text-xs text-slate-300">
            {question.body}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Your answer
            </span>
            {canUseSpeechApi && (
              <Button
                type="button"
                variant={isRecording ? "outline" : "primary"}
                onClick={isRecording ? stopRecording : startRecording}
                className="h-8 px-3 text-xs"
              >
                {isRecording ? "Stop recording" : "Press mic & start speaking"}
              </Button>
            )}
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            placeholder={
              canUseSpeechApi
                ? "Your transcript will appear here. You can also type or edit it."
                : "Your browser does not support speech recognition. Type your answer here."
            }
            className="w-full rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-sm text-slate-100 outline-none focus:border-brand-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !transcript.trim()}
            className="w-full text-sm"
          >
            {isSubmitting ? "Evaluating…" : "Submit answer for feedback"}
          </Button>
          <button
            type="button"
            className="text-xs text-slate-400 underline-offset-2 hover:underline"
            onClick={() => {
              setTranscript("");
              setFeedback(null);
              stopRecording();
            }}
          >
            Reset and record again
          </button>
        </div>

        {feedback && (
          <div className="mt-2 space-y-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
            <div className="flex gap-3 text-[11px] text-slate-200">
              <span>Content: {feedback.contentScore}/10</span>
              <span>Structure: {feedback.structureScore}/10</span>
              <span>Communication: {feedback.communicationScore}/10</span>
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
            {feedback.languageFeedback && (
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {feedback.languageFeedback.pronunciationTips && (
                  <div>
                    <div className="mb-1 text-[11px] font-semibold text-sky-300">
                      Pronunciation tips
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-200">
                      {feedback.languageFeedback.pronunciationTips.map(
                        (t, i) => (
                          <li key={i}>• {t}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {feedback.languageFeedback.grammarTips && (
                  <div>
                    <div className="mb-1 text-[11px] font-semibold text-sky-300">
                      Grammar tips
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-200">
                      {feedback.languageFeedback.grammarTips.map((t, i) => (
                        <li key={i}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}