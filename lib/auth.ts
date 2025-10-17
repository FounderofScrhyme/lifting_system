import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  session: {
    strategy: "database",
    expiresIn: 60 * 60 * 2, // 2 hours
    updateAge: 60 * 30, // 30 minutes
    cookieCache: {
      enabled: false, // Disabled to reduce cookie size
    },
  },
  cookies: {
    sessionToken: {
      name: "better-auth.session-token",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 2, // 2 hours
    },
  },
  trustedOrigins: ["http://localhost:3000"],
});
