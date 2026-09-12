import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Check,
  CopyPlus,
  History,
  LayoutTemplate,
  Send,
  Undo2,
} from "lucide-react";
import { SplitButton } from "./split-button";

const saveItems = [
  {
    label: "Save and close",
    shortcut: "⌘⇧S",
    icon: <Check strokeWidth={1.5} />,
    onSelect: () => undefined,
  },
  {
    label: "Save as copy",
    shortcut: "⌘R",
    icon: <CopyPlus strokeWidth={1.5} />,
    onSelect: () => undefined,
  },
  {
    label: "Save as new template",
    shortcut: "⌘R",
    icon: <LayoutTemplate strokeWidth={1.5} />,
    onSelect: () => undefined,
  },
  {
    label: "Save and send test",
    shortcut: "⌘R",
    icon: <Send strokeWidth={1.5} />,
    onSelect: () => undefined,
    separatorBefore: true,
  },
  {
    label: "Version history",
    shortcut: "⌘R",
    icon: <History strokeWidth={1.5} />,
    onSelect: () => undefined,
  },
  {
    label: "Discard changes",
    shortcut: "⌘R",
    icon: <Undo2 strokeWidth={1.5} />,
    onSelect: () => undefined,
    destructive: true,
    separatorBefore: true,
  },
];

const meta = {
  title: "Actions/Split Button",
  component: SplitButton,
  args: {
    children: "Save",
    items: saveItems,
    onClick: () => undefined,
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: {
    defaultOpen: true,
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-80 items-start justify-end p-4">
        <Story />
      </div>
    ),
  ],
};
