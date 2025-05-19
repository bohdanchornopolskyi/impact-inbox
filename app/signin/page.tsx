"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import GoogleLogoIcon from "@/components/GoogleLogoIcon";

export default function SignIn() {
  const { signIn } = useAuthActions();

  return (
    <div className="flex flex-col gap-8 w-96 mx-auto h-screen justify-center items-center">
      <p>Log in</p>
      <button
        className="bg-white text-black px-4 py-2 rounded-[20px] flex gap-3 items-center cursor-pointer"
        onClick={() => signIn("google")}
      >
        <GoogleLogoIcon />
        Sign in with Google
      </button>
    </div>
  );
}
