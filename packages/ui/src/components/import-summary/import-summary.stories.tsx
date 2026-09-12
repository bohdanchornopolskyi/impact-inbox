import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImportSummary } from "./import-summary";

const meta = {
  title: "Files/Import Summary",
  component: ImportSummary,
  args: {
    title: "3,204 contacts ready to import",
    className: "w-full max-w-[560px]",
    children:
      "41 rows skipped: 28 duplicates, 13 invalid addresses. Download the skipped rows to fix them.",
  },
} satisfies Meta<typeof ImportSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};
