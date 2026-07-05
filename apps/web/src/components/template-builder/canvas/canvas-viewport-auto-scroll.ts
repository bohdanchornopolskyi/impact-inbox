const EDGE_PX = 56;
const MAX_STEP_PX = 14;

export function stepCanvasViewportAutoScroll(
  scrollContainer: HTMLElement,
  viewportClientY: number,
): void {
  const rect = scrollContainer.getBoundingClientRect();
  const fromTop = viewportClientY - rect.top;
  const fromBottom = rect.bottom - viewportClientY;

  if (fromTop >= 0 && fromTop < EDGE_PX) {
    const intensity = 1 - fromTop / EDGE_PX;
    scrollContainer.scrollTop -= Math.ceil(MAX_STEP_PX * intensity);
    return;
  }

  if (fromBottom >= 0 && fromBottom < EDGE_PX) {
    const intensity = 1 - fromBottom / EDGE_PX;
    scrollContainer.scrollTop += Math.ceil(MAX_STEP_PX * intensity);
  }
}
