import { SignOutButton } from "@/components/SingOutButton";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";

export default async function Home() {
  const viewer = await fetchQuery(
    api.users.viewer,
    {},
    { token: await convexAuthNextjsToken() },
  );
  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        Impact Inbox
        <SignOutButton />
      </header>
      <main className="p-8 flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center">
          Hey, {viewer?.name ?? "there"}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/build">Build your first email template</Link>
        </Button>
      </main>
    </>
  );
}
