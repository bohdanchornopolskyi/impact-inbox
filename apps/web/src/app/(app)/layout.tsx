"use client";

import { SessionProvider } from "@/contexts/session-context";
import { useAuthGate } from "@/lib/auth-session";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, isReady, isAuthenticated } = useAuthGate();

  if (!isReady || !isAuthenticated || !token) {
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
