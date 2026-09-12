import type { Meta, StoryObj } from "@storybook/react-vite";
import { DonutChart } from "./donut-chart";

const meta = {
  title: "Data/DonutChart",
  component: DonutChart,
  args: {
    title: "Delivery breakdown",
    data: [
      { label: "Opened", value: 48 },
      { label: "Clicked", value: 12 },
      { label: "No action", value: 34 },
      { label: "Bounced", value: 6 },
    ],
  },
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyTitle: "No sends yet",
    emptyDescription: "Delivery mix appears after the first campaign send.",
  },
};
