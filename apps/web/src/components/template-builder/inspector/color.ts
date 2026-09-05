export type Hsva = {
  h: number;
  s: number;
  v: number;
  a: number;
};

export const BRAND_SWATCHES = [
  "#4f46e5",
  "#a5aaf7",
  "#e0e4fd",
  "#0f172a",
  "#8a93a0",
  "#e5e7eb",
  "#ffffff",
] as const;

export const RECENT_COLORS_KEY = "impact-inbox.recent-colors";
export const MAX_RECENT_COLORS = 6;

export function isValidHex(value: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(value.trim());
}

export function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toLowerCase()}`;
  }

  return "#000000";
}

export function resolveColorDraft(
  value: string | undefined,
  fallback?: string,
): string {
  return normalizeHex(value ?? fallback ?? "#000000");
}

export function shouldPersistColorDraft(
  draft: string,
  value: string | undefined,
  fallback?: string,
): boolean {
  const normalized = normalizeHex(draft);
  if (value === undefined) {
    return normalized !== normalizeHex(fallback ?? "#000000");
  }
  return normalized !== normalizeHex(value);
}

export function toHexDigits(hex: string): string {
  return normalizeHex(hex).slice(1).toUpperCase();
}

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex);
  return [
    Number.parseInt(normalized.slice(1, 3), 16),
    Number.parseInt(normalized.slice(3, 5), 16),
    Number.parseInt(normalized.slice(5, 7), 16),
  ];
}

export function isHexDark(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 160;
}

export function hexToHsva(hex: string, fallbackHue = 0, alpha = 1): Hsva {
  const [r8, g8, b8] = hexToRgb(hex);
  const r = r8 / 255;
  const g = g8 / 255;
  const b = b8 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = fallbackHue;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }

  return {
    h,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
    a: alpha,
  };
}

export function hsvaToHex({ h, s, v }: Hsva): string {
  const sat = s / 100;
  const val = v / 100;
  const chroma = val * sat;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = val - chroma;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = chroma;
    g = x;
  } else if (h < 120) {
    r = x;
    g = chroma;
  } else if (h < 180) {
    g = chroma;
    b = x;
  } else if (h < 240) {
    g = x;
    b = chroma;
  } else if (h < 300) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  const channel = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

export function hueColor(h: number): string {
  return hsvaToHex({ h, s: 100, v: 100, a: 1 });
}

export function brandSwatches(primary?: string): string[] {
  if (!primary || !isValidHex(primary)) {
    return [...BRAND_SWATCHES];
  }
  const normalized = normalizeHex(primary);
  return [
    normalized,
    ...BRAND_SWATCHES.slice(1).filter((color) => color !== normalized),
  ].slice(0, 7);
}

export function nextRecentColors(
  recents: string[],
  hex: string,
  max = MAX_RECENT_COLORS,
): string[] {
  const normalized = normalizeHex(hex);
  return [normalized, ...recents.filter((color) => color !== normalized)].slice(
    0,
    max,
  );
}

export function parseRecentColors(raw: string | null): string[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const colors: string[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      if (typeof item === "string" && isValidHex(item)) {
        const hex = normalizeHex(item);
        if (!seen.has(hex)) {
          seen.add(hex);
          colors.push(hex);
        }
      }
      if (colors.length === MAX_RECENT_COLORS) {
        break;
      }
    }
    return colors;
  } catch {
    return [];
  }
}

export function readRecentColors(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return parseRecentColors(window.localStorage.getItem(RECENT_COLORS_KEY));
  } catch {
    return [];
  }
}

export function rememberRecentColor(hex: string): string[] {
  const next = nextRecentColors(readRecentColors(), hex);
  try {
    window.localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
  } catch {
    // private mode / quota
  }
  return next;
}
