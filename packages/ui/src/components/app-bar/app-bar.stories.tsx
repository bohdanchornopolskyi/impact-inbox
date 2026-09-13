import type { Meta, StoryObj } from "@storybook/react-vite";
import { Logo } from "../logo/logo";
import { TopNavItem } from "../top-nav-item/top-nav-item";
import {
  WorkspaceSwitcherTrigger,
  workspaceSwitcherTriggerClassName,
} from "../workspace-switcher/workspace-switcher-trigger";
import {
  AppBar,
  AppBarDivider,
  AppBarEnd,
  AppBarNav,
  AppBarStart,
  AppBarUser,
  appBarUserClassName,
} from "./app-bar";

const navItems = [
  "Overview",
  "Templates",
  "Contacts",
  "Campaigns",
  "Settings",
] as const;

const meta = {
  title: "Shell/App Bar",
  component: AppBar,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Example({ active }: { active: (typeof navItems)[number] }) {
  return (
    <AppBar>
      <AppBarStart>
        <Logo compact />
        <AppBarNav aria-label="Workspace">
          {navItems.map((label) => (
            <TopNavItem key={label} active={label === active}>
              {label}
            </TopNavItem>
          ))}
        </AppBarNav>
      </AppBarStart>
      <AppBarEnd>
        <button type="button" className={workspaceSwitcherTriggerClassName()}>
          <WorkspaceSwitcherTrigger name="Bohdan's Workspace" />
        </button>
        <AppBarDivider />
        <button type="button" className={appBarUserClassName()}>
          <AppBarUser name="Bohdan Chornopolskyi" />
        </button>
      </AppBarEnd>
    </AppBar>
  );
}

export const WorkspaceSettings: Story = {
  render: () => <Example active="Settings" />,
};

export const TemplatesActive: Story = {
  render: () => <Example active="Templates" />,
};
