"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useBuilder } from "../builder-provider";
import type {
  RichtextCancelMessage,
  RichtextCommitMessage,
  RichtextFormatCommandMessage,
  RichtextFormatStateData,
  RichtextHeadingTag,
  RichtextSetHeadingMessage,
} from "./canvas-bridge-protocol";

export type RichtextEditSession = {
  blockId: string;
};

export type RichtextFormatState = RichtextFormatStateData;

export type RichtextCommand =
  | RichtextFormatCommandMessage
  | RichtextSetHeadingMessage
  | RichtextCommitMessage
  | RichtextCancelMessage;

type RichtextCommandSink = (command: RichtextCommand) => void;

const EMPTY_FORMAT_STATE: RichtextFormatState = {
  bold: false,
  italic: false,
  underline: false,
  heading: "p",
};

type RichtextCanvasEditContextValue = {
  session: RichtextEditSession | null;
  formatState: RichtextFormatState;
  startEdit: (session: RichtextEditSession) => void;
  endEdit: () => void;
  registerCommandSink: (sink: RichtextCommandSink | null) => void;
  setFormatState: (next: RichtextFormatState) => void;
  toggleBold: (blockId: string) => void;
  toggleItalic: (blockId: string) => void;
  toggleUnderline: (blockId: string) => void;
  toggleLink: (blockId: string) => void;
  insertBulletList: (blockId: string) => void;
  insertNumberedList: (blockId: string) => void;
  setHeading: (blockId: string, tag: RichtextHeadingTag) => void;
  commitEdit: () => void;
};

const RichtextCanvasEditContext =
  createContext<RichtextCanvasEditContextValue | null>(null);

export function RichtextCanvasEditProvider({ children }: { children: ReactNode }) {
  const selectBlock = useBuilder((s) => s.selectBlock);
  const setInspectorMode = useBuilder((s) => s.setInspectorMode);
  const [session, setSession] = useState<RichtextEditSession | null>(null);
  const [formatState, setFormatState] =
    useState<RichtextFormatState>(EMPTY_FORMAT_STATE);
  const sinkRef = useRef<RichtextCommandSink | null>(null);

  const registerCommandSink = useCallback(
    (sink: RichtextCommandSink | null) => {
      sinkRef.current = sink;
    },
    [],
  );

  const send = useCallback((command: RichtextCommand) => {
    sinkRef.current?.(command);
  }, []);

  const startEdit = useCallback(
    (next: RichtextEditSession) => {
      setSession(next);
      selectBlock(next.blockId);
      setInspectorMode("block");
    },
    [selectBlock, setInspectorMode],
  );

  const endEdit = useCallback(() => {
    setSession(null);
    setFormatState(EMPTY_FORMAT_STATE);
  }, []);

  const sendFormat = useCallback(
    (blockId: string, command: string, value?: string) => {
      send({ type: "richtext-format", blockId, command, value });
    },
    [send],
  );

  const toggleBold = useCallback(
    (blockId: string) => {
      sendFormat(blockId, "bold");
    },
    [sendFormat],
  );

  const toggleItalic = useCallback(
    (blockId: string) => {
      sendFormat(blockId, "italic");
    },
    [sendFormat],
  );

  const toggleUnderline = useCallback(
    (blockId: string) => {
      sendFormat(blockId, "underline");
    },
    [sendFormat],
  );

  const toggleLink = useCallback(
    (blockId: string) => {
      const url = window.prompt("Link URL");
      if (url === null) {
        return;
      }

      const trimmed = url.trim();
      sendFormat(
        blockId,
        trimmed ? "createLink" : "unlink",
        trimmed || undefined,
      );
    },
    [sendFormat],
  );

  const insertBulletList = useCallback(
    (blockId: string) => {
      sendFormat(blockId, "insertUnorderedList");
    },
    [sendFormat],
  );

  const insertNumberedList = useCallback(
    (blockId: string) => {
      sendFormat(blockId, "insertOrderedList");
    },
    [sendFormat],
  );

  const setHeading = useCallback(
    (blockId: string, tag: RichtextHeadingTag) => {
      send({ type: "richtext-set-heading", blockId, tag });
    },
    [send],
  );

  const commitEdit = useCallback(() => {
    send({ type: "richtext-commit" });
  }, [send]);

  const value = useMemo(
    () => ({
      session,
      formatState,
      startEdit,
      endEdit,
      registerCommandSink,
      setFormatState,
      toggleBold,
      toggleItalic,
      toggleUnderline,
      toggleLink,
      insertBulletList,
      insertNumberedList,
      setHeading,
      commitEdit,
    }),
    [
      session,
      formatState,
      startEdit,
      endEdit,
      registerCommandSink,
      toggleBold,
      toggleItalic,
      toggleUnderline,
      toggleLink,
      insertBulletList,
      insertNumberedList,
      setHeading,
      commitEdit,
    ],
  );

  return (
    <RichtextCanvasEditContext.Provider value={value}>
      {children}
    </RichtextCanvasEditContext.Provider>
  );
}

export function useRichtextCanvasEdit(): RichtextCanvasEditContextValue {
  const context = useContext(RichtextCanvasEditContext);
  if (!context) {
    throw new Error(
      "useRichtextCanvasEdit must be used within RichtextCanvasEditProvider",
    );
  }
  return context;
}
