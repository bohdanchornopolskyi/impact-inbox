import type { Meta, StoryObj } from "@storybook/react-vite";
import { RectangleHorizontal } from "lucide-react";
import { Breadcrumb, BreadcrumbItem } from "./breadcrumb";

const meta = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Current: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem current icon={<RectangleHorizontal strokeWidth={2} />}>
        Column
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const Trail: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem icon={<RectangleHorizontal strokeWidth={2} />}>
        Body
      </BreadcrumbItem>
      <BreadcrumbItem current icon={<RectangleHorizontal strokeWidth={2} />}>
        Column
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};
