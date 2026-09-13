import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Check,
  ChevronLeft,
  CopyPlus,
  Download,
  Ellipsis,
  Eye,
  History,
  LayoutTemplate,
  MailCheck,
  Redo2,
  Send,
  Undo2,
} from "lucide-react";
import { Button } from "../button/button";
import { DeviceToggle } from "../device-toggle/device-toggle";
import { DropdownMenu } from "../dropdown-menu/dropdown-menu";
import { SaveStatus } from "../save-status/save-status";
import { SplitButton } from "../split-button/split-button";
import { ZoomControl } from "../zoom-control/zoom-control";
import {
  EditorBar,
  EditorBarCenter,
  EditorBarDivider,
  EditorBarEnd,
  EditorBarStart,
} from "./editor-bar";

const meta = {
  title: "Shell/Editor Bar",
  component: EditorBar,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EditorBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TemplateEditor: Story = {
  render: () => (
    <EditorBar>
      <EditorBarStart>
        <Button variant="ghost" size="sm" leftIcon={<ChevronLeft strokeWidth={1.5} />}>
          Templates
        </Button>
        <EditorBarDivider />
        <Button variant="ghost" size="sm">
          Spring Launch Announcement
        </Button>
        <SaveStatus tone="saved" label="Saved 2 min ago" />
      </EditorBarStart>
      <EditorBarCenter>
        <DeviceToggle value="desktop" onChange={() => undefined} />
        <ZoomControl value={100} onChange={() => undefined} />
      </EditorBarCenter>
      <EditorBarEnd>
        <div className="flex items-center gap-0.5">
          <Button icon variant="ghost" className="size-[30px]" aria-label="Undo">
            <Undo2 />
          </Button>
          <Button icon variant="ghost" className="size-[30px]" aria-label="Redo">
            <Redo2 />
          </Button>
          <Button icon variant="ghost" className="size-[30px]" aria-label="Version history">
            <History />
          </Button>
        </div>
        <EditorBarDivider />
        <Button variant="secondary" leftIcon={<Eye strokeWidth={1.5} />}>
          Preview
        </Button>
        <SplitButton
          items={[
            {
              label: "Save and close",
              shortcut: "⌘⇧S",
              icon: <Check strokeWidth={1.5} />,
              onSelect: () => undefined,
            },
            {
              label: "Save as copy",
              icon: <CopyPlus strokeWidth={1.5} />,
              onSelect: () => undefined,
            },
            {
              label: "Save as new template",
              icon: <LayoutTemplate strokeWidth={1.5} />,
              onSelect: () => undefined,
            },
            {
              label: "Save and send test",
              icon: <Send strokeWidth={1.5} />,
              onSelect: () => undefined,
              separatorBefore: true,
            },
            {
              label: "Version history",
              icon: <History strokeWidth={1.5} />,
              onSelect: () => undefined,
            },
            {
              label: "Discard changes",
              icon: <Undo2 strokeWidth={1.5} />,
              onSelect: () => undefined,
              destructive: true,
              separatorBefore: true,
            },
          ]}
        >
          Save
        </SplitButton>
        <DropdownMenu
          aria-label="More actions"
          className="size-[30px] p-0 [&_svg]:size-icon-sm"
          trigger={<Ellipsis strokeWidth={1.5} />}
          items={[
            {
              label: "Test send",
              icon: <MailCheck strokeWidth={1.5} />,
              disabled: true,
              onSelect: () => undefined,
            },
            {
              label: "Export",
              icon: <Download strokeWidth={1.5} />,
              onSelect: () => undefined,
            },
          ]}
        />
      </EditorBarEnd>
    </EditorBar>
  ),
};
