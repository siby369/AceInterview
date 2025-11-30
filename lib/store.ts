import {
  BehavioralAnswer,
  CodeSubmission,
  InterviewSession,
  Question
} from "./types";
import { getSeedQuestions } from "./questions";

const sessions = new Map<string, InterviewSession>();
const questionsById = new Map<string, Question>();
const behavioralAnswers = new Map<string, BehavioralAnswer>();
const codeSubmissions = new Map<string, CodeSubmission>();

(function seedQuestions() {
  const { technicalQuestions, behavioralQuestions } = getSeedQuestions();
  [...technicalQuestions, ...behavioralQuestions].forEach((q) => {
    questionsById.set(q.id, q);
  });
})();

export function createSession(session: InterviewSession) {
  sessions.set(session.id, session);
}

export function getSession(sessionId: string): InterviewSession | undefined {
  return sessions.get(sessionId);
}

export function updateSession(session: InterviewSession) {
  sessions.set(session.id, session);
}

export function getQuestion(questionId: string): Question | undefined {
  return questionsById.get(questionId);
}

export function getQuestionsForSession(
  session: InterviewSession
): Question[] {
  return session.questionIds
    .map((id) => questionsById.get(id))
    .filter((q): q is Question => Boolean(q));
}

export function addBehavioralAnswer(answer: BehavioralAnswer) {
  behavioralAnswers.set(answer.id, answer);
}

export function addCodeSubmission(submission: CodeSubmission) {
  codeSubmissions.set(submission.id, submission);
}

export function getBehavioralAnswersForSession(
  sessionId: string
): BehavioralAnswer[] {
  return Array.from(behavioralAnswers.values()).filter(
    (a) => a.sessionId === sessionId
  );
}

export function getCodeSubmissionsForSession(
  sessionId: string
): CodeSubmission[] {
  return Array.from(codeSubmissions.values()).filter(
    (s) => s.sessionId === sessionId
  );
}

export function getAllSessionsForUser(userId: string): InterviewSession[] {
  return Array.from(sessions.values()).filter(
    (s) => s.userId === userId
  );
}