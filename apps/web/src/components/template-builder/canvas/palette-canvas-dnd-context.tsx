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
} from "@repo/shared";
import { TemplateBlockIcon } from "../block-icons";
import { useBuilder } from "../builder-provider";
import {
  applyPaletteInsert,
  blockTypeToDragKind,
  canInsertBlockTypeAtTarget,
  type CanvasDragKind,
} from "./canvas-dnd";
import { toIframePointerCoords } from "./palette-drag-coords";

type PaletteDragSession = {
  blockType: TemplateBlockType;
  dragKind: CanvasDragKind;
  pointerId: number;
  startX: number;
  startY: number;
  active: boolean;
};

type DocPointerListeners = {
  onPointerMove: (event: globalThis.PointerEvent) => void;
  onPointerFinish: (event: globalThis.PointerEvent) => void;
};

type PaletteDragGhostState = {
  blockType: TemplateBlockType;
  x: number;
  y: number;
};

type PaletteCanvasDndContextValue = {
  bindPaletteTile: (
    blockType: TemplateBlockType,
    onClick: () => void,
  ) => {
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  };
  registerIframeBridge: (post: (message: object) => void) => void;
  registerCanvasIframe: (iframe: HTMLIFrameElement | null) => void;
  registerPrepareDrag: (prepare: () => void) => void;
  registerDropCommitted: (commit: () => void) => void;
  handleDropTargetChange: (target: CanvasDropTarget | null) => void;
  handlePaletteDragCommit: (target: CanvasDropTarget | null) => void;
  cancelPaletteDrag: () => void;
  isPaletteDragging: boolean;
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

  const [isPaletteDragging, setIsPaletteDragging] = useState(false);
  const [dragGhost, setDragGhost] = useState<PaletteDragGhostState | null>(null);
  const sessionRef = useRef<PaletteDragSession | null>(null);
  const dropTargetRef = useRef<CanvasDropTarget | null>(null);
  const suppressClickRef = useRef(false);
  const finishHandledRef = useRef(false);
  const docListenersRef = useRef<DocPointerListeners | null>(null);
  const postToIframeRef = useRef<(message: object) => void>(() => {});
  const canvasIframeRef = useRef<HTMLIFrameElement | null>(null);
  const prepareDragRef = useRef<() => void>(() => {});
  const dropCommittedRef = useRef<() => void>(() => {});

  const registerIframeBridge = useCallback((post: (message: object) => void) => {
    postToIframeRef.current = post;
  }, []);

  const registerCanvasIframe = useCallback((iframe: HTMLIFrameElement | null) => {
    canvasIframeRef.current = iframe;
  }, []);

  const registerPrepareDrag = useCallback((prepare: () => void) => {
    prepareDragRef.current = prepare;
  }, []);

  const registerDropCommitted = useCallback((commit: () => void) => {
    dropCommittedRef.current = commit;
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

  const endPaletteDrag = useCallback(() => {
    detachDocPointerListeners();

    const session = sessionRef.current;
    if (session && document.body.hasPointerCapture(session.pointerId)) {
      document.body.releasePointerCapture(session.pointerId);
    }

    sessionRef.current = null;
    dropTargetRef.current = null;
    finishHandledRef.current = false;
    setDragGhost(null);
    setIsPaletteDragging(false);
    postToIframeRef.current({ type: "canvas-palette-drag-end" });
  }, [detachDocPointerListeners]);

  const updateDragGhost = useCallback(
    (blockType: TemplateBlockType, clientX: number, clientY: number) => {
      setDragGhost({ blockType, x: clientX, y: clientY });
    },
    [],
  );

  const postPaletteDragPointer = useCallback((clientX: number, clientY: number) => {
    const coords = toIframePointerCoords(canvasIframeRef.current, clientX, clientY);
    postToIframeRef.current({
      type: "canvas-palette-drag-move",
      clientX: coords.clientX,
      clientY: coords.clientY,
    });
  }, []);

  const activatePaletteDrag = useCallback(
    (session: PaletteDragSession, clientX: number, clientY: number) => {
      prepareDragRef.current();
      document.body.setPointerCapture(session.pointerId);

      const coords = toIframePointerCoords(canvasIframeRef.current, clientX, clientY);
      postToIframeRef.current({
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

  const commitPaletteDrop = useCallback(
    (targetOverride?: CanvasDropTarget | null) => {
      if (finishHandledRef.current) {
        return;
      }
      finishHandledRef.current = true;

      const session = sessionRef.current;
      const target =
        targetOverride !== undefined ? targetOverride : dropTargetRef.current;

      if (
        session?.active &&
        target &&
        canInsertBlockTypeAtTarget(session.blockType, target)
      ) {
        applyPaletteInsert(session.blockType, target, {
          addSection,
          addRow,
          addColumn,
          addBlock: (columnId, blockType, index) =>
            addBlock(columnId, blockType as ContentBlockType, index),
        });
        dropCommittedRef.current();
      }

      endPaletteDrag();
    },
    [addBlock, addColumn, addRow, addSection, endPaletteDrag],
  );

  const handleDropTargetChange = useCallback((target: CanvasDropTarget | null) => {
    if (!sessionRef.current?.active) {
      return;
    }
    dropTargetRef.current = target;
  }, []);

  const handlePaletteDragCommit = useCallback(
    (target: CanvasDropTarget | null) => {
      commitPaletteDrop(target);
    },
    [commitPaletteDrop],
  );

  const cancelPaletteDrag = useCallback(() => {
    if (sessionRef.current?.active) {
      finishHandledRef.current = true;
    }
    endPaletteDrag();
  }, [endPaletteDrag]);

  const bindPaletteTile = useCallback(
    (blockType: TemplateBlockType, onClick: () => void) => {
      function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
        if (!canEdit || event.button !== 0) {
          return;
        }

        event.preventDefault();

        detachDocPointerListeners();
        finishHandledRef.current = false;
        dropTargetRef.current = null;

        const session: PaletteDragSession = {
          blockType,
          dragKind: blockTypeToDragKind(blockType),
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          active: false,
        };
        sessionRef.current = session;

        function onPointerMove(moveEvent: globalThis.PointerEvent) {
          const current = sessionRef.current;
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
            activatePaletteDrag(
              current,
              moveEvent.clientX,
              moveEvent.clientY,
            );
            return;
          }

          updateDragGhost(
            current.blockType,
            moveEvent.clientX,
            moveEvent.clientY,
          );
          postPaletteDragPointer(moveEvent.clientX, moveEvent.clientY);
        }

        function onPointerFinish(finishEvent: globalThis.PointerEvent) {
          const current = sessionRef.current;
          if (!current || finishEvent.pointerId !== current.pointerId) {
            return;
          }

          if (finishHandledRef.current) {
            detachDocPointerListeners();
            return;
          }

          if (!current.active) {
            endPaletteDrag();
            return;
          }

          detachDocPointerListeners();
          postPaletteDragPointer(finishEvent.clientX, finishEvent.clientY);
          const coords = toIframePointerCoords(
            canvasIframeRef.current,
            finishEvent.clientX,
            finishEvent.clientY,
          );
          postToIframeRef.current({
            type: "canvas-palette-drag-finish",
            clientX: coords.clientX,
            clientY: coords.clientY,
          });

          window.setTimeout(() => {
            if (!finishHandledRef.current) {
              commitPaletteDrop(dropTargetRef.current);
            }
          }, 50);
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
      commitPaletteDrop,
      detachDocPointerListeners,
      endPaletteDrag,
      postPaletteDragPointer,
      updateDragGhost,
    ],
  );

  const value: PaletteCanvasDndContextValue = {
    bindPaletteTile,
    registerIframeBridge,
    registerCanvasIframe,
    registerPrepareDrag,
    registerDropCommitted,
    handleDropTargetChange,
    handlePaletteDragCommit,
    cancelPaletteDrag,
    isPaletteDragging,
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
