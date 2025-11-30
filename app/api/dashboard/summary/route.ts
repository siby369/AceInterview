import { NextResponse } from "next/server";
import {
  getAllSessionsForUser,
  getBehavioralAnswersForSession,
  getCodeSubmissionsForSession
} from "@/lib/store";
import type { InterviewSession } from "@/lib/types";

export async function GET() {
  const userId = "demo-user"; // placeholder until auth is wired
  const sessions = getAllSessionsForUser(userId);

  const sessionSummaries = sessions
    .map((session) => {
      const behavioralAnswers = getBehavioralAnswersForSession(session.id);
      const codeSubs = getCodeSubmissionsForSession(session.id);

      let behavioralTotal = 0;
      let behavioralCount = 0;
      for (const ans of behavioralAnswers) {
        if (ans.feedback) {
          const avg =
            (ans.feedback.contentScore +
              ans.feedback.structureScore +
              ans.feedback.communicationScore) /
            3;
          behavioralTotal += avg;
          behavioralCount += 1;
        }
      }
      const behavioralAverage =
        behavioralCount > 0 ? (behavioralTotal / behavioralCount) * 10 : null;

      let technicalTotal = 0;
      let technicalCount = 0;
      for (const sub of codeSubs) {
        if (sub.feedback) {
          const avg =
            (sub.feedback.correctnessScore +
              sub.feedback.efficiencyScore +
              sub.feedback.qualityScore) /
            3;
          technicalTotal += avg;
          technicalCount += 1;
        }
      }
      const technicalAverage =
        technicalCount > 0 ? (technicalTotal / technicalCount) * 10 : null;

      const overallScore = computeOverallScore(
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

function computeOverallScore(
  session: InterviewSession,
  behavioralAverage: number | null,
  technicalAverage: number | null
): number | null {
  if (!behavioralAverage && !technicalAverage) {
    return null;
  }

  const type = session.type;
  if (type === "technical") {
    const tech = technicalAverage ?? 0;
    const beh = behavioralAverage ?? tech;
    return 0.8 * tech + 0.2 * beh;
  }

  if (type === "behavioral") {
    const beh = behavioralAverage ?? 0;
    const tech = technicalAverage ?? beh;
    return 0.8 * beh + 0.2 * tech;
  }

  const tech = technicalAverage ?? 0;
  const beh = behavioralAverage ?? 0;
  return 0.5 * tech + 0.5 * beh;
}