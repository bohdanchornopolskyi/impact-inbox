import type { BlockStyles } from "@repo/shared";

const DEFAULT_FILL_COLOR = "#F4F6F8";

export type BackgroundFillMode = "none" | "color" | "image";

export type BlockFillPatch = {
  props?: Record<string, unknown>;
  styles?: Partial<BlockStyles>;
};

export function isBackgroundImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function backgroundFillMode(
  styles: BlockStyles | undefined,
  props: Record<string, unknown>,
): BackgroundFillMode {
  if (isBackgroundImageUrl(props.backgroundImage)) {
    return "image";
  }
  if (styles?.backgroundColor) {
    return "color";
  }
  return "none";
}

export function sectionFillChange(
  block: {
    type: string;
    styles?: BlockStyles;
    props?: object;
  },
  next: BackgroundFillMode,
): BlockFillPatch | null {
  const styles = block.styles ?? {};
  const props = (block.props ?? {}) as Record<string, unknown>;
  const image = props.backgroundImage;
  const patch: BlockFillPatch = {};

  if (next === "none") {
    if (styles.backgroundColor) {
      patch.styles = { backgroundColor: undefined };
    }
    if (block.type === "section" && image !== undefined) {
      patch.props = { backgroundImage: undefined };
    }
  } else if (next === "color") {
    if (block.type === "section" && image !== undefined) {
      patch.props = { backgroundImage: undefined };
    }
    if (!styles.backgroundColor) {
      patch.styles = { backgroundColor: DEFAULT_FILL_COLOR };
    }
  } else if (block.type === "section") {
    if (styles.backgroundColor) {
      patch.styles = { backgroundColor: undefined };
    }
    if (image !== undefined && !isBackgroundImageUrl(image)) {
      patch.props = { backgroundImage: undefined };
    }
  }

  if (!patch.props && !patch.styles) {
    return null;
  }

  return patch;
}
