import type { Meta, StoryObj } from "@storybook/react-vite";
import { VersionDayHeader } from "./version-day-header";

const meta = {
  title: "Editor/Version Day Header",
  component: VersionDayHeader,
  args: { label: "Today", count: 6 },
} satisfies Meta<typeof VersionDayHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
