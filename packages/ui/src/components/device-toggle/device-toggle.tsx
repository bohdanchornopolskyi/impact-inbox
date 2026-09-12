"use client";

import { Monitor, Smartphone } from "lucide-react";
import {
  SegmentedControl,
  type SegmentedControlProps,
} from "../segmented-control/segmented-control";

export type DeviceToggleValue = "desktop" | "mobile";

export type DeviceToggleProps = Omit<
  SegmentedControlProps,
  "options" | "value" | "onChange" | "iconOnly"
> & {
  value: DeviceToggleValue;
  onChange: (value: DeviceToggleValue) => void;
};

export function DeviceToggle({ value, onChange, ...props }: DeviceToggleProps) {
  return (
    <SegmentedControl
      {...props}
      value={value}
      onChange={(next) => onChange(next as DeviceToggleValue)}
      options={[
        {
          value: "desktop",
          label: "Desktop",
          icon: <Monitor strokeWidth={1.5} />,
        },
        {
          value: "mobile",
          label: "Mobile",
          icon: <Smartphone strokeWidth={1.5} />,
        },
      ]}
    />
  );
}
