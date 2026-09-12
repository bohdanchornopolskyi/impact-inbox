import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/button";
import { Modal } from "../dialog/dialog";

const meta = {
  title: "Overlays/Modal",
  component: Modal,
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Delete this workspace?"
          description="All templates, contacts and campaign history will be removed. This cannot be undone."
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setOpen(false)}>
                Delete workspace
              </Button>
            </>
          }
        >
          <p className="text-sm font-medium text-text-2">
            Type the workspace name to confirm
          </p>
        </Modal>
      </>
    );
  },
};
