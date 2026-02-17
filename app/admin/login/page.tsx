import Link from "next/link";

import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const error = params.error;
  const errorMessage =
    error === "AllowlistDenied"
      ? "Access denied. Your email is not in ADMIN_EMAIL_ALLOWLIST."
      : error === "Unauthorized"
        ? "Please sign in with an allowlisted admin account to continue."
        : error === "google"
          ? "Google sign-in did not start correctly. Please use the button below."
        : error === "OAuthSignin"
          ? "Google OAuth could not start. Check AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET."
        : error === "OAuthCallback"
          ? "Google OAuth callback failed. Check authorized redirect URI: http://localhost:3000/api/auth/callback/google"
        : error === "Configuration"
          ? "Auth configuration error. Check NEXTAUTH_SECRET and Google OAuth environment variables."
        : error === "MissingEmail"
          ? "Could not read your Google account email. Please try another account."
          : error
            ? "Sign-in failed. Please try again."
            : null;

  return (
    <main className="container-shell flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-md bg-white/94">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Admin login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sign in with your allowlisted Google account to access the CMS.
          </p>
          {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
          <GoogleSignInButton />
          <div>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to website
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
