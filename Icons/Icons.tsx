import { createLucideIcon, LucideIcon, type IconNode } from "lucide-react";

const customTopBorderNode: IconNode = [
  [
    "path",
    {
      d: "M3 5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5",
    },
  ],
];

const customBottomBorderNode: IconNode = [
  [
    "path",
    {
      d: "M21 19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21L5 21C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19",
    },
  ],
];

const customLeftBorderNode: IconNode = [
  [
    "path",
    {
      d: "M5 21C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19L3 5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3",
    },
  ],
];

const customRightBorderNode: IconNode = [
  [
    "path",
    {
      d: "M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5L21 19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21",
    },
  ],
];

const customTopBorderIcon = createLucideIcon("border-top", customTopBorderNode);

const customBottomBorderIcon = createLucideIcon(
  "border-bottom",
  customBottomBorderNode,
);

const customLeftBorderIcon = createLucideIcon(
  "border-left",
  customLeftBorderNode,
);

const customRightBorderIcon = createLucideIcon(
  "border-right",
  customRightBorderNode,
);

export const borderIcons: Record<string, LucideIcon> = {
  "border-top": customTopBorderIcon,
  "border-bottom": customBottomBorderIcon,
  "border-left": customLeftBorderIcon,
  "border-right": customRightBorderIcon,
};
