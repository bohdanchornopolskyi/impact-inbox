import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookOpen } from "lucide-react";
import { Button } from "../button/button";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card/card";
import { Input } from "../input/input";
import { PageHeader } from "../page-header/page-header";
import { SettingsContent, SettingsPreview } from "./settings-content";

const meta = {
  title: "Shell/Settings Content",
  component: SettingsContent,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SettingsContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const General: Story = {
  render: () => (
    <SettingsContent>
      <PageHeader
        title="General"
        description="Workspace identity and the postal address required on every email you send."
        actions={
          <Button variant="secondary" leftIcon={<BookOpen strokeWidth={1.5} />}>
            Docs
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Workspace details</CardTitle>
          <CardDescription>
            The slug appears in workspace URLs. Old links keep redirecting after
            a change.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" defaultValue="Bohdan's Workspace" />
            <Input label="Slug" defaultValue="bohdans-workspace" mono />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Postal address</CardTitle>
          <CardDescription>
            Required by CAN-SPAM and shown in the footer of every email sent from
            this workspace.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <Input label="Street address" defaultValue="123 Main St" />
          <Input
            label="Apt, suite, etc. (optional)"
            defaultValue="Suite 100"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="City" defaultValue="San Francisco" />
            <Input label="State / province (optional)" defaultValue="CA" />
            <Input label="ZIP / postal code" defaultValue="94102" />
            <Input label="Country" defaultValue="United States" />
          </div>
          <SettingsPreview>
            Appears as: Bohdan&apos;s Workspace, 123 Main St, Suite 100, San
            Francisco, CA 94102
          </SettingsPreview>
        </CardBody>
      </Card>
    </SettingsContent>
  ),
};
