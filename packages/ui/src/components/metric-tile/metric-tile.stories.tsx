import type { Meta, StoryObj } from "@storybook/react-vite";
import { MetricTile } from "./metric-tile";

const meta = {
  title: "Data/MetricTile",
  component: MetricTile,
  args: {
    label: "Open rate",
    value: "48.2%",
    delta: "+4.1%",
    period: "vs last campaign",
  },
} satisfies Meta<typeof MetricTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
