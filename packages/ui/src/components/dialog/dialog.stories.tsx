import type { Meta, StoryObj } from "@storybook/react";
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
          title="Delete template?"
          description="This archives the template. Campaign history is preserved."
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setOpen(false)}>
                Archive
              </Button>
            </>
          }
        >
          <p className="text-ui-sm text-text-secondary">
            You can restore working copy content from revision history later.
          </p>
        </Modal>
      </>
    );
  },
};
