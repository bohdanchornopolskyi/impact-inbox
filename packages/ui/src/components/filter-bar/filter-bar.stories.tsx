import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, ArrowUpDown } from "lucide-react";
import { Button } from "../button/button";
import { FilterChip } from "../filter-chip/filter-chip";
import { Search } from "../search/search";
import {
  FilterBar,
  FilterBarCount,
  FilterBarRule,
  FilterBarSpacer,
} from "./filter-bar";

const meta = {
  title: "Data/Filter Bar",
  component: FilterBar,
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[960px]">
      <FilterBar>
        <div className="w-[260px] shrink-0">
          <Search placeholder="Search blocks" aria-label="Search" />
        </div>
        <FilterChip label="Status" value="Sent, Sending" active />
        <FilterChip label="Audience" value="All" />
        <FilterChip label="Date" value="Any" />
        <Button variant="ghost" leftIcon={<Plus strokeWidth={1.5} />}>
          Add filter
        </Button>
        <FilterBarSpacer />
        <FilterBarCount>12 of 48</FilterBarCount>
        <FilterBarRule />
        <FilterChip
          label="Sort"
          value="Newest"
          icon={<ArrowUpDown strokeWidth={1.5} />}
        />
      </FilterBar>
    </div>
  ),
};
