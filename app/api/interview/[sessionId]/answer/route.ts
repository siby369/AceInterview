import { NextResponse } from "next/server";
import { evaluateBehavioralAnswer } from "@/lib/ai";
import {
  addBehavioralAnswer,
  getQuestion,
  getSession,
  updateSession
} from "@/lib/store";
import type { PersonaType } from "@/lib/types";

interface Params {
  params: {
    sessionId: string;
  };
}

export async function POST(req: Request, { params }: Params) {
  const session = getSession(params.sessionId);
  if (!session) {
    return new NextResponse("Session not found", { status: 404 });
  }

  const body = (await req.json()) as {
    questionId: string;
    transcript: string;
    personaType?: PersonaType;
  };

  const question = getQuestion(body.questionId);
  if (!question) {
    return new NextResponse("Question not found", { status: 404 });
  }

  const feedback = await evaluateBehavioralAnswer({
    transcript: body.transcript,
    question,
    personaType: body.personaType ?? session.personaType,
    difficulty: session.difficulty
  });

  const answerId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  addBehavioralAnswer({
    id: answerId,
    sessionId: session.id,
    questionId: question.id,
    transcript: body.transcript,
    feedback,
    createdAt: new Date().toISOString()
  });

  // For now we update session status to completed only when called explicitly elsewhere.
  updateSession(session);

  return NextResponse.json({ feedback });
}