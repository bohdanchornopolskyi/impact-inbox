import { describe, expect, it } from "vitest";
import { viewportToIframeCoords } from "./palette-drag-coords";

describe("viewportToIframeCoords", () => {
  const iframeRect = {
    left: 320,
    top: 180,
    width: 600,
    height: 640,
    right: 920,
    bottom: 820,
    x: 320,
    y: 180,
    toJSON: () => ({}),
  };

  it("converts viewport coordinates to iframe-local coordinates", () => {
    const result = viewportToIframeCoords(iframeRect, 450, 260);

    expect(result.isOverIframe).toBe(true);
    expect(result.clientX).toBe(130);
    expect(result.clientY).toBe(80);
  });

  it("returns sentinel coordinates when pointer is outside iframe", () => {
    const result = viewportToIframeCoords(iframeRect, 100, 260);

    expect(result.isOverIframe).toBe(false);
    expect(result.clientX).toBe(-1);
    expect(result.clientY).toBe(-1);
  });
});
