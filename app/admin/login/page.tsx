import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;

  return (
    <main className="container-shell flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Admin login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sign in with your allowlisted Google account to access the CMS.
          </p>
          {params.error ? <p className="text-sm text-rose-600">Access denied. Your email is not in ADMIN_EMAIL_ALLOWLIST.</p> : null}
          <Link href="/api/auth/signin/google?callbackUrl=/admin" className="inline-flex">
            <Button>Continue with Google</Button>
          </Link>
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
