export type SelectionInsert = {
  value: string;
  caret: number;
};

/**
 * Replaces `[start, end)` with `insertion` and reports where the caret belongs
 * afterwards. Out-of-range or missing bounds append to the end of the value.
 */
export function insertAtSelection(
  value: string,
  insertion: string,
  start?: number | null,
  end?: number | null,
): SelectionInsert {
  const from = clamp(start ?? value.length, value.length);
  const to = Math.max(from, clamp(end ?? from, value.length));

  return {
    value: `${value.slice(0, from)}${insertion}${value.slice(to)}`,
    caret: from + insertion.length,
  };
}

function clamp(index: number, length: number): number {
  return Math.max(0, Math.min(index, length));
}
