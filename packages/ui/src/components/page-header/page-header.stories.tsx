import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookOpen } from "lucide-react";
import { Button } from "../button/button";
import { PageHeader } from "./page-header";

const meta = {
  title: "Shell/Page Header",
  component: PageHeader,
  args: {
    title: "General",
    description: "Workspace identity and the postal address on every email.",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    actions: (
      <Button variant="secondary" leftIcon={<BookOpen strokeWidth={2} />}>
        Docs
      </Button>
    ),
  },
};

export const TitleOnly: Story = {
  args: {
    description: undefined,
  },
};
