import { NextResponse } from "next/server";
import {
  getQuestionsForSession,
  getSession
} from "@/lib/store";

interface Params {
  params: {
    sessionId: string;
  };
}

export async function GET(_req: Request, { params }: Params) {
  const session = getSession(params.sessionId);
  if (!session) {
    return new NextResponse("Not found", { status: 404 });
  }
  const questions = getQuestionsForSession(session);
  return NextResponse.json({ session, questions });
}