import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email && !session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await req.json()) as {
    roleTarget: string | null;
    experience: string | null;
    personaType: string | null;
    preferredInterviewType: string | null;
  };

  const where = session.user.id
    ? { id: session.user.id }
    : { email: session.user.email ?? "" };

  await prisma.user.update({
    where,
    data: {
      roleTarget: body.roleTarget ?? null,
      experience: body.experience ?? null,
      personaType: body.personaType ?? null,
      preferredInterviewType: body.preferredInterviewType ?? null
    }
  });

  return NextResponse.json({ ok: true });
}