import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./alert";

const meta = {
  title: "Feedback/Alert",
  component: Alert,
  args: {
    title: "Sending is paused",
    children: "Resume from the campaign page when you are ready.",
    onDismiss: () => undefined,
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    tone: "info",
    action: { label: "Resume sending", onClick: () => undefined },
  },
};

export const Success: Story = {
  args: {
    tone: "success",
    title: "Template saved",
    children: "All 4 blocks were validated for email clients.",
    action: { label: "View template", onClick: () => undefined },
  },
};

export const Warning: Story = {
  args: {
    tone: "warning",
    title: "Missing postal address",
    children: "CAN-SPAM requires one before this campaign can send.",
    action: { label: "Add address", onClick: () => undefined },
  },
};

export const Danger: Story = {
  args: {
    tone: "danger",
    title: "Import failed",
    children: "6 of 2,140 rows were rejected during validation.",
    action: { label: "Download report", onClick: () => undefined },
  },
};
