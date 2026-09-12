import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleSlash } from "lucide-react";
import { Badge } from "../badge/badge";
import { ContactListItem } from "./contact-list-item";

const meta = {
  title: "Data/Contact List Item",
  component: ContactListItem,
  args: {
    name: "Maren Rhodes",
    email: "maren@fieldnotes.org",
    added: "Mar 4, 2026",
  },
} satisfies Meta<typeof ContactListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

function Tags() {
  return (
    <>
      <Badge>Donors</Badge>
      <Badge>Monthly</Badge>
      <span className="text-xs text-text-3">+2</span>
    </>
  );
}

export const Default: Story = {
  args: {
    tags: <Tags />,
    status: (
      <Badge tone="success">Subscribed</Badge>
    ),
  },
};

export const Selected: Story = {
  args: {
    selected: true,
    tags: <Tags />,
    status: (
      <Badge tone="success">Subscribed</Badge>
    ),
  },
};

export const Unsubscribed: Story = {
  args: {
    unsubscribed: true,
    tags: <Tags />,
    status: (
      <Badge icon={<CircleSlash strokeWidth={1.5} />}>Unsubscribed</Badge>
    ),
  },
};

export const States: Story = {
  render: () => (
    <div className="w-[960px] overflow-hidden rounded-lg border border-border">
      <ContactListItem
        name="Maren Rhodes"
        email="maren@fieldnotes.org"
        added="Mar 4, 2026"
        tags={<Tags />}
        status={<Badge tone="success">Subscribed</Badge>}
      />
      <ContactListItem
        name="Maren Rhodes"
        email="maren@fieldnotes.org"
        added="Mar 4, 2026"
        selected
        tags={<Tags />}
        status={<Badge tone="success">Subscribed</Badge>}
      />
      <ContactListItem
        name="Maren Rhodes"
        email="maren@fieldnotes.org"
        added="Mar 4, 2026"
        unsubscribed
        tags={<Tags />}
        status={
          <Badge icon={<CircleSlash strokeWidth={1.5} />}>Unsubscribed</Badge>
        }
      />
    </div>
  ),
};
