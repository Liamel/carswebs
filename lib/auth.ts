import { and, eq } from "drizzle-orm";
import { type NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const adminAllowlist = new Set(
  (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined) {
  const normalizedEmail = normalizeEmail(email);
  return Boolean(normalizedEmail && adminAllowlist.has(normalizedEmail));
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      const normalizedEmail = normalizeEmail(user.email);

      if (!normalizedEmail || !isAdminEmail(normalizedEmail)) {
        return false;
      }

      await db
        .insert(users)
        .values({
          email: normalizedEmail,
          name: user.name,
          role: "ADMIN",
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            name: user.name,
            role: "ADMIN",
          },
        });

      return true;
    },
    async jwt({ token, user }) {
      const normalizedEmail = normalizeEmail(user?.email ?? token.email);

      if (!normalizedEmail) {
        return token;
      }

      token.email = normalizedEmail;
      token.role = "ADMIN";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = normalizeEmail(token.email) ?? "";
        session.user.role = token.role === "ADMIN" ? "ADMIN" : undefined;
      }

      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getAuthSession();
  const email = normalizeEmail(session?.user?.email);

  if (!email || !isAdminEmail(email)) {
    return null;
  }

  const dbUser = await db.query.users.findFirst({
    where: and(eq(users.email, email), eq(users.role, "ADMIN")),
  });

  if (!dbUser) {
    return null;
  }

  return session;
}
