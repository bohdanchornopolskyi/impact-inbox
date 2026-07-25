"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SegmentedControl } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { formatRoleLabel } from "@/lib/members/format-role-label";
import {
  WorkspacePageHeader,
  WorkspacePageShell,
} from "@/components/app/workspace-page-chrome";
import { WorkspaceMembersSection } from "@/components/workspace/workspace-members-section";
import { WorkspaceGeneralSection } from "@/components/workspace/workspace-general-section";
import { WorkspaceIdentitySection } from "@/components/workspace/workspace-identity-section";
import { WorkspaceBrandSection } from "@/components/workspace/workspace-brand-section";
import { WorkspaceModulesSection } from "@/components/workspace/workspace-modules-section";

const SETTINGS_TABS = [
  { value: "general", label: "General" },
  { value: "brand", label: "Brand" },
  { value: "modules", label: "Modules" },
  { value: "members", label: "Members" },
] as const;

type SettingsTab = (typeof SETTINGS_TABS)[number]["value"];

function isSettingsTab(value: string | null): value is SettingsTab {
  return SETTINGS_TABS.some((tab) => tab.value === value);
}

export function WorkspaceSettingsView() {
  const { workspace } = useWorkspace();
  const canManage = hasWorkspaceRoleAtLeast(workspace.role, ["admin", "owner"]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: SettingsTab = isSettingsTab(tabParam) ? tabParam : "general";

  function setTab(next: string) {
    if (!isSettingsTab(next) || next === tab) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (next === "general") {
      params.delete("tab");
    } else {
      params.set("tab", next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <WorkspacePageShell className="pt-0 pb-0">
      <header className="sticky top-0 z-20 -mx-4 border-b border-border-subtle bg-surface-page/95 px-4 pt-8 pb-5 backdrop-blur-md sm:-mx-6 sm:px-6">
        <WorkspacePageHeader
          className="mb-0"
          title="Settings"
          description={workspace.name}
          actions={
            <SegmentedControl
              className="w-fit"
              value={tab}
              onChange={setTab}
              options={[...SETTINGS_TABS]}
            />
          }
        />
        <p className="sr-only">
          Your role: {formatRoleLabel(workspace.role)}
        </p>
      </header>

      <div className="flex flex-col gap-8 pb-8">
        {tab === "general" ? (
          <div className="flex flex-col gap-8">
            <WorkspaceIdentitySection />
            <WorkspaceGeneralSection />
          </div>
        ) : null}

        {tab === "brand" ? <WorkspaceBrandSection /> : null}

        {tab === "modules" ? <WorkspaceModulesSection /> : null}

        {tab === "members" ? (
          <WorkspaceMembersSection
            workspaceId={workspace.id}
            organizationId={workspace.organizationId}
            canManage={canManage}
          />
        ) : null}
      </div>
    </WorkspacePageShell>
  );
}
