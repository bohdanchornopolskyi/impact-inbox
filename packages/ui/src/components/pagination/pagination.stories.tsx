import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "./pagination";

const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  args: {
    page: 1,
    pageCount: 12,
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {};

export const MiddlePage: Story = {
  args: { page: 6 },
};

export const LastPage: Story = {
  args: { page: 12 },
};
