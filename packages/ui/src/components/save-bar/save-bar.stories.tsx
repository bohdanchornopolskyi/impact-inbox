import type { Meta, StoryObj } from "@storybook/react-vite";
import { SaveStatus } from "../save-status/save-status";
import { SaveBar } from "./save-bar";

const meta = {
  title: "Shell/Save Bar",
  component: SaveBar,
  args: {
    onDiscard: () => undefined,
    onSave: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-[620px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SaveBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unsaved: Story = {
  args: {
    status: <SaveStatus tone="unsaved" label="2 unsaved changes" />,
  },
};

export const Saving: Story = {
  args: {
    status: <SaveStatus tone="saving" label="Saving" />,
    saveDisabled: true,
    discardDisabled: true,
  },
};

export const Error: Story = {
  args: {
    status: (
      <SaveStatus tone="error" label="Couldn't save" onRetry={() => undefined} />
    ),
  },
};
