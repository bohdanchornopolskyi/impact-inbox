export const TEMPLATE_NAME_MAX_LENGTH = 255;

export function nextTemplateName(draft: string, current: string): string | null {
  const next = draft.trim().slice(0, TEMPLATE_NAME_MAX_LENGTH);
  if (next.length === 0 || next === current) {
    return null;
  }
  return next;
}
