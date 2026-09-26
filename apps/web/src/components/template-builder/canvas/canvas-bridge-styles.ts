import { themeColor } from "@repo/shared";

export function getCanvasBridgeStyles(canEdit: boolean): string {
  const brand300 = themeColor("--color-brand-300");
  const brand400 = themeColor("--color-brand-400");
  const brand500 = themeColor("--color-brand-500");
  const neutral900 = themeColor("--color-neutral-900");
  const neutral0 = themeColor("--color-neutral-0");
  return `<style id="canvas-bridge-styles">
[data-block-id] { cursor: pointer; }
[data-block-id][data-layout-role] { cursor: grab; }
[data-block-id].canvas-bridge-dragging { cursor: grabbing; }
[data-block-id] a[data-canvas-link-disabled] { cursor: inherit; text-decoration: inherit; color: inherit; }
${canEdit ? "[data-editable] { cursor: text; }\n[data-editable][contenteditable=\"true\"] { outline: none; box-shadow: none; }\n" : ""}html, body {
  overflow-x: hidden !important;
  overflow-y: visible !important;
  max-width: 100%;
}
#canvas-bridge-layer {
  position: absolute;
  inset: 0;
  overflow: visible;
  z-index: 2147483646;
  pointer-events: none;
}
.canvas-bridge-frame {
  position: absolute;
  display: none;
  box-sizing: border-box;
  pointer-events: none;
  border-radius: 5px;
}
.canvas-bridge-hover {
  border: 1px solid ${brand300};
}
.canvas-bridge-selected {
  border: 2px solid ${brand500};
}
.canvas-bridge-dragging {
  opacity: 0.45;
}
.canvas-bridge-type-tag {
  position: absolute;
  left: 0;
  bottom: 100%;
  display: block;
  padding: 3px 7px;
  border-radius: 4px 4px 0 0;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  pointer-events: none;
  white-space: nowrap;
}
.canvas-bridge-type-tag-hover {
  background: ${brand400};
}
.canvas-bridge-type-tag-selected {
  background: ${brand500};
}
.canvas-bridge-toolbar {
  position: absolute;
  display: none;
  align-items: center;
  gap: 2px;
  height: 32px;
  padding: 0 5px;
  background: ${neutral900};
  color: ${neutral0};
  font-family: system-ui, -apple-system, sans-serif;
  border-radius: 10px;
  box-shadow: 0 4px 12px #0f172a33;
  white-space: nowrap;
  pointer-events: auto;
}
.canvas-bridge-label {
  display: none;
}
.canvas-bridge-toolbar-below {
  border-radius: 10px;
}
.canvas-bridge-toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #ffffffcc;
  border-radius: 5px;
  padding: 0;
  cursor: pointer;
}
.canvas-bridge-toolbar-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}
.canvas-bridge-toolbar-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.canvas-bridge-toolbar-btn-danger {
  color: #fca5a5;
}
.canvas-bridge-drag-handle {
  cursor: grab;
}
.canvas-bridge-drag-handle:active:not(:disabled) {
  cursor: grabbing;
}
.canvas-bridge-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.canvas-bridge-drop-indicator {
  position: absolute;
  display: none;
  align-items: center;
  height: 14px;
  pointer-events: none;
  z-index: 2147483647;
}
.canvas-bridge-drop-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${brand500};
  flex-shrink: 0;
}
.canvas-bridge-drop-line {
  flex: 1;
  height: 2px;
  background: ${brand500};
  border-radius: 999px;
}
.canvas-bridge-drop-indicator-vertical {
  flex-direction: column;
  width: 14px;
  height: auto;
}
.canvas-bridge-drop-indicator-vertical .canvas-bridge-drop-line {
  width: 2px;
  height: auto;
  flex: 1;
}
html.palette-drag-active,
html.palette-drag-active body {
  cursor: grabbing !important;
}
[data-empty-column] [data-canvas-empty-placeholder] {
  display: block;
  min-height: 48px;
  box-sizing: border-box;
  border: 1px dashed rgba(79, 70, 229, 0.35);
  border-radius: 4px;
  background: rgba(79, 70, 229, 0.04);
}
[data-empty-section] [data-canvas-empty-placeholder],
[data-empty-row] [data-canvas-empty-placeholder] {
  display: block;
  min-height: 40px;
  box-sizing: border-box;
  border: 1px dashed rgba(79, 70, 229, 0.35);
  border-radius: 4px;
  background: rgba(79, 70, 229, 0.04);
}
</style>`;
}
