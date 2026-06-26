"use client";

import { RICHTEXT_HEADING_TAGS, type RichtextHeadingTag } from "../canvas/canvas-bridge";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import type { ReactNode } from "react";
import { useBuilder } from "../builder-provider";
import { useRichtextCanvasEdit } from "../canvas/richtext-canvas-edit-context";
import { FieldRow, SelectField } from "./fields";

const HEADING_OPTIONS = RICHTEXT_HEADING_TAGS.map((tag) => ({
  value: tag,
  label:
    tag === "p"
      ? "Paragraph"
      : `Heading ${tag.slice(1)}`,
}));

function FormatButton({
  active = false,
  disabled = false,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex size-8 items-center justify-center rounded-md border border-border-strong bg-surface-card text-text-secondary hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50 ${
        active ? "border-accent-border bg-accent-soft text-accent" : ""
      }`}
    >
      {children}
    </button>
  );
}

export function RichtextFormatFields({
  blockId,
  canEdit,
}: {
  blockId: string;
  canEdit: boolean;
}) {
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const {
    formatState,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleLink,
    insertBulletList,
    insertNumberedList,
    setHeading,
  } = useRichtextCanvasEdit();

  const isSelected = selectedBlockId === blockId;
  const showFormatState = isSelected;

  return (
    <>
      <FieldRow label="Format">
        <div className="flex flex-wrap gap-1.5">
          <FormatButton
            active={showFormatState && formatState.bold}
            disabled={!canEdit}
            label="Bold"
            onClick={() => toggleBold(blockId)}
          >
            <Bold className="size-3.5" strokeWidth={2} />
          </FormatButton>
          <FormatButton
            active={showFormatState && formatState.italic}
            disabled={!canEdit}
            label="Italic"
            onClick={() => toggleItalic(blockId)}
          >
            <Italic className="size-3.5" strokeWidth={2} />
          </FormatButton>
          <FormatButton
            active={showFormatState && formatState.underline}
            disabled={!canEdit}
            label="Underline"
            onClick={() => toggleUnderline(blockId)}
          >
            <Underline className="size-3.5" strokeWidth={2} />
          </FormatButton>
          <FormatButton
            disabled={!canEdit}
            label="Link"
            onClick={() => toggleLink(blockId)}
          >
            <Link2 className="size-3.5" strokeWidth={2} />
          </FormatButton>
          <FormatButton
            disabled={!canEdit}
            label="Bullet list"
            onClick={() => insertBulletList(blockId)}
          >
            <List className="size-3.5" strokeWidth={2} />
          </FormatButton>
          <FormatButton
            disabled={!canEdit}
            label="Numbered list"
            onClick={() => insertNumberedList(blockId)}
          >
            <ListOrdered className="size-3.5" strokeWidth={2} />
          </FormatButton>
        </div>
      </FieldRow>
      <SelectField
        label="Text style"
        value={showFormatState ? formatState.heading : "p"}
        disabled={!canEdit}
        onChange={(value) => setHeading(blockId, value as RichtextHeadingTag)}
        options={HEADING_OPTIONS}
      />
    </>
  );
}
