import type { Meta, StoryObj } from "@storybook/react-vite";
import { VersionReviewBar } from "./version-review-bar";

const meta = {
  title: "Editor/Version Review Bar",
  component: VersionReviewBar,
  args: {
    title: "Viewing version from Today, 10:24 AM",
    changeCount: 6,
    onPrevChange: () => undefined,
    onNextChange: () => undefined,
    onExit: () => undefined,
    onSaveCopy: () => undefined,
    onRestore: () => undefined,
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof VersionReviewBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
