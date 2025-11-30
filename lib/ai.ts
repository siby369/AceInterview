import {
  BehavioralAnswerFeedback,
  Difficulty,
  InterviewType,
  PersonaType,
  Question,
  TechnicalAnswerFeedback
} from "./types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL =
  process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

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
  const heuristic = buildBehavioralHeuristic(params);

  if (!GEMINI_API_KEY) {
    return heuristic;
  }

  try {
    const aiFeedback = await callGeminiBehavioral(params);
    if (aiFeedback) {
      return aiFeedback;
    }
  } catch {
    // Swallow and fall back to heuristic.
  }

  return heuristic;
}

export async function evaluateTechnicalAnswer(
  params: EvaluateTechnicalParams
): Promise<TechnicalAnswerFeedback> {
  const heuristic = buildTechnicalHeuristic(params);

  if (!GEMINI_API_KEY) {
    return heuristic;
  }

  try {
    const aiFeedback = await callGeminiTechnical(params);
    if (aiFeedback) {
      return aiFeedback;
    }
  } catch {
    // Swallow and fall back to heuristic.
  }

  return heuristic;
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

function buildBehavioralHeuristic(
  params: EvaluateBehavioralParams
): BehavioralAnswerFeedback {
  const { transcript, personaType } = params;

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const hasExample = /for example|for instance|one time|once/i.test(transcript);
  const mentionsResult = /result|outcome|impact|improved|increased|reduced/i.test(
    transcript
  );

  let baseContent = Math.min(
    10,
    Math.floor(wordCount / 20) + (hasExample ? 2 : 0)
  );
  let structure = hasExample && mentionsResult ? 8 : 5;
  let communication = Math.min(9, Math.floor(wordCount / 25) + 4);

  if (!transcript.trim()) {
    baseContent = 1;
    structure = 1;
    communication = 1;
  }

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

  return feedback;
}

function buildTechnicalHeuristic(
  params: EvaluateTechnicalParams
): TechnicalAnswerFeedback {
  const { code, difficulty, passedTests, totalTests } = params;

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

async function callGeminiBehavioral(
  params: EvaluateBehavioralParams
): Promise<BehavioralAnswerFeedback | null> {
  if (!GEMINI_API_KEY) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `
You are a kind but direct mock interview coach.
Evaluate the candidate's behavioral answer.

Return ONLY JSON with the following shape:

{
  "contentScore": number,         // 0-10
  "structureScore": number,       // 0-10
  "communicationScore": number,   // 0-10
  "whatWentWell": string[],       // 1-4 short bullets
  "improveNextTime": string[],    // 1-4 short bullets
  "languageFeedback": {
    "pronunciationTips": string[],
    "grammarTips": string[]
  } | null
}

Scores:
- 0-3: weak
- 4-6: needs work
- 7-8: decent
- 9-10: strong.

Persona type:
- "student": college CS student.
- "bootcamp": bootcamp/self-taught dev.
- "esl": English is not their first language, be extra gentle and encouraging.

If personaType is not "esl", set languageFeedback to null.

Question:
${params.question.title}
${params.question.body}

PersonaType: ${params.personaType}
Difficulty: ${params.difficulty}

Transcript:
${params.transcript}
`.trim();

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    responseMimeType: "application/json"
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as any;
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!text || typeof text !== "string") {
    return null;
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (
    typeof parsed.contentScore !== "number" ||
    typeof parsed.structureScore !== "number" ||
    typeof parsed.communicationScore !== "number" ||
    !Array.isArray(parsed.whatWentWell) ||
    !Array.isArray(parsed.improveNextTime)
  ) {
    return null;
  }

  const feedback: BehavioralAnswerFeedback = {
    contentScore: clampScore(parsed.contentScore),
    structureScore: clampScore(parsed.structureScore),
    communicationScore: clampScore(parsed.communicationScore),
    whatWentWell: parsed.whatWentWell,
    improveNextTime: parsed.improveNextTime
  };

  if (parsed.languageFeedback && params.personaType === "esl") {
    feedback.languageFeedback = {
      pronunciationTips:
        parsed.languageFeedback.pronunciationTips ?? [],
      grammarTips: parsed.languageFeedback.grammarTips ?? []
    };
  }

  return feedback;
}

async function callGeminiTechnical(
  params: EvaluateTechnicalParams
): Promise<TechnicalAnswerFeedback | null> {
  if (!GEMINI_API_KEY) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const passRatio =
    params.totalTests > 0
      ? params.passedTests / params.totalTests
      : 0;

  const prompt = `
You are a senior engineer reviewing a candidate's solution to an interview problem.

Return ONLY JSON with the following shape:

{
  "correctnessScore": number,   // 0-10, based on described test pass ratio
  "efficiencyScore": number,    // 0-10, rough time/space complexity and approach
  "qualityScore": number,       // 0-10, readability, structure, naming
  "whatWentWell": string[],     // 1-4 short bullets
  "improveNextTime": string[]   // 1-4 short bullets
}

Be concise and constructive.

Question:
${params.question.title}
${params.question.body}

Difficulty: ${params.difficulty}
Language: ${params.language}
Test summary: ${params.passedTests}/${params.totalTests} tests passed (pass ratio ${passRatio.toFixed(
    2
  )}).

User code:
${params.code}
`.trim();

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    responseMimeType: "application/json"
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as any;
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!text || typeof text !== "string") {
    return null;
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (
    typeof parsed.correctnessScore !== "number" ||
    typeof parsed.efficiencyScore !== "number" ||
    typeof parsed.qualityScore !== "number" ||
    !Array.isArray(parsed.whatWentWell) ||
    !Array.isArray(parsed.improveNextTime)
  ) {
    return null;
  }

  const feedback: TechnicalAnswerFeedback = {
    correctnessScore: clampScore(parsed.correctnessScore),
    efficiencyScore: clampScore(parsed.efficiencyScore),
    qualityScore: clampScore(parsed.qualityScore),
    whatWentWell: parsed.whatWentWell,
    improveNextTime: parsed.improveNextTime
  };

  return feedback;
}

function clampScore(score: number): number {
  if (Number.isNaN(score)) return 1;
  if (score < 0) return 0;
  if (score > 10) return 10;
  return score;
}