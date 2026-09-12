import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorState } from "./error-state";

const meta = {
  title: "Feedback/Error State",
  component: ErrorState,
  args: {
    title: "We couldn't load your campaigns",
    description:
      "The request timed out. Nothing was lost, your campaigns are still there.",
    errorRef: "Error 8f3c-22a1",
    onRetry: () => undefined,
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Chart: Story = {
  args: {
    title: "We couldn't load this chart",
    description: "The metrics service did not respond. Your campaign is unaffected.",
  },
};
