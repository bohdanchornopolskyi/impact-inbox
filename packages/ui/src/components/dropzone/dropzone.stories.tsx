import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dropzone } from "./dropzone";

const meta = {
  title: "Files/Dropzone",
  component: Dropzone,
  args: {
    className: "w-full max-w-[520px]",
  },
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const DragOver: Story = {
  args: { status: "dragOver" },
};

export const Rejected: Story = {
  args: {
    status: "rejected",
    title: "That file is not a CSV",
    description:
      "annual-report.pdf cannot be imported. Export your list as CSV and try again.",
  },
};

export const States: Story = {
  render: () => (
    <div className="flex gap-5">
      <Dropzone className="w-full max-w-[520px]" />
      <Dropzone className="w-full max-w-[520px]" status="dragOver" />
      <Dropzone
        className="w-full max-w-[520px]"
        status="rejected"
        title="That file is not a CSV"
        description="annual-report.pdf cannot be imported. Export your list as CSV and try again."
      />
    </div>
  ),
};
