import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { InterviewSession, Question } from "@/lib/types";
import { InterviewClient } from "@/components/interview/interview-client";

async function fetchSession(
  sessionId: string
): Promise<{ session: InterviewSession; questions: Question[] } | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/interview/${sessionId}`, {
    cache: "no-store"
  }).catch(() => null);
  if (!res || !res.ok) {
    return null;
  }
  return (await res.json()) as {
    session: InterviewSession;
    questions: Question[];
  };
}

interface LiveInterviewProps {
  params: { sessionId: string };
}

export default async function LiveInterview({ params }: LiveInterviewProps) {
  const data = await fetchSession(params.sessionId);

  if (!data) {
    notFound();
  }

  const { session, questions } = data;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">
            Live mock interview
          </h1>
          <p className="text-sm text-slate-400">
            Type: <span className="capitalize">{session.type}</span> • Difficulty:{" "}
            <span className="capitalize">{session.difficulty}</span> • Duration:{" "}
            {session.durationMin} min
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge>Role: {session.roleTarget}</Badge>
          <Badge>Goal: {session.personaType}</Badge>
        </div>
      </header>

      {questions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No questions available</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              There was an issue fetching questions. Please go back and start a new session.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <InterviewClient session={session} questions={questions} />
      )}
    </div>
  );
}