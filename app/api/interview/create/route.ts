import { NextResponse } from "next/server";
import { pickQuestions } from "@/lib/questions";
import {
  createSession
} from "@/lib/store";
import type {
  Difficulty,
  InterviewSession,
  InterviewType,
  PersonaType
} from "@/lib/types";
import { generateSessionQuestions } from "@/lib/ai";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    type: InterviewType;
    difficulty: Difficulty;
    durationMin: number;
    roleTarget: string;
    personaType: PersonaType;
  };

  const {
    type,
    difficulty,
    durationMin,
    roleTarget,
    personaType
  } = body;

  const baseUserId = "demo-user"; // placeholder until auth is wired

  const seed = pickQuestions({
    interviewType: type,
    difficulty,
    roleTarget,
    personaType,
    count: 6
  });

  const generated = await generateSessionQuestions({
    interviewType: type,
    difficulty,
    roleTarget,
    personaType,
    count: seed.length,
    seedQuestions: seed
  });

  const sessionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const session: InterviewSession = {
    id: sessionId,
    userId: baseUserId,
    type,
    difficulty,
    durationMin,
    roleTarget,
    personaType,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    questionIds: generated.questions.map((q) => q.id)
  };

  createSession(session);

  return NextResponse.json({ sessionId });
}