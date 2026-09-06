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
import { useBuilderStore } from "../builder-provider";
import {
  isCanvasDragActiveMessage,
  isCanvasPaletteDragCommitMessage,
  type CanvasBridgeOutboundMessage,
} from "./canvas-bridge-protocol";
import { blockTypeToDragKind } from "./canvas-dnd";
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
  postToIframe: (message: CanvasBridgeOutboundMessage) => void;
  getCanvasIframe: () => HTMLIFrameElement | null;
  getDropArea: () => HTMLElement | null;
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
      className="pointer-events-none fixed z-[10000] flex h-[38px] items-center gap-2 rounded-sm border border-accent bg-surface px-2.5 text-xs font-medium text-text opacity-90 shadow-[0_8px_16px_#0f172a29]"
      style={{
        left: ghost.x,
        top: ghost.y,
        transform: "translate(-50%, -50%) rotate(-2deg)",
      }}
    >
      <span className="inline-flex size-[15px] shrink-0 text-text-2 [&_svg]:size-full">
        <TemplateBlockIcon type={ghost.blockType} />
      </span>
      <span>{definition.label}</span>
    </div>
  );
}

type PaletteCanvasDndApi = Omit<
  PaletteCanvasDndContextValue,
  "isPaletteDragging" | "isCanvasDragging"
>;

const PaletteCanvasDndApiContext = createContext<PaletteCanvasDndApi | null>(
  null,
);
const PaletteCanvasDndDragContext = createContext<{
  isPaletteDragging: boolean;
  isCanvasDragging: boolean;
}>({ isPaletteDragging: false, isCanvasDragging: false });

function usePaletteCanvasDndController() {
  const store = useBuilderStore();
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

    const coords = toIframePointerCoords(
      bridge.getDropArea(),
      bridge.getCanvasIframe(),
      clientX,
      clientY,
    );
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

      const coords = toIframePointerCoords(
        bridge.getDropArea(),
        bridge.getCanvasIframe(),
        clientX,
        clientY,
      );
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

      const state = store.getState();

      if (isCanvasDragActiveMessage(data) && state.canEdit) {
        bridge.prepareDrag();
      }

      if (isCanvasPaletteDragCommitMessage(data)) {
        finishPaletteDragUi();
      }

      const result = handleCanvasDragMessage({
        state: sessionRef.current,
        data,
        canEdit: state.canEdit,
        content: bridge.getContent(),
        moveActions: {
          moveBlock: state.moveBlock,
          moveSection: state.moveSection,
          moveRow: state.moveRow,
          moveColumn: state.moveColumn,
          selectBlock: state.selectBlock,
        },
        paletteActions: {
          addSection: state.addSection,
          addRow: state.addRow,
          addColumn: state.addColumn,
          addBlock: (columnId, blockType, index) =>
            state.addBlock(columnId, blockType as ContentBlockType, index),
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
    [finishPaletteDragUi, store],
  );

  const bindPaletteTile = useCallback(
    (blockType: TemplateBlockType, onClick: () => void) => {
      function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
        if (!store.getState().canEdit || event.button !== 0) {
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
            bridge.getDropArea(),
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
      detachDocPointerListeners,
      endPaletteDrag,
      postPaletteDragPointer,
      abortPaletteDragAwaitingCommit,
      store,
      updateDragGhost,
    ],
  );

  const bindPaletteTileRef = useRef(bindPaletteTile);
  bindPaletteTileRef.current = bindPaletteTile;
  const registerDragBridgeRef = useRef(registerDragBridge);
  registerDragBridgeRef.current = registerDragBridge;
  const handleIframeMessageRef = useRef(handleIframeMessage);
  handleIframeMessageRef.current = handleIframeMessage;
  const handleDropTargetChangeRef = useRef(handleDropTargetChange);
  handleDropTargetChangeRef.current = handleDropTargetChange;
  const cancelAllDragsRef = useRef(cancelAllDrags);
  cancelAllDragsRef.current = cancelAllDrags;

  const apiRef = useRef<PaletteCanvasDndApi | null>(null);
  if (!apiRef.current) {
    apiRef.current = {
      bindPaletteTile: (blockType, onClick) =>
        bindPaletteTileRef.current(blockType, onClick),
      registerDragBridge: (bridge) => registerDragBridgeRef.current(bridge),
      handleIframeMessage: (data) => handleIframeMessageRef.current(data),
      handleDropTargetChange: (target) =>
        handleDropTargetChangeRef.current(target),
      cancelAllDrags: () => cancelAllDragsRef.current(),
    };
  }

  return {
    api: apiRef.current,
    dragGhost,
    isPaletteDragging,
    isCanvasDragging,
  };
}

export function PaletteCanvasDndProvider({ children }: { children: ReactNode }) {
  const { api, dragGhost, isPaletteDragging, isCanvasDragging } =
    usePaletteCanvasDndController();
  const dragRef = useRef({ isPaletteDragging, isCanvasDragging });
  if (
    dragRef.current.isPaletteDragging !== isPaletteDragging ||
    dragRef.current.isCanvasDragging !== isCanvasDragging
  ) {
    dragRef.current = { isPaletteDragging, isCanvasDragging };
  }

  return (
    <PaletteCanvasDndApiContext.Provider value={api}>
      <PaletteCanvasDndDragContext.Provider value={dragRef.current}>
        {children}
        {isPaletteDragging ? (
          <div
            className="fixed inset-0 z-[9999] cursor-grabbing"
            aria-hidden
          />
        ) : null}
        {dragGhost ? <PaletteDragGhost ghost={dragGhost} /> : null}
      </PaletteCanvasDndDragContext.Provider>
    </PaletteCanvasDndApiContext.Provider>
  );
}

export function usePaletteCanvasDndApi(): PaletteCanvasDndApi {
  const api = useContext(PaletteCanvasDndApiContext);
  if (!api) {
    throw new Error("usePaletteCanvasDndApi must be used within PaletteCanvasDndProvider");
  }
  return api;
}

export function usePaletteCanvasDnd(): PaletteCanvasDndContextValue {
  const api = usePaletteCanvasDndApi();
  const drag = useContext(PaletteCanvasDndDragContext);
  return {
    ...api,
    isPaletteDragging: drag.isPaletteDragging,
    isCanvasDragging: drag.isCanvasDragging,
  };
}
