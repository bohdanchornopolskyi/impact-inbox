import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterChip } from "./filter-chip";

const meta = {
  title: "Data/Filter Chip",
  component: FilterChip,
  args: {
    label: "Status",
    value: "Any",
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};

export const Active: Story = {
  args: {
    value: "Sent, Sending",
    active: true,
  },
};
