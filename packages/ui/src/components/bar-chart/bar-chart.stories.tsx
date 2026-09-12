import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "../select/select";
import { BarChart } from "./bar-chart";

const meta = {
  title: "Data/BarChart",
  component: BarChart,
  args: {
    title: "Opens per day",
    subtitle: "Last 14 days · 11,930 total",
    data: [
      { label: "Feb 26", value: 410 },
      { label: "27", value: 590 },
      { label: "28", value: 530 },
      { label: "Mar 1", value: 760 },
      { label: "2", value: 940 },
      { label: "3", value: 860 },
      { label: "4", value: 1090 },
      { label: "5", value: 1010 },
      { label: "6", value: 740 },
      { label: "7", value: 680 },
      { label: "8", value: 890 },
      { label: "9", value: 1150 },
      { label: "10", value: 1210 },
      { label: "11", value: 960 },
    ],
    action: (
      <Select
        aria-label="Range"
        defaultValue="14"
        options={[
          { value: "7", label: "7 days" },
          { value: "14", label: "14 days" },
          { value: "30", label: "30 days" },
        ]}
      />
    ),
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Empty: Story = {
  args: {
    data: [],
    subtitle: "Last 14 days",
    emptyTitle: "No opens yet",
    emptyDescription: "Opens appear within a few minutes of the first send.",
    action: undefined,
  },
};
