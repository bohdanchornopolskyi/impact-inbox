import type { Meta, StoryObj } from "@storybook/react";
import { SaveStatus } from "./save-status";

const meta = {
  title: "Shell/SaveStatus",
  component: SaveStatus,
} satisfies Meta<typeof SaveStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Saved: Story = {
  args: { tone: "saved", label: "Saved 2 min ago" },
};

export const Saving: Story = {
  args: { tone: "saving", label: "Saving" },
};

export const Unsaved: Story = {
  args: { tone: "unsaved", label: "Unsaved changes" },
};

export const Error: Story = {
  args: {
    tone: "error",
    label: "Couldn't save",
    onRetry: () => undefined,
  },
};

export const Offline: Story = {
  args: { tone: "offline", label: "Offline, changes queued" },
};
