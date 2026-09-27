export function shownDraft(
  draft: { text: string; base: string } | null,
  value: string,
): string {
  return draft !== null && draft.base === value ? draft.text : value;
}

export function formatColumnWidths(widths: readonly number[] | undefined): string {
  return widths && widths.length > 0 ? widths.join(", ") : "";
}

export function parseColumnWidths(raw: string): number[] | undefined {
  const parsed = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number(part))
    .filter((width) => !Number.isNaN(width) && width >= 1 && width <= 100);

  return parsed.length > 0 ? parsed : undefined;
}

export function commitBackgroundPosition(raw: string): string | undefined {
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function formatTableHeaders(
  columns: readonly { header: string }[],
): string {
  return columns.map((column) => column.header).join(", ");
}

export function parseTableHeaders(raw: string): { header: string }[] {
  return raw
    .split(",")
    .map((header) => ({ header: header.trim() }))
    .filter((column) => column.header.length > 0);
}

export function formatTableRows(rows: readonly (readonly string[])[]): string {
  return rows.map((row) => row.join(", ")).join("\n");
}

export function parseTableRows(raw: string): string[][] {
  return raw
    .split("\n")
    .map((row) => row.split(",").map((cell) => cell.trim()))
    .filter((row) => row.length > 0);
}
