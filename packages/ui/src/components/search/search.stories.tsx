import type { Meta, StoryObj } from "@storybook/react";
import { Search } from "./search";

const meta = {
  title: "Forms/Search",
  component: Search,
  args: {
    placeholder: "Search blocks",
    "aria-label": "Search blocks",
  },
} satisfies Meta<typeof Search>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};

export const Filled: Story = {
  args: { defaultValue: "welcome" },
};

export const Error: Story = {
  args: { error: "Enter a search term." },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const States: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-3">
      <Search placeholder="Search blocks" aria-label="Search rest" />
      <Search
        placeholder="Search blocks"
        aria-label="Search filled"
        defaultValue="welcome"
      />
      <Search
        placeholder="Search blocks"
        aria-label="Search error"
        error="Enter a search term."
      />
      <Search placeholder="Search blocks" aria-label="Search disabled" disabled />
    </div>
  ),
};
