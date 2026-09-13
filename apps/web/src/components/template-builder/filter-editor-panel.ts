export function filterEditorPanel(root: HTMLElement, query: string) {
  const q = query.trim().toLowerCase();

  for (const el of root.querySelectorAll<HTMLElement>("[data-filter]")) {
    const hay = el.dataset.filter ?? "";
    el.hidden = q.length > 0 && !hay.includes(q);
  }

  for (const group of root.querySelectorAll<HTMLElement>("[data-filter-group]")) {
    group.hidden =
      q.length > 0 &&
      group.querySelectorAll("[data-filter]:not([hidden])").length === 0;
  }

  const empty = root.querySelector<HTMLElement>("[data-filter-empty]");
  if (empty) {
    empty.hidden =
      q.length === 0 || root.querySelector("[data-filter]:not([hidden])") != null;
  }
}
