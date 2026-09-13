import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AtSign,
  Blocks,
  CreditCard,
  Globe,
  Key,
  Palette,
  Plug,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { SidebarItem } from "../sidebar-item/sidebar-item";
import {
  SettingsNav,
  SettingsNavGroup,
  SettingsNavHeader,
} from "./settings-nav";

const meta = {
  title: "Shell/Settings Nav",
  component: SettingsNav,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SettingsNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkspaceSettings: Story = {
  render: () => (
    <div className="flex h-180 bg-surface-page">
      <SettingsNav aria-label="Settings">
        <SettingsNavHeader title="Settings" subtitle="Bohdan's Workspace" />
        <SettingsNavGroup title="Workspace">
          <SidebarItem active icon={<SlidersHorizontal strokeWidth={1.5} />}>
            General
          </SidebarItem>
          <SidebarItem icon={<Palette strokeWidth={1.5} />}>Brand</SidebarItem>
          <SidebarItem icon={<Users strokeWidth={1.5} />}>Members</SidebarItem>
          <SidebarItem icon={<CreditCard strokeWidth={1.5} />}>Billing</SidebarItem>
        </SettingsNavGroup>
        <SettingsNavGroup title="Sending">
          <SidebarItem icon={<AtSign strokeWidth={1.5} />}>
            Sender identity
          </SidebarItem>
          <SidebarItem icon={<Globe strokeWidth={1.5} />}>Domains</SidebarItem>
          <SidebarItem icon={<ShieldCheck strokeWidth={1.5} />}>
            Deliverability
          </SidebarItem>
        </SettingsNavGroup>
        <SettingsNavGroup title="Platform">
          <SidebarItem icon={<Blocks strokeWidth={1.5} />}>Modules</SidebarItem>
          <SidebarItem icon={<Plug strokeWidth={1.5} />}>Integrations</SidebarItem>
          <SidebarItem icon={<Key strokeWidth={1.5} />}>API keys</SidebarItem>
        </SettingsNavGroup>
      </SettingsNav>
    </div>
  ),
};
