import {
  InterviewSession,
  BehavioralAnswer,
  CodeSubmission
} from "./types";

export function computeBehavioralAverageScore(
  answers: BehavioralAnswer[]
): number | null {
  let total = 0;
  let count = 0;

  for (const ans of answers) {
    if (ans.feedback) {
      const avg =
        (ans.feedback.contentScore +
          ans.feedback.structureScore +
          ans.feedback.communicationScore) /
        3;
      total += avg;
      count += 1;
    }
  }

  if (count === 0) return null;
  return (total / count) * 10;
}

export function computeTechnicalAverageScore(
  submissions: CodeSubmission[]
): number | null {
  let total = 0;
  let count = 0;

  for (const sub of submissions) {
    if (sub.feedback) {
      const avg =
        (sub.feedback.correctnessScore +
          sub.feedback.efficiencyScore +
          sub.feedback.qualityScore) /
        3;
      total += avg;
      count += 1;
    }
  }

  if (count === 0) return null;
  return (total / count) * 10;
}

export function computeSessionOverallScore(
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

export function suggestNextPracticeType(params: {
  session: InterviewSession;
  behavioralAverage: number | null;
  technicalAverage: number | null;
}): string {
  const { session, behavioralAverage, technicalAverage } = params;

  if (session.type === "technical") {
    if (technicalAverage != null && technicalAverage < 60) {
      return "More DS/Algo problems at easy/medium level.";
    }
    if (technicalAverage != null && technicalAverage >= 80) {
      return "Try harder DS/Algo or system design style questions.";
    }
    return "Continue with similar technical questions and gradually raise difficulty.";
  }

  if (session.type === "behavioral") {
    if (behavioralAverage != null && behavioralAverage < 60) {
      if (session.personaType === "esl") {
        return "Short, focused behavioral questions to practice English speaking and structure.";
      }
      return "More behavioral questions using the STAR structure.";
    }
    return "Mix in a few technical questions while keeping regular behavioral practice.";
  }

  // Mixed
  if (
    technicalAverage != null &&
    behavioralAverage != null &&
    technicalAverage < behavioralAverage
  ) {
    return "More technical practice with medium difficulty coding questions.";
  }

  if (
    technicalAverage != null &&
    behavioralAverage != null &&
    behavioralAverage < technicalAverage
  ) {
    return "More behavioral/communication practice, especially describing projects with STAR.";
  }

  return "Another mixed session with similar difficulty to strengthen both areas.";
}