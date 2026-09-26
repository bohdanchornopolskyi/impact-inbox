import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CopyPlus,
  Download,
  History,
  LayoutTemplate,
  Save,
} from "lucide-react";
import { SplitButton } from "./split-button";

const saveItems = [
  {
    label: "Save version…",
    shortcut: "⌘S",
    icon: <Save strokeWidth={1.5} />,
    onSelect: () => undefined,
  },
  {
    label: "Duplicate template",
    icon: <CopyPlus strokeWidth={1.5} />,
    onSelect: () => undefined,
  },
  {
    label: "Save as new template",
    icon: <LayoutTemplate strokeWidth={1.5} />,
    onSelect: () => undefined,
  },
  {
    label: "Export HTML",
    icon: <Download strokeWidth={1.5} />,
    onSelect: () => undefined,
  },
  {
    label: "Version history",
    icon: <History strokeWidth={1.5} />,
    separatorBefore: true,
    onSelect: () => undefined,
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
