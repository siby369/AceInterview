import { NextResponse } from "next/server";
import {
  getBehavioralAnswersForSession,
  getCodeSubmissionsForSession,
  getSession,
  updateSession
} from "@/lib/store";
import {
  computeBehavioralAverageScore,
  computeSessionOverallScore,
  computeTechnicalAverageScore
} from "@/lib/scoring";

interface Params {
  params: {
    sessionId: string;
  };
}

export async function POST(_req: Request, { params }: Params) {
  const session = getSession(params.sessionId);
  if (!session) {
    return new NextResponse("Session not found", { status: 404 });
  }

  const behavioralAnswers = getBehavioralAnswersForSession(session.id);
  const codeSubs = getCodeSubmissionsForSession(session.id);

  const behavioralAverage = computeBehavioralAverageScore(behavioralAnswers);
  const technicalAverage = computeTechnicalAverageScore(codeSubs);
  const overallScore = computeSessionOverallScore(
    session,
    behavioralAverage,
    technicalAverage
  );

  const updated = {
    ...session,
    status: "completed" as const,
    finishedAt: new Date().toISOString(),
    overallScore: overallScore ?? session.overallScore
  };

  updateSession(updated);

  return NextResponse.json({
    overallScore: updated.overallScore,
    behavioralAverage,
    technicalAverage
  });
}