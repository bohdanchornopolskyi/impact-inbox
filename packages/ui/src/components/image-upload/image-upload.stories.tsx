import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImageUpload } from "./image-upload";

const meta = {
  title: "Files/Image Upload",
  component: ImageUpload,
} satisfies Meta<typeof ImageUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1596477602103-a64a83304ecf?w=432&q=80",
    alt: "Workspace image",
    onEdit: () => {},
    onCrop: () => {},
    onRemove: () => {},
  },
};
