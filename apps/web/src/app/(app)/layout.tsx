"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider } from "@/contexts/session-context";
import { useAuthToken } from "@/lib/use-auth-token";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, isReady } = useAuthToken();

  useEffect(() => {
    if (isReady && !token) {
      router.replace("/sign-in");
    }
  }, [isReady, router, token]);

  if (!isReady || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page">
        <p className="text-ui-sm text-text-secondary">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <SessionProvider token={token}>
      <div className="flex min-h-screen flex-1 flex-col bg-surface-page">
        {children}
      </div>
    </SessionProvider>
  );
}
