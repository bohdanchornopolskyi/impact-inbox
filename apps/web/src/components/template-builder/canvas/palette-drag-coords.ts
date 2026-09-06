function isPointInRect(
  rect: DOMRectReadOnly,
  clientX: number,
  clientY: number,
): boolean {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

export function viewportToIframeCoords(
  iframeRect: DOMRectReadOnly,
  clientX: number,
  clientY: number,
): { clientX: number; clientY: number; isOverIframe: boolean } {
  const iframeX = clientX - iframeRect.left;
  const iframeY = clientY - iframeRect.top;
  const isOverIframe = isPointInRect(iframeRect, clientX, clientY);

  return {
    clientX: isOverIframe ? iframeX : -1,
    clientY: isOverIframe ? iframeY : -1,
    isOverIframe,
  };
}

export function dropAreaToIframeCoords(
  dropAreaRect: DOMRectReadOnly | null,
  iframeRect: DOMRectReadOnly | null,
  clientX: number,
  clientY: number,
): { clientX: number; clientY: number; isOverDropArea: boolean } {
  if (
    !dropAreaRect ||
    !iframeRect ||
    !isPointInRect(dropAreaRect, clientX, clientY)
  ) {
    return { clientX: -1, clientY: -1, isOverDropArea: false };
  }

  return {
    clientX: Math.min(iframeRect.width, Math.max(0, clientX - iframeRect.left)),
    clientY: Math.min(iframeRect.height, Math.max(0, clientY - iframeRect.top)),
    isOverDropArea: true,
  };
}

export function toIframePointerCoords(
  dropArea: HTMLElement | null,
  iframe: HTMLIFrameElement | null,
  clientX: number,
  clientY: number,
): { clientX: number; clientY: number } {
  const { clientX: iframeX, clientY: iframeY } = dropAreaToIframeCoords(
    dropArea?.getBoundingClientRect() ?? null,
    iframe?.getBoundingClientRect() ?? null,
    clientX,
    clientY,
  );

  return { clientX: iframeX, clientY: iframeY };
}
