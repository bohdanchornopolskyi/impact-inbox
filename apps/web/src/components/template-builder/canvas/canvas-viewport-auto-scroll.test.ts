import { describe, expect, it, vi } from "vitest";
import { stepCanvasViewportAutoScroll } from "./canvas-viewport-auto-scroll";

describe("stepCanvasViewportAutoScroll", () => {
  it("scrolls down when pointer is near the bottom edge", () => {
    const scrollContainer = {
      scrollTop: 100,
      getBoundingClientRect: () => ({
        top: 200,
        bottom: 800,
        left: 0,
        right: 600,
        width: 600,
        height: 600,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      }),
    } as unknown as HTMLElement;

    stepCanvasViewportAutoScroll(scrollContainer, 760);

    expect(scrollContainer.scrollTop).toBeGreaterThan(100);
  });

  it("scrolls up when pointer is near the top edge", () => {
    const scrollContainer = {
      scrollTop: 100,
      getBoundingClientRect: vi.fn(() => ({
        top: 200,
        bottom: 800,
        left: 0,
        right: 600,
        width: 600,
        height: 600,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      })),
    } as unknown as HTMLElement;

    stepCanvasViewportAutoScroll(scrollContainer, 210);

    expect(scrollContainer.scrollTop).toBeLessThan(100);
  });

  it("does not scroll when pointer is in the middle", () => {
    const scrollContainer = {
      scrollTop: 100,
      getBoundingClientRect: () => ({
        top: 200,
        bottom: 800,
        left: 0,
        right: 600,
        width: 600,
        height: 600,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      }),
    } as unknown as HTMLElement;

    stepCanvasViewportAutoScroll(scrollContainer, 500);

    expect(scrollContainer.scrollTop).toBe(100);
  });
});
