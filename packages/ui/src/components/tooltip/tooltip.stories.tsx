import type { Meta, StoryObj } from "@storybook/react-vite";
import { tooltipPopupClassName } from "./tooltip";

const meta = {
  title: "Overlays/Tooltip",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <span className={tooltipPopupClassName}>Duplicate block  ⌘D</span>
  ),
};
