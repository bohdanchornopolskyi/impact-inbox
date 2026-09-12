import type { Meta, StoryObj } from "@storybook/react-vite";
import { VersionEntry } from "./version-entry";

const meta = {
  title: "Editor/Version Entry",
  component: VersionEntry,
  args: {
    time: "10:24 AM",
    author: "Bohdan",
    authorInitials: "BC",
    badge: "Named",
    added: 1,
    edited: 4,
    removed: 1,
  },
} satisfies Meta<typeof VersionEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

export const Selected: Story = {
  args: {
    selected: true,
    badge: "Viewing",
    changes: [
      { tone: "added", label: "Row added" },
      { tone: "removed", label: "Social links removed" },
      { tone: "edited", label: "Subject changed" },
      { tone: "edited", label: "Image changed" },
    ],
    moreCount: 2,
  },
};
