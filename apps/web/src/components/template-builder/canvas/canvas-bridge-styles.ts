export function getCanvasBridgeStyles(canEdit: boolean): string {
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
}
.canvas-bridge-hover {
  border: 1px dashed rgba(79, 70, 229, 0.55);
}
.canvas-bridge-selected {
  border: 2px solid #4f46e5;
}
.canvas-bridge-dragging {
  opacity: 0.45;
}
.canvas-bridge-toolbar {
  position: absolute;
  display: none;
  align-items: center;
  gap: 2px;
  height: 32px;
  padding: 0 4px 0 0;
  background: rgba(55, 65, 81, 0.95);
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  white-space: nowrap;
  pointer-events: auto;
}
.canvas-bridge-label {
  padding: 0 8px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  user-select: none;
}
.canvas-bridge-toolbar-below {
  border-radius: 16px;
}
.canvas-bridge-toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: inherit;
  border-radius: 50%;
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
  height: 2px;
  background: #4f46e5;
  border-radius: 1px;
  pointer-events: none;
  z-index: 2147483647;
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
