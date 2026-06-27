import { WorkspaceProvider } from "@/contexts/workspace-context";
import { AppHeader } from "@/components/app/app-header";
import { WorkspaceNav } from "@/components/app/workspace-nav";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AppHeader />
        <WorkspaceNav />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </WorkspaceProvider>
  );
}
