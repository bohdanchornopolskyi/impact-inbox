"use client";

import { History, RotateCcw } from "lucide-react";
import { Button, Drawer } from "@repo/ui/client";
import { formatDateTime } from "@/lib/format-date";
import { useTemplateRevisions } from "@/lib/templates/template-hooks";
import { useBuilder } from "../builder-provider";
import { RestoreRevisionModal } from "../modals/restore-revision-modal";

export function RevisionHistoryDrawer() {
  const templateId = useBuilder((s) => s.templateId);
  const revisionsOpen = useBuilder((s) => s.revisionsOpen);
  const restoreRevisionId = useBuilder((s) => s.restoreRevisionId);
  const setRevisionsOpen = useBuilder((s) => s.setRevisionsOpen);
  const setRestoreRevisionId = useBuilder((s) => s.setRestoreRevisionId);
  const revisionsQuery = useTemplateRevisions(templateId, revisionsOpen);

  return (
    <>
      <Drawer
        open={revisionsOpen}
        onOpenChange={(open) => setRevisionsOpen(open)}
        title="Revision history"
        description="Saved snapshots of this template."
      >
        {revisionsQuery.isLoading ? (
          <p className="text-ui-sm text-text-secondary">Loading revisions...</p>
        ) : (revisionsQuery.data ?? []).length === 0 ? (
          <p className="text-ui-sm text-text-secondary">
            No revisions yet. Use Save to create your first snapshot.
          </p>
        ) : (
          <div className="space-y-2">
            {(revisionsQuery.data ?? []).map((revision) => (
              <div
                key={revision.id}
                className="flex items-center justify-between rounded-lg border border-border-default px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <History className="size-4 text-text-tertiary" strokeWidth={1.5} />
                  <p className="font-mono text-ui-sm text-text-primary">
                    {formatDateTime(revision.createdAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<RotateCcw className="size-4" strokeWidth={1.5} />}
                  onClick={() => setRestoreRevisionId(revision.id)}
                >
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </Drawer>
      {restoreRevisionId ? (
        <RestoreRevisionModal
          revisionId={restoreRevisionId}
          onClose={() => setRestoreRevisionId(null)}
        />
      ) : null}
    </>
  );
}
