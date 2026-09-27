import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Tabs } from "./tabs";

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function TabsPreview() {
  const [value, setValue] = useState("overview");

  return (
    <Tabs
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "analytics", label: "Analytics" },
      ]}
      value={value}
      onChange={setValue}
    >
      <p className="text-sm text-text-2">
        {value === "overview" ? "Overview" : "Analytics"}
      </p>
    </Tabs>
  );
}

export const Default: Story = {
  render: () => <TabsPreview />,
};
