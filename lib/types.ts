export type PersonaType = "student" | "bootcamp" | "esl";

export type InterviewType = "technical" | "behavioral" | "mixed";

export type Difficulty = "easy" | "medium" | "hard";

export type Language = "javascript" | "python";

export interface Question {
  id: string;
  kind: "technical" | "behavioral";
  difficulty: Difficulty;
  title: string;
  body: string;
  roleTarget: string;
}

export interface BehavioralAnswerFeedback {
  contentScore: number;
  structureScore: number;
  communicationScore: number;
  whatWentWell: string[];
  improveNextTime: string[];
  languageFeedback?: {
    pronunciationTips?: string[];
    grammarTips?: string[];
  };
}

export interface TechnicalAnswerFeedback {
  correctnessScore: number;
  efficiencyScore: number;
  qualityScore: number;
  whatWentWell: string[];
  improveNextTime: string[];
}

export interface BehavioralAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  transcript: string;
  feedback?: BehavioralAnswerFeedback;
  createdAt: string;
}

export interface CodeSubmission {
  id: string;
  sessionId: string;
  questionId: string;
  language: Language;
  code: string;
  passedTests: number;
  totalTests: number;
  feedback?: TechnicalAnswerFeedback;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  type: InterviewType;
  difficulty: Difficulty;
  durationMin: number;
  roleTarget: string;
  personaType: PersonaType;
  status: "scheduled" | "in_progress" | "completed";
  startedAt: string;
  finishedAt?: string;
  overallScore?: number;
  questionIds: string[];
}