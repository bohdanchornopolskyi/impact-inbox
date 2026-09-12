import type { Meta, StoryObj } from "@storybook/react-vite";
import { InviteSummary } from "./invite-summary";

const meta = {
  title: "Auth/Invite Summary",
  component: InviteSummary,
  args: {
    organizationName: "Bright Fund",
    workspaceName: "Community team",
    invitedBy: "david@brightfund.org",
    role: "Editor",
  },
} satisfies Meta<typeof InviteSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OrganizationOnly: Story = {
  args: {
    workspaceName: null,
    role: "Admin",
  },
};
