import { type NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase();
}

function getAdminAllowlist() {
  return new Set(
    (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
      .split(/[,\n;]/)
      .map((email) => email.trim().replace(/^['"]|['"]$/g, "").toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined) {
  const normalizedEmail = normalizeEmail(email);
  return Boolean(normalizedEmail && getAdminAllowlist().has(normalizedEmail));
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

      if (!normalizedEmail) {
        return "/admin/login?error=MissingEmail";
      }

      if (!isAdminEmail(normalizedEmail)) {
        return "/admin/login?error=AllowlistDenied";
      }

      try {
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
      } catch (error) {
        // Keep allowlisted admin login functional even if user upsert fails.
        console.error("Admin user upsert failed during sign-in", error);
      }

      return true;
    },
    async jwt({ token, user }) {
      const normalizedEmail = normalizeEmail(user?.email ?? token.email);

      if (!normalizedEmail) {
        return token;
      }

      token.email = normalizedEmail;
      token.role = isAdminEmail(normalizedEmail) ? "ADMIN" : undefined;
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

export async function isServerSessionAdmin() {
  const session = await getAuthSession();
  const email = normalizeEmail(session?.user?.email);
  const hasAdminRole = session?.user?.role === "ADMIN";

  return Boolean(email && hasAdminRole && isAdminEmail(email));
}

export async function requireAdminSession() {
  const session = await getAuthSession();
  const email = normalizeEmail(session?.user?.email);
  const hasAdminRole = session?.user?.role === "ADMIN";

  if (!email || !hasAdminRole || !isAdminEmail(email)) {
    return null;
  }

  return session;
}
