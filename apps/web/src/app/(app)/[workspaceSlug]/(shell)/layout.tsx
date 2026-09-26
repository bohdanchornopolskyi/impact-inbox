import { AppHeader } from "@/components/app/app-header";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </>
  );
}
