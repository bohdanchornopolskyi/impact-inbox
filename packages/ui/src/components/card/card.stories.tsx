import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "./card";

const meta = {
  title: "Shell/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Workspace details</CardTitle>
          <CardDescription>The slug appears in workspace URLs.</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="rounded-sm border border-border-strong px-3 py-2 text-sm text-text-3">
            Content slot
          </div>
          <Button variant="secondary" size="sm">
            Docs
          </Button>
        </CardBody>
      </>
    ),
  },
};
