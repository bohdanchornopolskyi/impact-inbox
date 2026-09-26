import type { Meta, StoryObj } from "@storybook/react-vite";
import { FloatingBlockToolbar } from "./floating-block-toolbar";

const meta = {
  title: "Editor/Floating Block Toolbar",
  component: FloatingBlockToolbar,
  args: {
    onMoveUp: () => undefined,
    onMoveDown: () => undefined,
    onDuplicate: () => undefined,
    onDelete: () => undefined,
  },
} satisfies Meta<typeof FloatingBlockToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
