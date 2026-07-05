"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  CANVAS_DRAG_ACTIVATION_PX,
  TEMPLATE_BLOCK_DEFINITIONS,
  type CanvasDropTarget,
  type ContentBlockType,
  type TemplateBlockType,
  type TemplateContentData,
} from "@repo/shared";
import { TemplateBlockIcon } from "../block-icons";
import { useBuilder } from "../builder-provider";
import { isCanvasPaletteDragCommitMessage } from "./canvas-bridge";
import {
  blockTypeToDragKind,
  isCanvasDragActiveMessage,
} from "./canvas-dnd";
import {
  createCanvasDragSessionState,
  handleCanvasDragMessage,
  resetDragSession,
  setDropTarget,
  type PaletteDragSession,
} from "./canvas-drag-session";
import { toIframePointerCoords } from "./palette-drag-coords";

type DocPointerListeners = {
  onPointerMove: (event: globalThis.PointerEvent) => void;
  onPointerFinish: (event: globalThis.PointerEvent) => void;
};

type PaletteDragGhostState = {
  blockType: TemplateBlockType;
  x: number;
  y: number;
};

type DragBridge = {
  postToIframe: (message: object) => void;
  getCanvasIframe: () => HTMLIFrameElement | null;
  getContent: () => TemplateContentData;
  prepareDrag: () => void;
  onDropCommitted: () => void;
};

type PaletteCanvasDndContextValue = {
  bindPaletteTile: (
    blockType: TemplateBlockType,
    onClick: () => void,
  ) => {
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  };
  registerDragBridge: (bridge: DragBridge | null) => void;
  handleIframeMessage: (data: unknown) => boolean;
  handleDropTargetChange: (target: CanvasDropTarget | null) => void;
  cancelAllDrags: () => void;
  isPaletteDragging: boolean;
  isCanvasDragging: boolean;
};

function PaletteDragGhost({ ghost }: { ghost: PaletteDragGhostState }) {
  const definition = TEMPLATE_BLOCK_DEFINITIONS[ghost.blockType];

  return (
    <div
      className="pointer-events-none fixed z-[10000] flex w-[88px] flex-col items-center justify-center gap-1.5 rounded-lg border border-accent-border bg-surface-card px-2 py-2.5 text-center shadow-card"
      style={{
        left: ghost.x,
        top: ghost.y,
        transform: "translate(-50%, -50%)",
      }}>
      <span className="text-text-secondary">
        <TemplateBlockIcon type={ghost.blockType} />
      </span>
      <span className="text-ui-xs font-medium text-text-primary">
        {definition.label}
      </span>
    </div>
  );
}

const PaletteCanvasDndContext = createContext<PaletteCanvasDndContextValue | null>(
  null,
);

export function PaletteCanvasDndProvider({ children }: { children: ReactNode }) {
  const canEdit = useBuilder((s) => s.canEdit);
  const addBlock = useBuilder((s) => s.addBlock);
  const addSection = useBuilder((s) => s.addSection);
  const addRow = useBuilder((s) => s.addRow);
  const addColumn = useBuilder((s) => s.addColumn);
  const moveBlock = useBuilder((s) => s.moveBlock);
  const moveSection = useBuilder((s) => s.moveSection);
  const moveRow = useBuilder((s) => s.moveRow);
  const moveColumn = useBuilder((s) => s.moveColumn);
  const selectBlock = useBuilder((s) => s.selectBlock);

  const [isPaletteDragging, setIsPaletteDragging] = useState(false);
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [dragGhost, setDragGhost] = useState<PaletteDragGhostState | null>(null);
  const sessionRef = useRef(createCanvasDragSessionState());
  const suppressClickRef = useRef(false);
  const docListenersRef = useRef<DocPointerListeners | null>(null);
  const bridgeRef = useRef<DragBridge | null>(null);

  const registerDragBridge = useCallback((bridge: DragBridge | null) => {
    bridgeRef.current = bridge;
  }, []);

  const detachDocPointerListeners = useCallback(() => {
    const listeners = docListenersRef.current;
    if (!listeners) {
      return;
    }

    document.removeEventListener("pointermove", listeners.onPointerMove);
    document.removeEventListener("pointerup", listeners.onPointerFinish, true);
    document.removeEventListener("pointercancel", listeners.onPointerFinish, true);
    docListenersRef.current = null;
  }, []);

  const finishPaletteDragUi = useCallback(() => {
    detachDocPointerListeners();

    const session = sessionRef.current.paletteSession;
    if (session && document.body.hasPointerCapture(session.pointerId)) {
      document.body.releasePointerCapture(session.pointerId);
    }

    setDragGhost(null);
    setIsPaletteDragging(false);
  }, [detachDocPointerListeners]);

  const endPaletteDrag = useCallback(() => {
    finishPaletteDragUi();
    resetDragSession(sessionRef.current);
    bridgeRef.current?.postToIframe({ type: "canvas-palette-drag-end" });
  }, [finishPaletteDragUi]);

  const abortPaletteDragAwaitingCommit = useCallback(() => {
    sessionRef.current.paletteFinishHandled = true;
    finishPaletteDragUi();
    sessionRef.current.paletteSession = null;
    sessionRef.current.dropTarget = null;
    bridgeRef.current?.postToIframe({ type: "canvas-palette-drag-end" });
  }, [finishPaletteDragUi]);

  const updateDragGhost = useCallback(
    (blockType: TemplateBlockType, clientX: number, clientY: number) => {
      setDragGhost({ blockType, x: clientX, y: clientY });
    },
    [],
  );

  const postPaletteDragPointer = useCallback((clientX: number, clientY: number) => {
    const bridge = bridgeRef.current;
    if (!bridge) {
      return;
    }

    const coords = toIframePointerCoords(bridge.getCanvasIframe(), clientX, clientY);
    bridge.postToIframe({
      type: "canvas-palette-drag-move",
      clientX: coords.clientX,
      clientY: coords.clientY,
    });
  }, []);

  const activatePaletteDrag = useCallback(
    (session: PaletteDragSession, clientX: number, clientY: number) => {
      const bridge = bridgeRef.current;
      if (!bridge) {
        return;
      }

      bridge.prepareDrag();
      document.body.setPointerCapture(session.pointerId);

      const coords = toIframePointerCoords(bridge.getCanvasIframe(), clientX, clientY);
      bridge.postToIframe({
        type: "canvas-palette-drag-start",
        dragKind: session.dragKind,
        clientX: coords.clientX,
        clientY: coords.clientY,
      });
      updateDragGhost(session.blockType, clientX, clientY);
      postPaletteDragPointer(clientX, clientY);
      setIsPaletteDragging(true);
      suppressClickRef.current = true;
    },
    [postPaletteDragPointer, updateDragGhost],
  );

  const cancelAllDrags = useCallback(() => {
    if (sessionRef.current.paletteSession?.active) {
      sessionRef.current.paletteFinishHandled = true;
    }
    endPaletteDrag();
    setIsCanvasDragging(false);
    resetDragSession(sessionRef.current);
    bridgeRef.current?.postToIframe({ type: "canvas-cancel-drag" });
  }, [endPaletteDrag]);

  const handleDropTargetChange = useCallback((target: CanvasDropTarget | null) => {
    setDropTarget(sessionRef.current, target);
  }, []);

  const handleIframeMessage = useCallback(
    (data: unknown): boolean => {
      const bridge = bridgeRef.current;
      if (!bridge) {
        return false;
      }

      if (isCanvasDragActiveMessage(data) && canEdit) {
        bridge.prepareDrag();
      }

      if (isCanvasPaletteDragCommitMessage(data)) {
        finishPaletteDragUi();
      }

      const result = handleCanvasDragMessage({
        state: sessionRef.current,
        data,
        canEdit,
        content: bridge.getContent(),
        moveActions: {
          moveBlock,
          moveSection,
          moveRow,
          moveColumn,
          selectBlock,
        },
        paletteActions: {
          addSection,
          addRow,
          addColumn,
          addBlock: (columnId, blockType, index) =>
            addBlock(columnId, blockType as ContentBlockType, index),
        },
      });

      if (result.canvasDragStarted) {
        setIsCanvasDragging(true);
      }
      if (result.canvasDragEnded) {
        setIsCanvasDragging(false);
      }
      if (result.dropCommitted) {
        bridge.onDropCommitted();
      }

      return result.handled;
    },
    [
      addBlock,
      addColumn,
      addRow,
      addSection,
      canEdit,
      finishPaletteDragUi,
      moveBlock,
      moveColumn,
      moveRow,
      moveSection,
      selectBlock,
    ],
  );

  const bindPaletteTile = useCallback(
    (blockType: TemplateBlockType, onClick: () => void) => {
      function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
        if (!canEdit || event.button !== 0) {
          return;
        }

        event.preventDefault();

        detachDocPointerListeners();
        sessionRef.current.paletteFinishHandled = false;
        sessionRef.current.dropTarget = null;

        const session: PaletteDragSession = {
          blockType,
          dragKind: blockTypeToDragKind(blockType),
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          active: false,
        };
        sessionRef.current.paletteSession = session;

        function onPointerMove(moveEvent: globalThis.PointerEvent) {
          const current = sessionRef.current.paletteSession;
          if (!current || moveEvent.pointerId !== current.pointerId) {
            return;
          }

          if (!current.active) {
            const dx = moveEvent.clientX - current.startX;
            const dy = moveEvent.clientY - current.startY;
            if (Math.hypot(dx, dy) < CANVAS_DRAG_ACTIVATION_PX) {
              return;
            }

            current.active = true;
            activatePaletteDrag(current, moveEvent.clientX, moveEvent.clientY);
            return;
          }

          updateDragGhost(current.blockType, moveEvent.clientX, moveEvent.clientY);
          postPaletteDragPointer(moveEvent.clientX, moveEvent.clientY);
        }

        function onPointerFinish(finishEvent: globalThis.PointerEvent) {
          const current = sessionRef.current.paletteSession;
          if (!current || finishEvent.pointerId !== current.pointerId) {
            return;
          }

          if (sessionRef.current.paletteFinishHandled) {
            detachDocPointerListeners();
            return;
          }

          if (!current.active) {
            endPaletteDrag();
            return;
          }

          detachDocPointerListeners();
          postPaletteDragPointer(finishEvent.clientX, finishEvent.clientY);
          const bridge = bridgeRef.current;
          if (!bridge) {
            endPaletteDrag();
            return;
          }

          const coords = toIframePointerCoords(
            bridge.getCanvasIframe(),
            finishEvent.clientX,
            finishEvent.clientY,
          );
          bridge.postToIframe({
            type: "canvas-palette-drag-finish",
            clientX: coords.clientX,
            clientY: coords.clientY,
          });

          window.setTimeout(() => {
            if (
              sessionRef.current.paletteFinishHandled ||
              !sessionRef.current.paletteSession?.active
            ) {
              return;
            }

            abortPaletteDragAwaitingCommit();
          }, 200);
        }

        docListenersRef.current = {
          onPointerMove,
          onPointerFinish,
        };

        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerFinish, true);
        document.addEventListener("pointercancel", onPointerFinish, true);
      }

      function onTileClick(event: MouseEvent<HTMLButtonElement>) {
        if (suppressClickRef.current) {
          event.preventDefault();
          suppressClickRef.current = false;
          return;
        }

        onClick();
      }

      return { onPointerDown, onClick: onTileClick };
    },
    [
      activatePaletteDrag,
      canEdit,
      detachDocPointerListeners,
      endPaletteDrag,
      postPaletteDragPointer,
      abortPaletteDragAwaitingCommit,
      updateDragGhost,
    ],
  );

  const value: PaletteCanvasDndContextValue = {
    bindPaletteTile,
    registerDragBridge,
    handleIframeMessage,
    handleDropTargetChange,
    cancelAllDrags,
    isPaletteDragging,
    isCanvasDragging,
  };

  return (
    <PaletteCanvasDndContext.Provider value={value}>
      {children}
      {isPaletteDragging ? (
        <div
          className="fixed inset-0 z-[9999] cursor-grabbing"
          aria-hidden
        />
      ) : null}
      {dragGhost ? <PaletteDragGhost ghost={dragGhost} /> : null}
    </PaletteCanvasDndContext.Provider>
  );
}

export function usePaletteCanvasDnd(): PaletteCanvasDndContextValue {
  const context = useContext(PaletteCanvasDndContext);
  if (!context) {
    throw new Error("usePaletteCanvasDnd must be used within PaletteCanvasDndProvider");
  }
  return context;
}
