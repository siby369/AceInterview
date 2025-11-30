import {
  BehavioralAnswerFeedback,
  Difficulty,
  InterviewType,
  PersonaType,
  Question,
  TechnicalAnswerFeedback
} from "./types";

interface EvaluateBehavioralParams {
  transcript: string;
  question: Question;
  personaType: PersonaType;
  difficulty: Difficulty;
}

interface EvaluateTechnicalParams {
  code: string;
  question: Question;
  language: string;
  difficulty: Difficulty;
  passedTests: number;
  totalTests: number;
}

export async function evaluateBehavioralAnswer(
  params: EvaluateBehavioralParams
): Promise<BehavioralAnswerFeedback> {
  const { transcript, question, personaType } = params;

  // Simple heuristic fallback if Gemini is not configured.
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const hasExample = /for example|for instance|one time|once/i.test(transcript);
  const mentionsResult = /result|outcome|impact|improved|increased|reduced/i.test(
    transcript
  );

  let baseContent = Math.min(10, Math.floor(wordCount / 20) + (hasExample ? 2 : 0));
  let structure = hasExample && mentionsResult ? 8 : 5;
  let communication = Math.min(9, Math.floor(wordCount / 25) + 4);

  if (!transcript.trim()) {
    baseContent = 1;
    structure = 1;
    communication = 1;
  }

  // ESL learners: be extra encouraging on communication.
  if (personaType === "esl") {
    communication = Math.max(communication, 7);
  }

  const feedback: BehavioralAnswerFeedback = {
    contentScore: clampScore(baseContent),
    structureScore: clampScore(structure),
    communicationScore: clampScore(communication),
    whatWentWell: [
      "You attempted to answer the question directly.",
      hasExample
        ? "You supported your answer with at least one concrete example."
        : "You can build on this by adding a specific example from your experience."
    ],
    improveNextTime: [
      "Use a clear structure like STAR (Situation, Task, Action, Result).",
      mentionsResult
        ? "You mentioned the outcome; next time, add more measurable details if possible."
        : "Try to end your answer by clearly stating the outcome or result."
    ]
  };

  if (personaType === "esl") {
    feedback.languageFeedback = {
      pronunciationTips: [
        "Slow down slightly; a calm pace often makes your speech clearer.",
        "Emphasize key words in your answer, like the technology or result."
      ],
      grammarTips: [
        "Focus on using simple, short sentences rather than long complex ones.",
        "It is okay to pause briefly to think; this is normal in real interviews."
      ]
    };
  }

  // In a real deployment, attempt a Gemini call here and fall back to this heuristic.
  // For now this is the main implementation to keep the vertical slice working.
  return feedback;
}

export async function evaluateTechnicalAnswer(
  params: EvaluateTechnicalParams
): Promise<TechnicalAnswerFeedback> {
  const { code, question, difficulty, passedTests, totalTests } = params;

  const passRatio = totalTests > 0 ? passedTests / totalTests : 0;
  let correctness = Math.round(passRatio * 10);

  let efficiencyBase = 5;
  if (/for\s*\(.*for\s*\(/.test(code) || /while\s*\(.*while\s*\(/.test(code)) {
    efficiencyBase = 4;
  }
  if (/sort\s*\(/.test(code)) {
    efficiencyBase += 1;
  }

  let qualityBase = 5;
  if (/function\s+[a-zA-Z]/.test(code) || /const\s+[a-zA-Z].*=>/.test(code)) {
    qualityBase += 1;
  }
  if (/\/\/|\/\*/.test(code)) {
    qualityBase += 1;
  }

  if (difficulty === "hard") {
    efficiencyBase = Math.min(efficiencyBase, 8);
    qualityBase = Math.min(qualityBase, 8);
  }

  const feedback: TechnicalAnswerFeedback = {
    correctnessScore: clampScore(correctness),
    efficiencyScore: clampScore(efficiencyBase),
    qualityScore: clampScore(qualityBase),
    whatWentWell: [
      passRatio === 1
        ? "Your solution passed all the sample tests."
        : passRatio > 0
        ? "Your solution passed some of the sample tests."
        : "You attempted a solution and can now iterate from here.",
      "Your code compiles and follows a basic structure."
    ],
    improveNextTime: [
      passRatio < 1
        ? "Re-check edge cases and think about empty inputs or large values."
        : "Consider how your solution behaves on very large inputs.",
      "Try to add small comments or clearer variable names to improve readability."
    ]
  };

  return feedback;
}

export interface GeneratedSessionQuestions {
  questions: Question[];
}

export async function generateSessionQuestions(params: {
  interviewType: InterviewType;
  difficulty: Difficulty;
  roleTarget: string;
  personaType: PersonaType;
  count: number;
  seedQuestions: Question[];
}): Promise<GeneratedSessionQuestions> {
  // For now, we simply return the provided seed questions (already filtered)
  // but this is the hook where Gemini + your historical dataset would refine
  // or rephrase questions.
  return {
    questions: params.seedQuestions
  };
}

function clampScore(score: number): number {
  if (Number.isNaN(score)) return 1;
  if (score < 0) return 0;
  if (score > 10) return 10;
  return score;
}