import type { Meta, StoryObj } from "@storybook/react";
import { SidebarItem } from "./sidebar-item";

function SlidersIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 4.5h11M4.5 4.5v2M11.5 11.5h-9M11.5 9.5v4M8 2.5v4M8 9.5v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const meta = {
  title: "Navigation/SidebarItem",
  component: SidebarItem,
} satisfies Meta<typeof SidebarItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {
  args: {
    children: "Members",
    icon: <SlidersIcon />,
  },
};

export const Active: Story = {
  args: {
    children: "General",
    active: true,
    icon: <SlidersIcon />,
  },
};

export const States: Story = {
  render: () => (
    <div className="flex w-[220px] flex-col gap-0.5">
      <SidebarItem active icon={<SlidersIcon />}>
        General
      </SidebarItem>
      <SidebarItem icon={<SlidersIcon />}>Members</SidebarItem>
    </div>
  ),
};
