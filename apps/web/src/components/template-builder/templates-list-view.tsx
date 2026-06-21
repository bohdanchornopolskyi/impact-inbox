"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  DropdownMenu,
  Input,
  SegmentedControl,
} from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { formatDateTime } from "@/lib/format-date";
import { useTemplates } from "@/lib/templates/template-hooks";
import { ArchiveTemplateModal } from "@/components/template-builder/modals/archive-template-modal";
import { CreateTemplateModal } from "@/components/template-builder/modals/create-template-modal";
import { RenameTemplateModal } from "@/components/template-builder/modals/rename-template-modal";
import { RestoreTemplateModal } from "@/components/template-builder/modals/restore-template-modal";

function TemplateThumbnail() {
  return (
    <div
      className="relative h-36 overflow-hidden rounded-lg border border-border-default bg-surface-sunken"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, #ececee 0, #ececee 1px, transparent 1px, transparent 10px)",
      }}
    >
      <div className="absolute inset-x-0 bottom-3 flex justify-center">
        <span className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-2xs text-text-muted">
          PREVIEW · 600×240
        </span>
      </div>
    </div>
  );
}

type ActionTarget = {
  id: string;
  name: string;
  kind: "rename" | "archive" | "restore";
};

export function TemplatesListView() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const canEdit = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<ActionTarget | null>(null);

  const templatesQuery = useTemplates({ archived: filter === "archived" });

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();
    const templates = templatesQuery.data ?? [];

    if (!query) {
      return templates;
    }

    return templates.filter((template) =>
      template.name.toLowerCase().includes(query),
    );
  }, [search, templatesQuery.data]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ui-2xl font-semibold tracking-snug text-text-primary">
            Templates
          </h1>
          <p className="mt-1 text-ui-sm text-text-secondary">
            Design and reuse email layouts for your campaigns.
          </p>
        </div>
        {canEdit ? (
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            New template
          </Button>
        ) : null}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xs flex-1">
          <Input
            placeholder="Search templates"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <SegmentedControl
          value={filter}
          onChange={(value) => setFilter(value as "active" | "archived")}
          options={[
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </div>

      {templatesQuery.isLoading ? (
        <p className="text-ui-sm text-text-secondary">Loading templates...</p>
      ) : filteredTemplates.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 border-dashed px-8 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-xl bg-surface-inset">
            <span className="text-ui-xl text-text-muted">▢</span>
          </div>
          <div>
            <h2 className="text-ui-lg font-semibold text-text-primary">
              {filter === "archived" ? "No archived templates" : "No templates yet"}
            </h2>
            <p className="mt-1 max-w-sm text-ui-sm text-text-secondary">
              {filter === "archived"
                ? "Archived templates appear here."
                : "Create your first email template to start building campaigns."}
            </p>
          </div>
          {canEdit && filter === "active" ? (
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              New template
            </Button>
          ) : null}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden p-0">
              <Link
                href={`/${workspace.slug}/templates/${template.id}`}
                className="block p-4 pb-3"
              >
                <TemplateThumbnail />
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-ui-md font-semibold text-text-primary">
                      {template.name}
                    </h3>
                    <p className="mt-0.5 font-mono text-ui-xs text-text-tertiary">
                      Updated {formatDateTime(template.updatedAt)}
                    </p>
                  </div>
                </div>
              </Link>
              {canEdit ? (
                <div className="flex justify-end border-t border-border-subtle px-2 py-1">
                  <DropdownMenu
                    trigger={
                      <span className="text-ui-sm text-text-tertiary">···</span>
                    }
                    items={[
                      {
                        label: "Open",
                        onSelect: () => {
                          router.push(
                            `/${workspace.slug}/templates/${template.id}`,
                          );
                        },
                      },
                      ...(filter === "active"
                        ? [
                            {
                              label: "Rename",
                              onSelect: () =>
                                setActionTarget({
                                  id: template.id,
                                  name: template.name,
                                  kind: "rename" as const,
                                }),
                            },
                            {
                              label: "Archive",
                              destructive: true,
                              onSelect: () =>
                                setActionTarget({
                                  id: template.id,
                                  name: template.name,
                                  kind: "archive" as const,
                                }),
                            },
                          ]
                        : [
                            {
                              label: "Restore",
                              onSelect: () =>
                                setActionTarget({
                                  id: template.id,
                                  name: template.name,
                                  kind: "restore" as const,
                                }),
                            },
                          ]),
                    ]}
                  />
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <CreateTemplateModal open={createOpen} onOpenChange={setCreateOpen} />

      {actionTarget
        ? (() => {
            switch (actionTarget.kind) {
              case "rename":
                return (
                  <RenameTemplateModal
                    open
                    onOpenChange={(open) => {
                      if (!open) {
                        setActionTarget(null);
                      }
                    }}
                    templateId={actionTarget.id}
                    currentName={actionTarget.name}
                  />
                );
              case "archive":
                return (
                  <ArchiveTemplateModal
                    open
                    onOpenChange={(open) => {
                      if (!open) {
                        setActionTarget(null);
                      }
                    }}
                    templateId={actionTarget.id}
                    templateName={actionTarget.name}
                    onArchived={() => setActionTarget(null)}
                  />
                );
              case "restore":
                return (
                  <RestoreTemplateModal
                    open
                    onOpenChange={(open) => {
                      if (!open) {
                        setActionTarget(null);
                      }
                    }}
                    templateId={actionTarget.id}
                    templateName={actionTarget.name}
                    onRestored={() => setActionTarget(null)}
                  />
                );
            }
          })()
        : null}
    </div>
  );
}
