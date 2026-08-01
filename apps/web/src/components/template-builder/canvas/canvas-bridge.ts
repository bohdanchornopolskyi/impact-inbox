import {
  CANVAS_DRAG_ACTIVATION_PX,
  CANVAS_PLAIN_TEXT_EDITABLE_TYPES,
  CANVAS_RICHTEXT_EDITABLE_TYPES,
  RICHTEXT_HEADING_INLINE_STYLES,
  getCanvasDropTargetRuntimeScript,
} from "@repo/shared";
import { getCanvasBridgeStyles } from "./canvas-bridge-styles";
import { getCanvasBridgeBootRuntime } from "./runtime/bridge-runtime-boot";
import { getCanvasBridgeChromeRuntime } from "./runtime/bridge-runtime-chrome";
import { getCanvasBridgeDndRuntime } from "./runtime/bridge-runtime-dnd";
import { getCanvasBridgeEditingRuntime } from "./runtime/bridge-runtime-editing";
import { getCanvasBridgePreviewRuntime } from "./runtime/bridge-runtime-preview";

export type { CanvasBridgeInboundMessage } from "./canvas-bridge-protocol";
export {
  RICHTEXT_HEADING_TAGS,
  isBlockSelectMessage,
  isBlockEditStartMessage,
  isBlockEditCommitMessage,
  isBlockEditSyncMessage,
  isBlockEditCancelMessage,
  isRichtextFormatStateMessage,
  isPreviewNeedsReloadMessage,
  isCanvasDropTargetMessage,
  isCanvasPaletteDragCommitMessage,
} from "./canvas-bridge-protocol";
export type {
  BlockSelectMessage,
  BlockEditStartMessage,
  BlockEditCommitMessage,
  BlockEditSyncMessage,
  BlockEditCancelMessage,
  RichtextFormatStateData,
  RichtextFormatStateMessage,
  RichtextHeadingTag,
  SelectBlockMessage,
  UpdatePreviewMessage,
  PreviewNeedsReloadMessage,
  CanvasDropTargetMessage,
  CanvasPaletteDragCommitMessage,
} from "./canvas-bridge-protocol";

export type CanvasBridgeOptions = {
  canEdit: boolean;
};

function buildBridgeScript(canEdit: boolean): string {
  const plainTextEditableTypes = JSON.stringify([
    ...CANVAS_PLAIN_TEXT_EDITABLE_TYPES,
  ]);
  const richtextEditableTypes = JSON.stringify([
    ...CANVAS_RICHTEXT_EDITABLE_TYPES,
  ]);
  const richtextHeadingStyles = JSON.stringify(RICHTEXT_HEADING_INLINE_STYLES);
  const dragActivationPx = CANVAS_DRAG_ACTIVATION_PX;
  const dropTargetRuntime = getCanvasDropTargetRuntimeScript();

  return `(function () {
  ${dropTargetRuntime}
  var canEdit = ${JSON.stringify(canEdit)};
  var dragActivationPx = ${dragActivationPx};
  var plainTextEditableTypes = ${plainTextEditableTypes};
  var richtextEditableTypes = ${richtextEditableTypes};
  var richtextHeadingStyles = ${richtextHeadingStyles};
  var layer = null;
  var hoverFrame = null;
  var selectionFrame = null;
  var toolbar = null;
  var toolbarLabel = null;
  var toolbarActions = null;
  var dropIndicator = null;
  var selectedBlockId = null;
  var hoveredBlock = null;
  var resizeObserver = null;
  var editingElement = null;
  var editingBlockId = null;
  var editingKind = null;
  var editingSnapshotHtml = null;
  var savedRange = null;
  var syncTimer = null;
  var activeDropTarget = null;
  var isDragSession = false;
  var dragBlockId = null;
  var dragKind = null;
  var dragPointer = null;
  var suppressBlockClick = false;
  var dragHandleSvg =
    '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><circle cx="4" cy="3" r="1.2" fill="currentColor"/><circle cx="10" cy="3" r="1.2" fill="currentColor"/><circle cx="4" cy="7" r="1.2" fill="currentColor"/><circle cx="10" cy="7" r="1.2" fill="currentColor"/><circle cx="4" cy="11" r="1.2" fill="currentColor"/><circle cx="10" cy="11" r="1.2" fill="currentColor"/></svg>';
  var duplicateSvg =
    '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><rect x="1.4" y="1.4" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="4.6" y="4.6" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
  var deleteSvg =
    '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2.5 4h9M5.5 4V2.6h3V4M3.9 4l.6 8.1a1 1 0 0 0 1 .9h3a1 1 0 0 0 1-.9L10.1 4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

  ${getCanvasBridgeEditingRuntime()}
  ${getCanvasBridgeDndRuntime()}
  ${getCanvasBridgeChromeRuntime()}
  ${getCanvasBridgePreviewRuntime()}
  ${getCanvasBridgeBootRuntime()}
})();`;
}

export function buildCanvasBridgeDocument(
  html: string,
  options: CanvasBridgeOptions,
): string {
  const injection = `${getCanvasBridgeStyles(options.canEdit)}<script id="canvas-bridge-script">${buildBridgeScript(options.canEdit)}</script>`;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${injection}</body>`);
  }

  return `${html}${injection}`;
}
