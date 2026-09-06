import { describe, expect, it } from "vitest";
import {
  dropAreaToIframeCoords,
  viewportToIframeCoords,
} from "./palette-drag-coords";

function rect(
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRectReadOnly {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

describe("viewportToIframeCoords", () => {
  const iframeRect = rect(320, 180, 600, 640);

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

describe("dropAreaToIframeCoords", () => {
  const dropArea = rect(300, 120, 700, 800);
  const iframeRect = rect(350, 200, 600, 640);

  it("maps a pointer over the iframe to iframe-local coordinates", () => {
    expect(dropAreaToIframeCoords(dropArea, iframeRect, 450, 260)).toEqual({
      clientX: 100,
      clientY: 60,
      isOverDropArea: true,
    });
  });

  it("clamps to the iframe when the pointer is over the canvas stage padding", () => {
    expect(dropAreaToIframeCoords(dropArea, iframeRect, 310, 500)).toEqual({
      clientX: 0,
      clientY: 300,
      isOverDropArea: true,
    });
    expect(dropAreaToIframeCoords(dropArea, iframeRect, 450, 150)).toEqual({
      clientX: 100,
      clientY: 0,
      isOverDropArea: true,
    });
    expect(dropAreaToIframeCoords(dropArea, iframeRect, 450, 900)).toEqual({
      clientX: 100,
      clientY: 640,
      isOverDropArea: true,
    });
  });

  it("does not map a pointer outside the canvas stage into a drop", () => {
    expect(dropAreaToIframeCoords(dropArea, iframeRect, 80, 400)).toEqual({
      clientX: -1,
      clientY: -1,
      isOverDropArea: false,
    });
    expect(dropAreaToIframeCoords(dropArea, iframeRect, 1100, 400)).toEqual({
      clientX: -1,
      clientY: -1,
      isOverDropArea: false,
    });
    expect(dropAreaToIframeCoords(null, iframeRect, 450, 260)).toEqual({
      clientX: -1,
      clientY: -1,
      isOverDropArea: false,
    });
  });
});
