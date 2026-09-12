import type { Meta, StoryObj } from "@storybook/react-vite";
import { HorizontalBarChart } from "./horizontal-bar-chart";

const meta = {
  title: "Data/HorizontalBarChart",
  component: HorizontalBarChart,
  args: {
    title: "Most clicked links",
    data: [
      { label: "impact.org/annual-report", value: 428 },
      { label: "impact.org/donate", value: 310 },
      { label: "impact.org/events/spring", value: 186 },
      { label: "impact.org/volunteer", value: 94 },
    ],
  },
} satisfies Meta<typeof HorizontalBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyTitle: "No clicks yet",
    emptyDescription: "Link clicks show up after the first campaign send.",
  },
};
