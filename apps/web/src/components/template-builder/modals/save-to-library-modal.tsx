"use client";

import { useRef } from "react";
import { Input } from "@repo/ui/client";
import { useBuilder } from "../builder-provider";
import {
  resolveSelectedSection,
  suggestedSaveName,
} from "../module-save-target";
import { useSaveSectionToLibrary } from "../use-save-section-to-library";
import { ConfirmModal } from "./confirm-modal";

export function SaveToLibraryModal() {
  const open = useBuilder((s) => s.saveLibraryOpen);
  const setOpen = useBuilder((s) => s.setSaveLibraryOpen);
  const section = useBuilder((s) =>
    s.saveLibraryOpen
      ? resolveSelectedSection(s.content, s.selectedBlockId)
      : undefined,
  );
  const { saveSelectedSection, isPending } = useSaveSectionToLibrary();
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <ConfirmModal
      open={open}
      onOpenChange={setOpen}
      title="Save to library"
      description="Saves the section that contains this block."
      confirmLabel="Save"
      isPending={isPending}
      onConfirm={() =>
        saveSelectedSection(nameRef.current?.value.trim() ?? "", () =>
          setOpen(false),
        )
      }
    >
      <Input
        ref={nameRef}
        key={section?.id}
        label="Name"
        defaultValue={section ? suggestedSaveName(section) : ""}
      />
    </ConfirmModal>
  );
}
