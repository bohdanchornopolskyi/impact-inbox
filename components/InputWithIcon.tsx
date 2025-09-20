"use client";

import { Input } from "@/components/ui/input";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

interface InputWithIconProps {
  name: IconName;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export function InputWithIcon({ name, value, onChange }: InputWithIconProps) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        <DynamicIcon name={name} className="h-5 w-5" />
      </span>
      <Input
        value={value ?? ""}
        onChange={(e) => {
          const numValue =
            e.target.value === "" ? undefined : Number(e.target.value);
          onChange(isNaN(numValue as number) ? undefined : numValue);
        }}
        className="pl-10"
        type="number"
        min="0"
        step="1"
      />
    </div>
  );
}
