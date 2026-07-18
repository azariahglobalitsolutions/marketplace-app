import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to submit listings and events on Wube Bereha.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm
        mode="login"
        title="Sign in"
        description="Access your Wube Bereha account to submit listings and events."
        submitLabel="Sign in"
        alternateHref="/register"
        alternateLabel="Create an account"
      />
    </Suspense>
  );
}
