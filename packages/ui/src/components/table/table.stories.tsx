import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../badge/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
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
