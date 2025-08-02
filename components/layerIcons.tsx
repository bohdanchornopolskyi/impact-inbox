import type React from "react";
import { ImageIcon, MousePointer, Square, Type } from "lucide-react";
import type { AnyBlock } from "@/lib/types";

export const getLayerIcon = (type: AnyBlock["type"]) => {
  switch (type) {
    case "text":
      return <Type className="h-3 w-3" />;
    case "image":
      return <ImageIcon className="h-3 w-3" />;
    case "button":
      return <MousePointer className="h-3 w-3" />;
    default:
      return <Square className="h-3 w-3" />;
  }
};
