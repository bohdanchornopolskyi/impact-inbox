export function filterEditorPanel(root: HTMLElement, query: string) {
  const q = query.trim().toLowerCase();

  for (const el of root.querySelectorAll<HTMLElement>("[data-filter]")) {
    const hay = el.dataset.filter ?? "";
    el.hidden = q.length > 0 && !hay.includes(q);
  }

  for (const group of root.querySelectorAll<HTMLElement>("[data-filter-group]")) {
    const hasMatch =
      group.querySelectorAll("[data-filter]:not([hidden])").length > 0;
    group.hidden = q.length > 0 && !hasMatch;

    const trigger = group.querySelector<HTMLButtonElement>(
      ":scope > [data-group-trigger]",
    );
    if (!trigger) {
      continue;
    }

    const isOpen = trigger.hasAttribute("data-panel-open");
    if (q.length > 0 && hasMatch && !isOpen) {
      trigger.click();
      group.dataset.searchOpened = "";
    } else if (q.length === 0 && group.dataset.searchOpened != null) {
      if (isOpen) {
        trigger.click();
      }
      delete group.dataset.searchOpened;
    }
  }

  const empty = root.querySelector<HTMLElement>("[data-filter-empty]");
  if (empty) {
    empty.hidden =
      q.length === 0 || root.querySelector("[data-filter]:not([hidden])") != null;
  }
}
