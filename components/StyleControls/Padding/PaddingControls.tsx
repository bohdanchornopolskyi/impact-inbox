import { InputWithIcon } from "@/components/InputWithIcon";
import { BlockStyles } from "@/lib/types";

interface PaddingControlsProps {
  value: Partial<BlockStyles>;
  onChange: (key: string, value: number | undefined) => void;
}

export function PaddingControls({ value, onChange }: PaddingControlsProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Padding</div>
      <div className="grid grid-cols-2 gap-2">
        <InputWithIcon
          name="panel-top"
          value={value.paddingTop}
          onChange={(val) => onChange("paddingTop", val)}
        />
        <InputWithIcon
          name="panel-bottom"
          value={value.paddingBottom}
          onChange={(val) => onChange("paddingBottom", val)}
        />
        <InputWithIcon
          name="panel-left"
          value={value.paddingLeft}
          onChange={(val) => onChange("paddingLeft", val)}
        />
        <InputWithIcon
          name="panel-right"
          value={value.paddingRight}
          onChange={(val) => onChange("paddingRight", val)}
        />
      </div>
    </div>
  );
}
