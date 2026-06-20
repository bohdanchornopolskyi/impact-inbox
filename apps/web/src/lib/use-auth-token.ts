"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth-token";

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setToken(getAuthToken());
    setIsReady(true);
  }, []);

  return { token, isReady };
}
