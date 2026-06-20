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
      <AppHeader />
      <WorkspaceNav />
      <main className="flex-1">{children}</main>
    </WorkspaceProvider>
  );
}
