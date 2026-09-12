import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopNavItem } from "./top-nav-item";

const meta = {
  title: "Navigation/TopNavItem",
  component: TopNavItem,
} satisfies Meta<typeof TopNavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {
  args: { children: "Contacts" },
};

export const Active: Story = {
  args: { children: "Templates", active: true },
};

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <TopNavItem>Contacts</TopNavItem>
      <TopNavItem>Overview</TopNavItem>
      <TopNavItem active>Templates</TopNavItem>
    </div>
  ),
};
