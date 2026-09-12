import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 3.5v9M3.5 8h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const meta = {
  title: "Actions/Button",
  component: Button,
  args: {
    children: "Save changes",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary", leftIcon: <PlusIcon /> },
};

export const Secondary: Story = {
  args: { variant: "secondary", leftIcon: <PlusIcon /> },
};

export const Ghost: Story = {
  args: { variant: "ghost", leftIcon: <PlusIcon /> },
};

export const Soft: Story = {
  args: { variant: "soft" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Delete workspace" },
};

export const Link: Story = {
  args: { variant: "link", children: "View report", rightIcon: <PlusIcon /> },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg" variant="primary">
        Create campaign
      </Button>
    </div>
  ),
};

export const Icon: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button icon variant="ghost" aria-label="Undo">
        <PlusIcon />
      </Button>
      <Button icon variant="secondary" aria-label="Copy">
        <PlusIcon />
      </Button>
      <Button icon variant="ghost" selected aria-label="Link selected">
        <PlusIcon />
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  args: { variant: "primary", loading: true, children: "Saving" },
};

export const Disabled: Story = {
  args: { variant: "primary", disabled: true, leftIcon: <PlusIcon /> },
};

export const FullWidth: Story = {
  args: { variant: "primary", fullWidth: true, children: "Sign in" },
};
