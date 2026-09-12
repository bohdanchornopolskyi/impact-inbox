import type { Meta, StoryObj } from "@storybook/react-vite";
import { RotateCcw } from "lucide-react";
import { CropToolButton } from "./crop-tool-button";

const meta = {
  title: "Editor/Crop Tool Button",
  component: CropToolButton,
  args: {
    "aria-label": "Rotate",
    children: <RotateCcw strokeWidth={1.5} />,
  },
  decorators: [
    (Story) => (
      <div className="inline-flex size-[46px] items-center justify-center rounded-md bg-neutral-950">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CropToolButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
