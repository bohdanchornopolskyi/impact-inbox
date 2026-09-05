"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Blocks, Palette, SlidersHorizontal, Users } from "lucide-react";
import { SidebarItem } from "@repo/ui/client";
import { hasWorkspaceRoleAtLeast } from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { formatRoleLabel } from "@/lib/members/format-role-label";
import { WorkspacePageShell } from "@/components/app/workspace-page-chrome";
import { WorkspaceMembersSection } from "@/components/workspace/workspace-members-section";
import { WorkspaceGeneralSection } from "@/components/workspace/workspace-general-section";
import { WorkspaceIdentitySection } from "@/components/workspace/workspace-identity-section";
import { WorkspaceBrandSection } from "@/components/workspace/workspace-brand-section";
import { WorkspaceModulesSection } from "@/components/workspace/workspace-modules-section";

const WORKSPACE_ITEMS = [
  { value: "general", label: "General", icon: SlidersHorizontal },
  { value: "brand", label: "Brand", icon: Palette },
  { value: "members", label: "Members", icon: Users },
] as const;

const PLATFORM_ITEMS = [
  { value: "modules", label: "Modules", icon: Blocks },
] as const;

const SETTINGS_TABS = [...WORKSPACE_ITEMS, ...PLATFORM_ITEMS] as const;

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
    <div className="flex min-h-[calc(100dvh-var(--spacing-topbar))]">
      <nav
        aria-label="Settings"
        className="flex w-66 shrink-0 flex-col gap-5 border-r border-border bg-surface px-4 py-6"
      >
        <div className="flex flex-col gap-0.75 px-2">
          <p className="text-2xl font-bold text-text">Settings</p>
          <p className="text-xs text-text-3">{workspace.name}</p>
        </div>

        <div className="flex flex-col gap-5">
          <SettingsNavGroup
            title="Workspace"
            items={WORKSPACE_ITEMS}
            tab={tab}
            onSelect={setTab}
          />
          <SettingsNavGroup
            title="Platform"
            items={PLATFORM_ITEMS}
            tab={tab}
            onSelect={setTab}
          />
        </div>
        <p className="sr-only">Your role: {formatRoleLabel(workspace.role)}</p>
      </nav>

      <div className="min-w-0 flex-1">
        <WorkspacePageShell>
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
        </WorkspacePageShell>
      </div>
    </div>
  );
}

function SettingsNavGroup({
  title,
  items,
  tab,
  onSelect,
}: {
  title: string;
  items: typeof WORKSPACE_ITEMS | typeof PLATFORM_ITEMS;
  tab: SettingsTab;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="px-2 text-2xs font-semibold text-text-3">{title.toUpperCase()}</p>
      <div className="h-1.5" />
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <SidebarItem
            key={item.value}
            active={tab === item.value}
            icon={<Icon strokeWidth={1.5} />}
            onClick={() => onSelect(item.value)}
          >
            {item.label}
          </SidebarItem>
        );
      })}
    </div>
  );
}
