import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bookmark, ImageIcon, LayoutGrid, ListTree } from "lucide-react";
import { BlockTile } from "../block-tile/block-tile";
import {
  EditorPanel,
  EditorPanelBody,
  EditorPanelGroup,
  EditorPanelHint,
  EditorPanelScroll,
  EditorPanelSearch,
  EditorPanelTabs,
} from "./editor-panel";

const meta = {
  title: "Shell/Editor Panel",
  component: EditorPanel,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EditorPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blocks: Story = {
  render: () => (
    <div className="h-[640px] w-[300px]">
      <EditorPanel>
        <EditorPanelTabs
          aria-label="Editor panel"
          value="blocks"
          onChange={() => undefined}
          tabs={[
            { value: "blocks", label: "Blocks", icon: <LayoutGrid strokeWidth={1.5} /> },
            { value: "layers", label: "Layers", icon: <ListTree strokeWidth={1.5} /> },
            { value: "assets", label: "Assets", icon: <ImageIcon strokeWidth={1.5} /> },
            { value: "saved", label: "Saved", icon: <Bookmark strokeWidth={1.5} /> },
          ]}
        />
        <EditorPanelBody>
          <EditorPanelSearch placeholder="Search blocks" />
          <EditorPanelHint>Drag a block onto the canvas, or click to append</EditorPanelHint>
          <EditorPanelScroll>
            <div className="flex flex-col gap-4.5">
              <EditorPanelGroup title="Layout">
                <div className="grid grid-cols-2 gap-2">
                  <BlockTile label="Section" icon={<LayoutGrid strokeWidth={1.5} />} />
                  <BlockTile label="Row" icon={<LayoutGrid strokeWidth={1.5} />} />
                </div>
              </EditorPanelGroup>
            </div>
          </EditorPanelScroll>
        </EditorPanelBody>
      </EditorPanel>
    </div>
  ),
};
