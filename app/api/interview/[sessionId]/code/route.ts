import { NextResponse } from "next/server";
import { evaluateTechnicalAnswer } from "@/lib/ai";
import {
  addCodeSubmission,
  getQuestion,
  getSession,
  updateSession
} from "@/lib/store";
import type { Language } from "@/lib/types";

interface Params {
  params: {
    sessionId: string;
  };
}

export async function POST(req: Request, { params }: Params) {
  const session = getSession(params.sessionId);
  if (!session) {
    return new NextResponse("Session not found", { status: 404 });
  }

  const body = (await req.json()) as {
    questionId: string;
    code: string;
    language: Language;
  };

  const question = getQuestion(body.questionId);
  if (!question) {
    return new NextResponse("Question not found", { status: 404 });
  }

  const tests = buildStubTests(question.id, body.code);
  const passedTests = tests.filter((t) => t.passed).length;
  const totalTests = tests.length;

  const feedback = await evaluateTechnicalAnswer({
    code: body.code,
    question,
    language: body.language,
    difficulty: session.difficulty,
    passedTests,
    totalTests
  });

  const submissionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  addCodeSubmission({
    id: submissionId,
    sessionId: session.id,
    questionId: question.id,
    language: body.language,
    code: body.code,
    passedTests,
    totalTests,
    feedback,
    createdAt: new Date().toISOString()
  });

  updateSession(session);

  return NextResponse.json({
    feedback,
    tests,
    passedTests,
    totalTests
  });
}

function buildStubTests(questionId: string, code: string) {
  // For the MVP vertical slice, we stub test execution.
  // This is where you would wire Judge0 or a sandbox.
  const hasReturn = /return\s+/.test(code);
  const hasLoop = /for\s*\(|while\s*\(/.test(code);
  const tests = [
    {
      name: "Compiles",
      passed: code.trim().length > 0,
      output: hasReturn ? "Function with return detected" : "No explicit return found",
      expected: "Basic structure present"
    },
    {
      name: "Has iteration",
      passed: hasLoop,
      output: hasLoop ? "Loop detected" : "No loop detected",
      expected: "Loop usage is optional depending on solution"
    }
  ];

  return tests;
}