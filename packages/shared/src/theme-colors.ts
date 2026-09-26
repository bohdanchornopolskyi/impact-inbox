import { embeddedThemeCss } from "./embedded-theme-css";

type NodeProcess = {
  cwd: () => string;
  getBuiltinModule?: (id: string) => object;
};

type FsModule = {
  existsSync: (path: string) => boolean;
  readFileSync: (path: string, encoding: "utf8") => string;
};

type PathModule = {
  join: (...paths: string[]) => string;
  dirname: (path: string) => string;
};

const THEME_CSS = "packages/ui/src/styles/theme.css";

let cached: Map<string, string> | undefined;

function nodeProcess(): NodeProcess | undefined {
  const value = (globalThis as { process?: NodeProcess }).process;
  if (!value?.getBuiltinModule || !value.cwd) {
    return undefined;
  }
  return value;
}

function isFsModule(value: object): value is FsModule {
  return "existsSync" in value && "readFileSync" in value;
}

function isPathModule(value: object): value is PathModule {
  return "join" in value && "dirname" in value;
}

function readThemeCss(proc: NodeProcess): string {
  const fs = proc.getBuiltinModule?.("fs");
  const path = proc.getBuiltinModule?.("path");
  if (!fs || !path || !isFsModule(fs) || !isPathModule(path)) {
    throw new Error("theme.css can only be read in Node");
  }

  let dir = proc.cwd();
  for (let i = 0; i < 8; i += 1) {
    const candidate = path.join(dir, THEME_CSS);
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, "utf8");
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  throw new Error("theme.css not found");
}

function parseThemeColors(css: string): Map<string, string> {
  const raw = new Map<string, string>();
  for (const match of css.matchAll(/(--color-[\w-]+)\s*:\s*([^;]+);/g)) {
    const name = match[1];
    const value = match[2];
    if (name && value) {
      raw.set(name, value.trim());
    }
  }

  const resolved = new Map<string, string>();

  function resolve(name: string, seen: Set<string>): string | undefined {
    const cachedValue = resolved.get(name);
    if (cachedValue) {
      return cachedValue;
    }
    const value = raw.get(name);
    if (!value || seen.has(name)) {
      return undefined;
    }
    seen.add(name);

    const hex = value.match(/#[0-9a-fA-F]{6}(?![0-9a-fA-F])/);
    if (hex?.[0]) {
      const normalized = hex[0].toLowerCase();
      resolved.set(name, normalized);
      return normalized;
    }

    const ref = value.match(/^var\((--color-[\w-]+)\)$/);
    const next = ref?.[1] ? resolve(ref[1], seen) : undefined;
    if (next) {
      resolved.set(name, next);
    }
    return next;
  }

  for (const name of raw.keys()) {
    resolve(name, new Set());
  }

  return resolved;
}

function loadThemeCss(): string {
  const proc = nodeProcess();
  if (!proc) {
    return embeddedThemeCss;
  }

  try {
    return readThemeCss(proc);
  } catch {
    return embeddedThemeCss;
  }
}

function colorsFromFile(): Map<string, string> {
  if (cached) {
    return cached;
  }
  cached = parseThemeColors(loadThemeCss());
  return cached;
}

export function themeColor(token: `--color-${string}`): string {
  const value = colorsFromFile().get(token);
  if (!value) {
    throw new Error(`Missing ${token} in theme.css`);
  }
  return value;
}
