import { BookOpen } from "lucide-react";
import { Button, PageHeader } from "@repo/ui/client";
import { WorkspaceGeneralSection } from "@/components/workspace/workspace-general-section";
import { WorkspaceIdentitySection } from "@/components/workspace/workspace-identity-section";

export function WorkspaceGeneralPage() {
  return (
    <>
      <PageHeader
        title="General"
        description="Workspace identity and the postal address required on every email you send."
        actions={
          <Button
            variant="secondary"
            leftIcon={<BookOpen strokeWidth={1.5} />}
            title="Docs aren't available yet"
            disabled
          >
            Docs
          </Button>
        }
      />
      <WorkspaceIdentitySection />
      <WorkspaceGeneralSection />
    </>
  );
}
