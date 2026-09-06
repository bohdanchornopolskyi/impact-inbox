import { PLACEHOLDER_IMAGE_URL } from "@repo/shared";

const LOGO_WIDTH_CAP = 180;

export function isPlaceholderImageSrc(src: string): boolean {
  return src === PLACEHOLDER_IMAGE_URL;
}

export function imageWidthCap(
  blockType: "image" | "logo",
  templateWidth: number,
): number {
  if (blockType === "logo") {
    return Math.min(LOGO_WIDTH_CAP, templateWidth);
  }

  return templateWidth;
}

export function cappedDisplayWidth(
  naturalWidth: number,
  maxWidth: number,
): number {
  return Math.max(1, Math.min(Math.round(naturalWidth), maxWidth));
}

export function fallbackImageWidth(
  blockType: "image" | "logo",
): number | "100%" {
  return blockType === "logo" ? 120 : "100%";
}

export type ImageNaturalSize = {
  width: number;
  height: number;
};

export type ImageSizingMode = "original" | "fill" | "custom";

function gcd(left: number, right: number): number {
  let a = Math.abs(Math.round(left));
  let b = Math.abs(Math.round(right));
  while (b !== 0) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a || 1;
}

export function aspectRatioLabel(width: number, height: number): string | null {
  const divisor = gcd(width, height);
  const ratioWidth = width / divisor;
  const ratioHeight = height / divisor;
  if (ratioWidth > 32 || ratioHeight > 32) {
    return null;
  }
  return `${ratioWidth}:${ratioHeight}`;
}

export function formatAssetBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatLibraryTileMeta(
  width: number | null,
  height: number | null,
  bytes: number,
): string {
  const size = formatAssetBytes(bytes);
  if (width && height) {
    return `${width} × ${height} · ${size}`;
  }
  return size;
}

export function imageSizingMode(
  width: number | "100%" | undefined,
  naturalWidth: number | null,
  cap: number,
): ImageSizingMode {
  if (width === "100%" || width === undefined) {
    return "fill";
  }
  if (
    naturalWidth !== null &&
    width === cappedDisplayWidth(naturalWidth, cap)
  ) {
    return "original";
  }
  return "custom";
}

export function readNaturalImageSize(
  src: string,
): Promise<ImageNaturalSize | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
        return;
      }
      resolve(null);
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export async function readNaturalImageWidth(src: string): Promise<number | null> {
  const size = await readNaturalImageSize(src);
  return size?.width ?? null;
}

export async function widthForPickedImage(
  src: string,
  blockType: "image" | "logo",
  templateWidth: number,
): Promise<number | "100%"> {
  const natural = await readNaturalImageWidth(src);
  if (!natural) {
    return fallbackImageWidth(blockType);
  }

  return cappedDisplayWidth(natural, imageWidthCap(blockType, templateWidth));
}
