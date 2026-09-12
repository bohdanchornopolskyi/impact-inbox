import type { Meta, StoryObj } from "@storybook/react-vite";
import { UploadRow } from "./upload-row";

const meta = {
  title: "Files/Upload Row",
  component: UploadRow,
  args: {
    fileName: "contacts-march.csv",
    className: "w-full max-w-[520px]",
  },
} satisfies Meta<typeof UploadRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uploading: Story = {
  args: {
    meta: "2.4 MB · 68%",
    progress: 68,
    status: "uploading",
  },
};

export const Done: Story = {
  args: {
    meta: "3,204 rows · 2.4 MB",
    progress: 100,
    status: "done",
  },
};

export const Failed: Story = {
  args: {
    meta: "Upload failed",
    progress: 28,
    status: "failed",
  },
};
