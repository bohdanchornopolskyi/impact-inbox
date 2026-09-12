import type { Meta, StoryObj } from "@storybook/react-vite";
import { Ellipsis } from "lucide-react";
import { Badge } from "../badge/badge";
import { Checkbox } from "../checkbox/checkbox";
import { Pagination } from "../pagination/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  tableActionClassName,
} from "./table";

const meta = {
  title: "Data/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RowStates: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow interactive={false} className="h-10">
          <TableHead>Campaign</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium text-text">Spring Launch</TableCell>
          <TableCell>
            <Badge tone="success" icon={false}>
              Sent
            </Badge>
          </TableCell>
          <TableCell>Mar 12</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium text-text">Weekly Digest</TableCell>
          <TableCell>
            <Badge tone="info" icon={false}>
              Sending
            </Badge>
          </TableCell>
          <TableCell className="text-text-3">—</TableCell>
        </TableRow>
        <TableRow selected>
          <TableCell className="font-medium text-text">Welcome Series</TableCell>
          <TableCell>
            <Badge icon={false}>Draft</Badge>
          </TableCell>
          <TableCell className="text-text-3">—</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow interactive={false} className="h-12">
          <TableCell colSpan={3}>3 of 48 campaigns</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Selectable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow interactive={false} className="h-10">
          <TableHead className="w-10">
            <Checkbox aria-label="Select all" indeterminate />
          </TableHead>
          <TableHead>Campaign</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead className="w-[60px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow selected>
          <TableCell>
            <Checkbox aria-label="Select Spring Launch" defaultChecked />
          </TableCell>
          <TableCell className="font-medium text-text">Spring Launch</TableCell>
          <TableCell>
            <Badge tone="success" icon={false}>
              Sent
            </Badge>
          </TableCell>
          <TableCell>Mar 12</TableCell>
          <TableCell>
            <button type="button" aria-label="Actions" className={tableActionClassName}>
              <Ellipsis className="size-icon-sm" strokeWidth={1.5} />
            </button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Checkbox aria-label="Select Weekly Digest" />
          </TableCell>
          <TableCell className="font-medium text-text">Weekly Digest</TableCell>
          <TableCell>
            <Badge tone="info" icon={false}>
              Sending
            </Badge>
          </TableCell>
          <TableCell className="text-text-3">—</TableCell>
          <TableCell>
            <button type="button" aria-label="Actions" className={tableActionClassName}>
              <Ellipsis className="size-icon-sm" strokeWidth={1.5} />
            </button>
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow interactive={false} className="h-12">
          <TableCell colSpan={5}>
            <div className="flex items-center justify-between">
              <span>1 selected · 4 of 48 campaigns</span>
              <Pagination page={1} pageCount={12} />
            </div>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};
