export type NumberDraftCommit =
  | { status: "value"; value: number }
  | { status: "unset" }
  | { status: "keep" };

export function commitNumberDraft(
  raw: string,
  options: {
    min?: number;
    max?: number;
    optional?: boolean;
  },
): NumberDraftCommit {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return options.optional ? { status: "unset" } : { status: "keep" };
  }

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    return { status: "keep" };
  }

  const min = options.min ?? Number.NEGATIVE_INFINITY;
  const max = options.max ?? Number.POSITIVE_INFINITY;
  return { status: "value", value: Math.min(max, Math.max(min, numeric)) };
}
