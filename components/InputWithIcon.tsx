"use client";

import { Input } from "@/components/ui/input";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { Square, SquareDashedTopSolid } from "lucide-react";

interface InputWithIconProps {
  name:
    | IconName
    | "square"
    | "border-top"
    | "border-right"
    | "border-bottom"
    | "border-left";
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export function InputWithIcon({ name, value, onChange }: InputWithIconProps) {
  const isSquareIcon = name === "square";
  const isBorderIcon = [
    "border-top",
    "border-right",
    "border-bottom",
    "border-left",
  ].includes(name);

  const getBorderIconRotation = (iconName: string) => {
    switch (iconName) {
      case "border-top":
        return "rotate-0";
      case "border-right":
        return "rotate-90";
      case "border-bottom":
        return "rotate-180";
      case "border-left":
        return "-rotate-90";
      default:
        return "rotate-0";
    }
  };

  const renderIcon = () => {
    if (isSquareIcon) {
      return <Square className="h-5 w-5" />;
    } else if (isBorderIcon) {
      return (
        <SquareDashedTopSolid
          className={`h-5 w-5 ${getBorderIconRotation(name)}`}
        />
      );
    } else {
      return <DynamicIcon name={name as IconName} className="h-5 w-5" />;
    }
  };

  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        {renderIcon()}
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
