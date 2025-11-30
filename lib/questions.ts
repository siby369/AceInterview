import { Difficulty, InterviewType, PersonaType, Question } from "./types";

const technicalQuestions: Question[] = [
  {
    id: "t1",
    kind: "technical",
    difficulty: "easy",
    title: "Two Sum (Array)",
    body:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    roleTarget: "SDE"
  },
  {
    id: "t2",
    kind: "technical",
    difficulty: "medium",
    title: "Valid Parentheses",
    body:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nAn input string is valid if open brackets are closed in the correct order.",
    roleTarget: "SDE"
  },
  {
    id: "t3",
    kind: "technical",
    difficulty: "medium",
    title: "Design a Simple REST API",
    body:
      "Design a simple REST API for a todo list application. Describe endpoints, request/response shapes, and how you would structure the backend.",
    roleTarget: "Web Dev"
  },
  {
    id: "t4",
    kind: "technical",
    difficulty: "easy",
    title: "Flexbox Centering",
    body:
      "In CSS, how would you center a div both vertically and horizontally inside its parent using Flexbox?",
    roleTarget: "Web Dev"
  }
];

const behavioralQuestions: Question[] = [
  {
    id: "b1",
    kind: "behavioral",
    difficulty: "easy",
    title: "Tell Me About Yourself",
    body:
      "Give a short introduction about yourself, your background, and what you are looking for.",
    roleTarget: "Any"
  },
  {
    id: "b2",
    kind: "behavioral",
    difficulty: "medium",
    title: "Challenge You Faced",
    body:
      "Describe a challenging problem you faced in a project or course. What did you do, and what was the outcome?",
    roleTarget: "Any"
  },
  {
    id: "b3",
    kind: "behavioral",
    difficulty: "easy",
    title: "Teamwork Example",
    body:
      "Tell me about a time you worked in a team. What was your role, and how did you contribute?",
    roleTarget: "Any"
  }
];

export function getSeedQuestions() {
  return {
    technicalQuestions,
    behavioralQuestions
  };
}

export function pickQuestions(params: {
  interviewType: InterviewType;
  difficulty: Difficulty;
  roleTarget: string;
  personaType: PersonaType;
  count: number;
}): Question[] {
  const { interviewType, difficulty, roleTarget, personaType, count } = params;

  const techPool = technicalQuestions.filter((q) => {
    const matchesDifficulty =
      difficulty === "easy"
        ? q.difficulty === "easy"
        : difficulty === "hard"
        ? q.difficulty !== "easy"
        : true;
    const matchesRole =
      q.roleTarget === "Any" ||
      roleTarget === "" ||
      q.roleTarget.toLowerCase() === roleTarget.toLowerCase();
    return matchesDifficulty && matchesRole;
  });

  const behPool = behavioralQuestions.filter((q) => {
    const matchesDifficulty =
      difficulty === "easy"
        ? q.difficulty === "easy"
        : difficulty === "hard"
        ? q.difficulty !== "easy"
        : true;
    return matchesDifficulty;
  });

  let desiredTech = 0;
  let desiredBeh = 0;

  if (interviewType === "technical") {
    desiredTech = count;
  } else if (interviewType === "behavioral") {
    desiredBeh = count;
  } else {
    desiredTech = Math.ceil(count / 2);
    desiredBeh = count - desiredTech;
  }

  // ESL learners: bias more towards behavioral questions
  if (personaType === "esl" && interviewType === "mixed") {
    desiredBeh = Math.ceil((count * 2) / 3);
    desiredTech = count - desiredBeh;
  }

  const pickRandom = <T,>(arr: T[], n: number): T[] => {
    if (n <= 0 || arr.length === 0) return [];
    const copy = [...arr];
    const picked: T[] = [];
    for (let i = 0; i < n && copy.length > 0; i += 1) {
      const idx = Math.floor(Math.random() * copy.length);
      picked.push(copy[idx]);
      copy.splice(idx, 1);
    }
    return picked;
  };

  const chosenTech = pickRandom(techPool, desiredTech);
  const chosenBeh = pickRandom(behPool, desiredBeh);

  return [...chosenBeh, ...chosenTech];
}