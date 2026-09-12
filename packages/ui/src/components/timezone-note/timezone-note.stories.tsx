import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimezoneNote } from "./timezone-note";

const meta = {
  title: "Pickers/Timezone Note",
  component: TimezoneNote,
  args: {
    children: "Sends 09:30 in Europe/Berlin (CET)",
  },
} satisfies Meta<typeof TimezoneNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
