import { describe, expect, it } from "vitest";
import { getCanvasBridgeDropTargetRuntime } from "./canvas-bridge-runtime";

describe("getCanvasBridgeDropTargetRuntime", () => {
  it("produces self-contained JavaScript without module references", () => {
    const runtime = getCanvasBridgeDropTargetRuntime();

    expect(runtime).not.toMatch(/require\(/);
    expect(runtime).not.toMatch(/canvas_contract/);
    expect(() => {
      new Function(runtime);
    }).not.toThrow();
  });

  it("injects shared drop-target helpers into the bridge script", () => {
    const runtime = getCanvasBridgeDropTargetRuntime();

    expect(runtime).toContain("function resolveInsertionIndex");
    expect(runtime).toContain("function filterDraggedSiblingIds");
    expect(runtime).toContain("function resolveInsertionIndexExcludingSibling");
    expect(runtime).toContain("function isDragKindValidForTargetKind");
  });

  it("produces parseable JavaScript", () => {
    expect(() => {
      new Function(getCanvasBridgeDropTargetRuntime());
    }).not.toThrow();
  });
});
