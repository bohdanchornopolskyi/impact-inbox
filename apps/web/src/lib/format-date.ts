import { format, isValid, parseISO } from "date-fns";

export function parseApiDate(
  value: Date | string | null | undefined,
): Date | null {
  if (value == null) {
    return null;
  }

  const date = value instanceof Date ? value : parseISO(value);
  return isValid(date) ? date : null;
}

export function formatDateTime(
  value: Date | string | null | undefined,
  fallback = "—",
): string {
  const date = parseApiDate(value);

  if (!date) {
    return fallback;
  }

  return format(date, "PPp");
}
