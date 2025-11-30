import { NextResponse } from "next/server";

interface Body {
  code: string;
  language: string;
  questionId: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  // For now we do not execute user code on the server.
  // This endpoint simply returns stub test results so the UI flow works.
  const hasContent = body.code.trim().length > 0;

  const tests = [
    {
      name: "Sample test",
      passed: hasContent,
      output: hasContent
        ? "Code received. Execution sandbox not yet wired."
        : "No code submitted.",
      expected: "Connect Judge0 or a sandbox to run real tests."
    }
  ];

  return NextResponse.json({ tests });
}