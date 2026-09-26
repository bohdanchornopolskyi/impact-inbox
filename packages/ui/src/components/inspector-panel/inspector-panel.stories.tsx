import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, Ellipsis, LayoutGrid } from "lucide-react";
import { Button } from "../button/button";
import { CollapsibleSection } from "../collapsible/collapsible";
import { InspectorRow } from "../inspector-row/inspector-row";
import { SegmentedControl } from "../segmented-control/segmented-control";
import { UnitField } from "../unit-field/unit-field";
import {
  InspectorPanel,
  InspectorPanelBody,
  InspectorPanelFooter,
  InspectorPanelHeader,
  InspectorPanelScroll,
  InspectorPanelTabs,
} from "./inspector-panel";

const meta = {
  title: "Shell/Inspector Panel",
  component: InspectorPanel,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof InspectorPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Block: Story = {
  render: () => (
    <div className="h-[720px] w-[340px]">
      <InspectorPanel>
        <InspectorPanelTabs
          aria-label="Inspector"
          value="block"
          onChange={() => undefined}
          options={[
            { value: "block", label: "Block" },
            { value: "template", label: "Template" },
          ]}
        />
        <InspectorPanelHeader
          icon={<LayoutGrid strokeWidth={1.5} />}
          title="Column"
          context="in Row · 2 of 2"
          actions={
            <>
              <Button icon variant="ghost" size="sm" aria-label="Duplicate">
                <Copy strokeWidth={1.5} />
              </Button>
              <Button icon variant="ghost" size="sm" aria-label="More actions">
                <Ellipsis strokeWidth={1.5} />
              </Button>
            </>
          }
        />
        <InspectorPanelBody>
          <InspectorPanelScroll>
            <CollapsibleSection title="Size & alignment" defaultOpen>
              <div className="flex flex-col gap-3">
                <InspectorRow label="Width">
                  <SegmentedControl
                    className="w-full [&_button]:min-w-0 [&_button]:flex-1"
                    value="fill"
                    onChange={() => undefined}
                    options={[
                      { value: "fill", label: "Fill" },
                      { value: "fixed", label: "Fixed" },
                    ]}
                  />
                </InspectorRow>
                <InspectorRow label="Gap">
                  <UnitField className="h-8" defaultValue={12} aria-label="Gap" />
                </InspectorRow>
              </div>
            </CollapsibleSection>
            <CollapsibleSection title="Background" summary="None">
              Color and fill
            </CollapsibleSection>
            <CollapsibleSection title="Border & corners" summary="None">
              Style, width, radius
            </CollapsibleSection>
          </InspectorPanelScroll>
        </InspectorPanelBody>
        <InspectorPanelFooter>
          <Button variant="secondary" className="flex-1" leftIcon={<Copy strokeWidth={1.5} />}>
            Duplicate
          </Button>
          <Button variant="danger" className="flex-1">
            Remove
          </Button>
        </InspectorPanelFooter>
      </InspectorPanel>
    </div>
  ),
};
