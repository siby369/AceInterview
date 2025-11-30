import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  session: {
    strategy: "database"
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.personaType = (user as any).personaType ?? null;
        session.user.roleTarget = (user as any).roleTarget ?? null;
        session.user.preferredInterviewType =
          (user as any).preferredInterviewType ?? null;
        session.user.experience = (user as any).experience ?? null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin"
  }
};

export const nextAuthHandler = NextAuth(authOptions);