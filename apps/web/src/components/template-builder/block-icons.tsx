import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  CircleDot,
  Code,
  Columns3,
  Diamond,
  Heading,
  Image,
  LayoutPanelTop,
  Minus,
  MoveVertical,
  PanelBottom,
  Pilcrow,
  Play,
  QrCode,
  RectangleHorizontal,
  Share2,
  Square,
  Table,
  type LucideProps,
} from "lucide-react";
import type { TemplateBlockType } from "@repo/shared";
import { cn } from "@repo/ui/client";

const BLOCK_ICONS: Record<TemplateBlockType, LucideIcon> = {
  section: LayoutPanelTop,
  row: Columns3,
  column: Square,
  heading: Heading,
  text: AlignLeft,
  richtext: Pilcrow,
  button: RectangleHorizontal,
  image: Image,
  logo: CircleDot,
  video: Play,
  divider: Minus,
  spacer: MoveVertical,
  social: Share2,
  html: Code,
  table: Table,
  shape: Diamond,
  footer: PanelBottom,
  qr: QrCode,
};

type TemplateBlockIconProps = LucideProps & {
  type: TemplateBlockType;
};

export function TemplateBlockIcon({
  type,
  className,
  ...props
}: TemplateBlockIconProps) {
  const Icon = BLOCK_ICONS[type];

  return (
    <Icon
      className={cn("size-5 shrink-0", className)}
      strokeWidth={1.5}
      aria-hidden
      {...props}
    />
  );
}
