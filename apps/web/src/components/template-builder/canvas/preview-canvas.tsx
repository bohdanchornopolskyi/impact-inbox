"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { SegmentedControl } from "@repo/ui/client";
import { findBlock, getBlockLabel, sanitizeRichtextHtml } from "@repo/shared";
import {
  previewWidth,
  useRenderedPreview,
} from "@/lib/templates/use-rendered-preview";
import { useBuilder } from "../builder-provider";
import {
  buildCanvasBridgeDocument,
  isBlockEditCancelMessage,
  isBlockEditCommitMessage,
  isBlockEditStartMessage,
  isBlockEditSyncMessage,
  isBlockSelectMessage,
  isPreviewNeedsReloadMessage,
  isRichtextFormatStateMessage,
} from "./canvas-bridge";
import {
  getPreviewLayoutKey,
  needsPreviewFullReload,
} from "./canvas-preview-layout";
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
  const richtextSnapshotRef = useRef<{ blockId: string; html: string } | null>(
    null,
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlRef = useRef("");
  const srcDocRef = useRef("");
  const pausedHtmlRef = useRef<string | null>(null);
  const iframeReadyRef = useRef(false);
  const layoutKeyRef = useRef("");
  const appliedHtmlHashRef = useRef("");
  const canEditRef = useRef(canEdit);
  canEditRef.current = canEdit;
  const [iframeSrcDoc, setIframeSrcDoc] = useState("");
  const [plainTextEditPaused, setPlainTextEditPaused] = useState(false);
  const previewPaused = plainTextEditPaused || richtextSession !== null;
  const { html, debouncedHash, previewMatchesContent } = useRenderedPreview(
    content,
    true,
    previewPaused,
  );

  htmlRef.current = html;

  const effectiveHtml =
    previewPaused && pausedHtmlRef.current !== null
      ? pausedHtmlRef.current
      : html;

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

  const builtSrcDoc = useMemo(
    () =>
      effectiveHtml
        ? buildCanvasBridgeDocument(effectiveHtml, { canEdit })
        : "",
    [effectiveHtml, canEdit],
  );

  const layoutKey = useMemo(() => getPreviewLayoutKey(content), [content]);

  if (!previewPaused) {
    srcDocRef.current = builtSrcDoc;
  }

  const reloadIframeSrcDoc = useCallback(
    (htmlToRender: string, nextLayoutKey: string) => {
      const built = buildCanvasBridgeDocument(htmlToRender, { canEdit });
      layoutKeyRef.current = nextLayoutKey;
      canEditRef.current = canEdit;
      appliedHtmlHashRef.current = debouncedHash;
      iframeReadyRef.current = false;
      srcDocRef.current = built;
      setIframeSrcDoc(built);
    },
    [canEdit, debouncedHash],
  );

  const patchPreviewHtml = useCallback(
    (htmlToRender: string) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "update-preview", html: htmlToRender },
        "*",
      );
      appliedHtmlHashRef.current = debouncedHash;
    },
    [debouncedHash],
  );

  useEffect(() => {
    if (!effectiveHtml || previewPaused) {
      return;
    }

    if (!previewMatchesContent) {
      return;
    }

    const needsFullReload = needsPreviewFullReload({
      hasSrcDoc: Boolean(srcDocRef.current),
      layoutKey,
      appliedLayoutKey: layoutKeyRef.current,
      canEdit,
      appliedCanEdit: canEditRef.current,
    });

    if (needsFullReload) {
      reloadIframeSrcDoc(effectiveHtml, layoutKey);
      return;
    }

    if (appliedHtmlHashRef.current === debouncedHash) {
      return;
    }

    if (!iframeReadyRef.current) {
      return;
    }

    patchPreviewHtml(effectiveHtml);
  }, [
    effectiveHtml,
    layoutKey,
    canEdit,
    previewPaused,
    previewMatchesContent,
    debouncedHash,
    reloadIframeSrcDoc,
    patchPreviewHtml,
  ]);

  const postSelectBlock = useCallback(
    (blockId: string | null, label: string | null) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "select-block", blockId, label },
        "*",
      );
    },
    [],
  );

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

      if (isBlockSelectMessage(event.data)) {
        selectBlock(event.data.blockId);
        return;
      }

      if (isBlockEditStartMessage(event.data)) {
        pausedHtmlRef.current = htmlRef.current;
        if (event.data.editKind === "richtext") {
          const found = findBlock(contentRef.current, event.data.blockId);
          const html =
            found?.block.type === "richtext"
              ? String((found.block.props as { html?: string }).html ?? "")
              : "";
          richtextSnapshotRef.current = {
            blockId: event.data.blockId,
            html,
          };
          startRichtextEdit({ blockId: event.data.blockId });
        } else {
          selectBlock(event.data.blockId);
          queueMicrotask(() => setPlainTextEditPaused(true));
        }
        return;
      }

      if (isBlockEditCommitMessage(event.data)) {
        const value =
          event.data.prop === "html"
            ? sanitizeRichtextHtml(event.data.value)
            : event.data.value;
        updateBlockProps(event.data.blockId, {
          [event.data.prop]: value,
        });
        richtextSnapshotRef.current = null;
        pausedHtmlRef.current = null;
        setPlainTextEditPaused(false);
        endRichtextEdit();
        return;
      }

      if (isBlockEditSyncMessage(event.data)) {
        const value =
          event.data.prop === "html"
            ? sanitizeRichtextHtml(event.data.value)
            : event.data.value;
        updateBlockProps(event.data.blockId, {
          [event.data.prop]: value,
        });
        return;
      }

      if (isBlockEditCancelMessage(event.data)) {
        const snapshot = richtextSnapshotRef.current;
        if (snapshot && snapshot.blockId === event.data.blockId) {
          updateBlockProps(snapshot.blockId, { html: snapshot.html });
        }
        richtextSnapshotRef.current = null;
        pausedHtmlRef.current = null;
        setPlainTextEditPaused(false);
        endRichtextEdit();
        postSelectBlock(selectedBlockIdRef.current, selectedLabelRef.current);
        return;
      }

      if (isRichtextFormatStateMessage(event.data)) {
        if (event.data.blockId !== selectedBlockIdRef.current) {
          return;
        }
        setFormatState(event.data.state);
        return;
      }

      if (isPreviewNeedsReloadMessage(event.data)) {
        reloadIframeSrcDoc(
          htmlRef.current,
          getPreviewLayoutKey(contentRef.current),
        );
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [
    endRichtextEdit,
    selectBlock,
    setFormatState,
    startRichtextEdit,
    updateBlockProps,
    reloadIframeSrcDoc,
  ]);

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
      pausedHtmlRef.current = null;
    }
  }, [richtextSession]);

  useEffect(() => {
    postSelectBlock(selectedBlockId, selectedLabel);
  }, [selectedBlockId, selectedLabel, postSelectBlock]);

  const handleIframeLoad = useCallback(() => {
    iframeReadyRef.current = true;
    postSelectBlock(selectedBlockId, selectedLabel);

    if (
      previewPaused ||
      !previewMatchesContent ||
      appliedHtmlHashRef.current === debouncedHash
    ) {
      return;
    }

    patchPreviewHtml(htmlRef.current);
  }, [
    debouncedHash,
    patchPreviewHtml,
    postSelectBlock,
    previewMatchesContent,
    previewPaused,
    selectedBlockId,
    selectedLabel,
  ]);

  const srcDoc = previewPaused ? srcDocRef.current : iframeSrcDoc;

  return (
    <div className="flex h-full flex-col bg-surface-sunken">
      <div className="flex items-center justify-between border-b border-border-default bg-surface-card px-4 py-2">
        <p className="text-ui-sm text-text-secondary">Canvas preview</p>
        <SegmentedControl
          value={previewDevice}
          onChange={(value: "desktop" | "mobile") =>
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
