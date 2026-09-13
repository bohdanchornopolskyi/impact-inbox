"use client";

import {
  SettingsNav,
  SettingsNavGroup,
  SettingsNavHeader,
  SidebarItem,
} from "@repo/ui/client";
import {
  SETTINGS_NAV_GROUPS,
  type SettingsTab,
} from "@/components/workspace/settings-nav-groups";

export function WorkspaceSettingsNav({
  tab,
  workspaceName,
  onSelect,
}: {
  tab: SettingsTab;
  workspaceName: string;
  onSelect: (tab: SettingsTab) => void;
}) {
  return (
    <SettingsNav aria-label="Settings">
      <SettingsNavHeader title="Settings" subtitle={workspaceName} />
      {SETTINGS_NAV_GROUPS.map((group) => (
        <SettingsNavGroup key={group.title} title={group.title}>
          {group.items.map((item) => {
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
        </SettingsNavGroup>
      ))}
    </SettingsNav>
  );
}
