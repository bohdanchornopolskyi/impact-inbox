export function viewportToIframeCoords(
  iframeRect: DOMRectReadOnly,
  clientX: number,
  clientY: number,
): { clientX: number; clientY: number; isOverIframe: boolean } {
  const iframeX = clientX - iframeRect.left;
  const iframeY = clientY - iframeRect.top;
  const isOverIframe =
    iframeX >= 0 &&
    iframeY >= 0 &&
    iframeX <= iframeRect.width &&
    iframeY <= iframeRect.height;

  return {
    clientX: isOverIframe ? iframeX : -1,
    clientY: isOverIframe ? iframeY : -1,
    isOverIframe,
  };
}

export function toIframePointerCoords(
  iframe: HTMLIFrameElement | null,
  clientX: number,
  clientY: number,
): { clientX: number; clientY: number } {
  if (!iframe) {
    return { clientX: -1, clientY: -1 };
  }

  const { clientX: iframeX, clientY: iframeY } = viewportToIframeCoords(
    iframe.getBoundingClientRect(),
    clientX,
    clientY,
  );

  return { clientX: iframeX, clientY: iframeY };
}
