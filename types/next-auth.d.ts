import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      personaType?: string | null;
      roleTarget?: string | null;
      preferredInterviewType?: string | null;
      experience?: string | null;
    };
  }

  interface User {
    personaType?: string | null;
    roleTarget?: string | null;
    preferredInterviewType?: string | null;
    experience?: string | null;
  }
}