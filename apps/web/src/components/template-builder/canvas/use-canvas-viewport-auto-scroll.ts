"use client";

import { useEffect, useRef, type RefObject } from "react";
import { stepCanvasViewportAutoScroll } from "./canvas-viewport-auto-scroll";

type UseCanvasViewportAutoScrollOptions = {
  scrollContainerRef: RefObject<HTMLElement | null>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isActive: boolean;
};

export function useCanvasViewportAutoScroll({
  scrollContainerRef,
  iframeRef,
  isActive,
}: UseCanvasViewportAutoScrollOptions): void {
  const viewportClientYRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      viewportClientYRef.current = null;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      return;
    }

    function tick() {
      const container = scrollContainerRef.current;
      const clientY = viewportClientYRef.current;
      if (container && clientY !== null) {
        stepCanvasViewportAutoScroll(container, clientY);
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);

    function onDocumentPointerMove(event: PointerEvent) {
      viewportClientYRef.current = event.clientY;
    }

    function onMessage(event: MessageEvent) {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow || event.source !== iframeWindow) {
        return;
      }

      const data = event.data;
      if (
        !data ||
        typeof data !== "object" ||
        (data as { type?: string }).type !== "canvas-drag-pointer"
      ) {
        return;
      }

      const message = data as { clientY?: number };
      if (typeof message.clientY !== "number") {
        return;
      }

      const iframe = iframeRef.current;
      if (!iframe) {
        return;
      }

      viewportClientYRef.current =
        iframe.getBoundingClientRect().top + message.clientY;
    }

    document.addEventListener("pointermove", onDocumentPointerMove);
    window.addEventListener("message", onMessage);

    return () => {
      document.removeEventListener("pointermove", onDocumentPointerMove);
      window.removeEventListener("message", onMessage);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [iframeRef, isActive, scrollContainerRef]);
}
