import { NextResponse } from "next/server";

interface Body {
  code: string;
  language: string;
  questionId: string;
}

const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST;

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const hasContent = body.code.trim().length > 0;

  if (!JUDGE0_API_URL || !hasContent) {
    const tests = [
      {
        name: "Sample test",
        passed: hasContent,
        output: hasContent
          ? "Code received. Execution sandbox not yet wired."
          : "No code submitted.",
        expected: "Set JUDGE0_API_URL to connect a real sandbox."
      }
    ];
    return NextResponse.json({ tests });
  }

  const languageId = mapLanguageToJudge0(body.language);
  if (!languageId) {
    const tests = [
      {
        name: "Sample test",
        passed: false,
        output: `Unsupported language: ${body.language}`,
        expected: "Use JavaScript or Python."
      }
    ];
    return NextResponse.json({ tests });
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (JUDGE0_API_KEY) {
      headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
    }
    if (JUDGE0_API_HOST) {
      headers["X-RapidAPI-Host"] = JUDGE0_API_HOST;
    }

    const submissionRes = await fetch(
      `${JUDGE0_API_URL.replace(/\/$/, "")}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          source_code: body.code,
          language_id: languageId,
          stdin: "",
          expected_output: null
        })
      }
    );

    if (!submissionRes.ok) {
      const text = await submissionRes.text();
      const tests = [
        {
          name: "Execution",
          passed: false,
          output: `Sandbox error: ${text}`,
          expected: "Code should compile and run without server errors."
        }
      ];
      return NextResponse.json({ tests });
    }

    const result = (await submissionRes.json()) as any;

    const statusDesc: string =
      result.status?.description ?? "Unknown status";
    const stdout: string = result.stdout ?? "";
    const stderr: string = result.stderr ?? "";
    const time: string = result.time ?? "";
    const memory: string = result.memory ?? "";

    const passed =
      statusDesc.toLowerCase() === "accepted" && !stderr;

    const tests = [
      {
        name: "Execution",
        passed,
        output:
          stdout?.trim() ||
          stderr?.trim() ||
          statusDesc,
        expected: "Program runs without runtime errors."
      },
      {
        name: "Resource usage",
        passed: true,
        output: `time: ${time ?? "n/a"}, memory: ${memory ?? "n/a"}`,
        expected: "These are approximate values from the sandbox."
      }
    ];

    return NextResponse.json({ tests });
  } catch (error) {
    const tests = [
      {
        name: "Execution",
        passed: false,
        output: "Failed to reach execution sandbox.",
        expected: "Verify JUDGE0_API_URL and network connectivity."
      }
    ];
    return NextResponse.json({ tests });
  }
}

function mapLanguageToJudge0(language: string): number | null {
  const lang = language.toLowerCase();
  if (lang === "javascript" || lang === "js" || lang === "node") {
    // JavaScript (Node.js)
    return 63;
  }
  if (lang === "python" || lang === "py") {
    // Python 3
    return 71;
  }
  return null;
}