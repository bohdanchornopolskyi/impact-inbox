"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { SegmentedControl } from "@repo/ui/client";
import {
  findBlock,
  getBlockLabel,
  getPreviewLayoutKey,
} from "@repo/shared";
import {
  previewWidth,
  useRenderedPreview,
} from "@/lib/templates/use-rendered-preview";
import { useBuilder } from "../builder-provider";
import { buildCanvasBridgeDocument } from "./canvas-bridge";
import {
  createCanvasPreviewController,
  resolveEffectiveHtml,
} from "./canvas-preview-controller";
import {
  useRichtextCanvasEdit,
  type RichtextCommand,
} from "./richtext-canvas-edit-context";

export function PreviewCanvas() {
  const content = useBuilder((s) => s.content);
  const canEdit = useBuilder((s) => s.canEdit);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const selectBlock = useBuilder((s) => s.selectBlock);
  const updateBlockProps = useBuilder((s) => s.updateBlockProps);
  const previewDevice = useBuilder((s) => s.previewDevice);
  const setPreviewDevice = useBuilder((s) => s.setPreviewDevice);
  const {
    session: richtextSession,
    startEdit: startRichtextEdit,
    endEdit: endRichtextEdit,
    commitEdit: commitRichtextEdit,
    setFormatState,
    registerCommandSink,
  } = useRichtextCanvasEdit();
  const richtextSessionRef = useRef(richtextSession);
  richtextSessionRef.current = richtextSession;
  const selectedBlockIdRef = useRef(selectedBlockId);
  selectedBlockIdRef.current = selectedBlockId;
  const contentRef = useRef(content);
  contentRef.current = content;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlRef = useRef("");
  const srcDocRef = useRef("");
  const [iframeSrcDoc, setIframeSrcDoc] = useState("");
  const [plainTextEditPaused, setPlainTextEditPaused] = useState(false);
  const previewPaused = plainTextEditPaused || richtextSession !== null;
  const { html, debouncedHash, previewMatchesContent } = useRenderedPreview(
    content,
    true,
    previewPaused,
  );

  htmlRef.current = html;

  const canvasWidth = previewWidth(previewDevice, content.settings);

  const selectedLabel = useMemo(() => {
    if (!selectedBlockId) {
      return null;
    }

    const found = findBlock(content, selectedBlockId);
    return found ? getBlockLabel(found.block) : null;
  }, [content, selectedBlockId]);

  const selectedLabelRef = useRef(selectedLabel);
  selectedLabelRef.current = selectedLabel;
  const debouncedHashRef = useRef(debouncedHash);
  debouncedHashRef.current = debouncedHash;
  const previewMatchesContentRef = useRef(previewMatchesContent);
  previewMatchesContentRef.current = previewMatchesContent;
  const canEditRef = useRef(canEdit);
  canEditRef.current = canEdit;

  const postSelectBlock = useCallback(
    (blockId: string | null, label: string | null) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "select-block", blockId, label },
        "*",
      );
    },
    [],
  );

  const controllerRef = useRef<ReturnType<
    typeof createCanvasPreviewController
  > | null>(null);
  const reloadIframeSrcDocRef = useRef(
    (_htmlToRender: string, _nextLayoutKey: string, _nextHash: string) => {},
  );
  const patchPreviewHtmlRef = useRef(
    (_htmlToRender: string, _nextHash: string) => {},
  );

  patchPreviewHtmlRef.current = (htmlToRender, nextHash) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "update-preview", html: htmlToRender },
      "*",
    );
    controllerRef.current!.appliedHtmlHashRef.current = nextHash;
  };

  reloadIframeSrcDocRef.current = (htmlToRender, nextLayoutKey, nextHash) => {
    const built = buildCanvasBridgeDocument(htmlToRender, {
      canEdit: canEditRef.current,
    });
    controllerRef.current!.applyReloadState(nextLayoutKey, nextHash);
    srcDocRef.current = built;
    setIframeSrcDoc(built);
  };

  if (!controllerRef.current) {
    controllerRef.current = createCanvasPreviewController({
      getContent: () => contentRef.current,
      getHtml: () => htmlRef.current,
      getDebouncedHash: () => debouncedHashRef.current,
      getPreviewMatchesContent: () => previewMatchesContentRef.current,
      getSelectedBlockId: () => selectedBlockIdRef.current,
      getSelectedLabel: () => selectedLabelRef.current,
      getCanEdit: () => canEditRef.current,
      selectBlock,
      updateBlockProps,
      onPlainTextEditPausedChange: setPlainTextEditPaused,
      startRichtextEdit,
      endRichtextEdit,
      setFormatState,
      onReload: (htmlToRender, layoutKey) => {
        reloadIframeSrcDocRef.current(
          htmlToRender,
          layoutKey,
          debouncedHashRef.current,
        );
      },
      onPatch: (htmlToRender, nextHash) => {
        patchPreviewHtmlRef.current(htmlToRender, nextHash);
      },
      onSelectBlockPosted: postSelectBlock,
    });
  }

  const controller = controllerRef.current;

  const patchPreviewHtml = useCallback((htmlToRender: string, nextHash: string) => {
    patchPreviewHtmlRef.current(htmlToRender, nextHash);
  }, []);

  const reloadIframeSrcDoc = useCallback(
    (htmlToRender: string, nextLayoutKey: string, nextHash: string) => {
      reloadIframeSrcDocRef.current(htmlToRender, nextLayoutKey, nextHash);
    },
    [],
  );

  const effectiveHtml = resolveEffectiveHtml(
    previewPaused,
    html,
    controller.pausedHtmlRef.current,
  );

  const layoutKey = useMemo(() => getPreviewLayoutKey(content), [content]);

  useEffect(() => {
    const action = controller.resolvePreviewUpdate({
      effectiveHtml,
      layoutKey,
      debouncedHash,
      canEdit,
      previewPaused,
      previewMatchesContent,
      hasSrcDoc: Boolean(srcDocRef.current),
      iframeReady: controller.iframeReadyRef.current,
    });

    if (action === "reload") {
      reloadIframeSrcDoc(effectiveHtml, layoutKey, debouncedHash);
      return;
    }

    if (action === "patch") {
      patchPreviewHtml(effectiveHtml, debouncedHash);
    }
  }, [
    controller,
    effectiveHtml,
    layoutKey,
    canEdit,
    previewPaused,
    previewMatchesContent,
    debouncedHash,
    reloadIframeSrcDoc,
    patchPreviewHtml,
  ]);

  useEffect(() => {
    registerCommandSink((command: RichtextCommand) => {
      iframeRef.current?.contentWindow?.postMessage(command, "*");
    });
    return () => registerCommandSink(null);
  }, [registerCommandSink]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      controller.handleMessage(event.data, event.source);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [controller]);

  useEffect(() => {
    if (!richtextSession) {
      return;
    }

    if (selectedBlockId !== richtextSession.blockId) {
      commitRichtextEdit();
    }
  }, [commitRichtextEdit, richtextSession, selectedBlockId]);

  useEffect(() => {
    if (!richtextSession) {
      controller.clearRichtextPause();
    }
  }, [controller, richtextSession]);

  useEffect(() => {
    postSelectBlock(selectedBlockId, selectedLabel);
  }, [selectedBlockId, selectedLabel, postSelectBlock]);

  const handleIframeLoad = useCallback(() => {
    controller.markIframeReady();
    postSelectBlock(selectedBlockId, selectedLabel);

    const action = controller.resolvePreviewUpdate({
      effectiveHtml: htmlRef.current,
      layoutKey,
      debouncedHash,
      canEdit,
      previewPaused,
      previewMatchesContent,
      hasSrcDoc: Boolean(srcDocRef.current),
      iframeReady: true,
    });

    if (action === "patch") {
      patchPreviewHtml(htmlRef.current, debouncedHash);
    }
  }, [
    canEdit,
    controller,
    debouncedHash,
    layoutKey,
    patchPreviewHtml,
    postSelectBlock,
    previewMatchesContent,
    previewPaused,
    selectedBlockId,
    selectedLabel,
  ]);

  const srcDoc = iframeSrcDoc;

  return (
    <div className="flex h-full flex-col bg-surface-sunken">
      <div className="flex items-center justify-between border-b border-border-default bg-surface-card px-4 py-2">
        <p className="text-ui-sm text-text-secondary">Canvas preview</p>
        <SegmentedControl
          value={previewDevice}
          onChange={(value) =>
            setPreviewDevice(value as "desktop" | "mobile")
          }
          options={[
            {
              value: "desktop",
              label: "Desktop",
              icon: <Monitor className="size-4" strokeWidth={1.5} />,
            },
            {
              value: "mobile",
              label: "Mobile",
              icon: <Smartphone className="size-4" strokeWidth={1.5} />,
            },
          ]}
        />
      </div>
      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div
          className="relative bg-white shadow-card"
          style={{ width: canvasWidth }}>
          <iframe
            ref={iframeRef}
            title="Template preview"
            className="block w-full border-0"
            style={{ minHeight: 640 }}
            srcDoc={srcDoc}
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
      {!canEdit ? (
        <p className="border-t border-border-subtle px-4 py-2 text-ui-xs text-text-tertiary">
          View-only access
        </p>
      ) : null}
    </div>
  );
}
