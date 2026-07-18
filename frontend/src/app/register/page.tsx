import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Wube Bereha account to submit listings and events.",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm
        mode="register"
        title="Create account"
        description="Join Wube Bereha to share restaurants, events, and community listings."
        submitLabel="Create account"
        alternateHref="/login"
        alternateLabel="Already have an account? Sign in"
      />
    </Suspense>
  );
}
