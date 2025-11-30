import { NextResponse } from "next/server";
import { NextResponse } from "next/server";
import {
  getAllSessionsForUser,
  getBehavioralAnswersForSession,
  getCodeSubmissionsForSession
} from "@/lib/store";
import {
  computeBehavioralAverageScore,
  computeSessionOverallScore,
  computeTechnicalAverageScore
} from "@/lib/scoring";

export async function GET() {
  const userId = "demo-user"; // placeholder until auth is wired
  const sessions = getAllSessionsForUser(userId);

  const sessionSummaries = sessions
    .map((session) => {
      const behavioralAnswers = getBehavioralAnswersForSession(session.id);
      const codeSubs = getCodeSubmissionsForSession(session.id);

      const behavioralAverage = computeBehavioralAverageScore(behavioralAnswers);
      const technicalAverage = computeTechnicalAverageScore(codeSubs);
      const overallScore = computeSessionOverallScore(
        session,
        behavioralAverage,
        technicalAverage
      );

      return {
        session,
        behavioralAverage,
        technicalAverage,
        overallScore
      };
    })
    .sort(
      (a, b) =>
        new Date(b.session.startedAt).getTime() -
        new Date(a.session.startedAt).getTime()
    );

  const totalInterviews = sessionSummaries.length;
  const overallScores = sessionSummaries
    .map((s) => s.overallScore)
    .filter((s): s is number => s != null);

  const averageScore =
    overallScores.length > 0
      ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length
      : null;

  const technicalScores = sessionSummaries
    .map((s) => s.technicalAverage)
    .filter((s): s is number => s != null);
  const behavioralScores = sessionSummaries
    .map((s) => s.behavioralAverage)
    .filter((s): s is number => s != null);

  const technicalAverage =
    technicalScores.length > 0
      ? technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length
      : null;
  const behavioralAverage =
    behavioralScores.length > 0
      ? behavioralScores.reduce((a, b) => a + b, 0) / behavioralScores.length
      : null;

  const sessionsPayload = sessionSummaries.slice(0, 3).map((s, index, arr) => {
    const prev = index < arr.length - 1 ? arr[index + 1] : null;
    let trend: "improved" | "dropped" | "same" = "same";
    if (prev && s.overallScore != null && prev.overallScore != null) {
      if (s.overallScore > prev.overallScore + 2) trend = "improved";
      else if (s.overallScore < prev.overallScore - 2) trend = "dropped";
    }

    return {
      id: s.session.id,
      date: s.session.startedAt,
      type: s.session.type,
      score: s.overallScore,
      trend
    };
  });

  return NextResponse.json({
    totalInterviews,
    averageScore,
    breakdown: {
      technicalAverage,
      behavioralAverage
    },
    sessions: sessionsPayload
  });
}