"use client";

import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { useTemplate } from "@/lib/templates/template-hooks";
import { BuilderInspectorPanel } from "./builder-inspector-panel";
import { BuilderProvider } from "./builder-provider";
import { RichtextCanvasEditProvider } from "./canvas/richtext-canvas-edit-context";
import { BuilderToolbar } from "./builder-toolbar";
import { PreviewCanvas } from "./canvas/preview-canvas";
import { RevisionHistoryDrawer } from "./drawers/revision-history-drawer";
import { LeftSidebar } from "./left-sidebar";
import { MergeTagWarnings } from "./merge-tag-warnings";
import { ExportTemplateModal } from "./modals/export-template-modal";
import { PreviewOverlay } from "./preview-overlay";

type TemplateBuilderViewProps = {
  templateId: string;
};

export function TemplateBuilderView({ templateId }: TemplateBuilderViewProps) {
  const { workspace } = useWorkspace();
  const templateQuery = useTemplate(templateId);
  const canEdit = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);

  if (templateQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-ui-sm text-text-secondary">Loading template...</p>
      </div>
    );
  }

  if (templateQuery.error || !templateQuery.data) {
    throw templateQuery.error ?? new Error("Failed to load template");
  }

  return (
    <BuilderProvider template={templateQuery.data} canEdit={canEdit}>
      <RichtextCanvasEditProvider>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <BuilderToolbar />
            <MergeTagWarnings />
          </div>
        <div className="grid min-h-0 flex-1 grid-cols-[266px_minmax(0,1fr)_302px] overflow-hidden [&>*]:min-h-0">
            <LeftSidebar />
            <PreviewCanvas />
            <BuilderInspectorPanel />
          </div>
        </div>
        <PreviewOverlay />
        <RevisionHistoryDrawer />
        <ExportTemplateModal />
      </RichtextCanvasEditProvider>
    </BuilderProvider>
  );
}
