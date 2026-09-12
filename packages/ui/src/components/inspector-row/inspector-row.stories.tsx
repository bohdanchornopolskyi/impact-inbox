import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedControl } from "../segmented-control/segmented-control";
import { InspectorRow } from "./inspector-row";

const meta = {
  title: "Editor/Inspector Row",
  component: InspectorRow,
  args: {
    label: "Width",
  },
} satisfies Meta<typeof InspectorRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <SegmentedControl
        value="50"
        onChange={() => undefined}
        options={[
          { value: "auto", label: "Auto" },
          { value: "50", label: "50%" },
          { value: "custom", label: "Custom" },
        ]}
      />
    ),
  },
};
