import type { Meta, StoryObj } from "@storybook/react-vite";
import { TypographyControl } from "./typography-control";

const meta = {
  title: "Editor/Typography Control",
  component: TypographyControl,
  args: {
    fontFamily: "inter",
    fontFamilies: [
      { value: "inter", label: "Inter" },
      { value: "georgia", label: "Georgia" },
    ],
    fontWeight: "semibold",
    fontWeights: [
      { value: "regular", label: "Regular" },
      { value: "semibold", label: "Semibold" },
      { value: "bold", label: "Bold" },
    ],
    fontSize: "16",
    lineHeight: "1.5",
    letterSpacing: "0",
    paragraphSpacing: "12",
    colorHex: "0F172A",
    align: "start",
    styles: ["bold"],
  },
} satisfies Meta<typeof TypographyControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
