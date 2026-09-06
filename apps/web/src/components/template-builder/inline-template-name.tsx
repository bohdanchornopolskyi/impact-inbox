"use client";

import { useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { useUpdateTemplate } from "@/lib/templates/template-hooks";
import { useToastMutation } from "@/lib/use-toast-mutation";
import {
  useApplyTemplateRename,
  useBuilder,
} from "./builder-provider";
import {
  TEMPLATE_NAME_MAX_LENGTH,
  nextTemplateName,
} from "./template-name";

export function InlineTemplateName() {
  const name = useBuilder((s) => s.name);
  const templateId = useBuilder((s) => s.templateId);
  const expectedUpdatedAt = useBuilder((s) => s.updatedAt);
  const canEdit = useBuilder((s) => s.canEdit);
  const applyRename = useApplyTemplateRename();
  const updateTemplate = useUpdateTemplate(templateId);
  const rename = useToastMutation({
    mutationFn: (nextName: string) =>
      updateTemplate.mutateAsync({
        name: nextName,
        expectedUpdatedAt,
      }),
    errorMessage: "Could not rename template",
    onSuccess: (template) => applyRename(template),
  });
  const [draft, setDraft] = useState<string | null>(null);
  const focusedRef = useRef(false);
  const skipCommitRef = useRef(false);

  function bindInput(node: HTMLInputElement | null) {
    if (!node) {
      focusedRef.current = false;
      return;
    }
    if (focusedRef.current) {
      return;
    }
    focusedRef.current = true;
    node.focus();
    node.select();
  }

  function close() {
    skipCommitRef.current = true;
    setDraft(null);
  }

  function commit() {
    if (skipCommitRef.current) {
      skipCommitRef.current = false;
      return;
    }
    if (draft === null || rename.isPending) {
      return;
    }

    const next = nextTemplateName(draft, name);
    if (!next) {
      close();
      return;
    }

    rename.mutate(next, { onSuccess: close });
  }

  if (!canEdit) {
    return (
      <p className="truncate px-2 text-md font-semibold text-text">{name}</p>
    );
  }

  if (draft === null) {
    return (
      <button
        type="button"
        className="group inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-sm px-2 py-1.5 text-left hover:bg-surface-sunken"
        title="Rename template"
        onClick={() => {
          skipCommitRef.current = false;
          setDraft(name);
        }}
      >
        <span className="truncate text-md font-semibold text-text">{name}</span>
        <Pencil
          className="size-3.25 shrink-0 text-text-3"
          strokeWidth={1.5}
        />
      </button>
    );
  }

  return (
    <span className="grid max-w-full min-w-0 grid-cols-[minmax(0,max-content)]">
      <span
        aria-hidden
        className="invisible col-start-1 row-start-1 truncate px-2 py-1.5 text-md font-semibold whitespace-pre"
      >
        {draft.length > 0 ? draft : name}
      </span>
      <input
        ref={bindInput}
        aria-label="Template name"
        value={draft}
        maxLength={TEMPLATE_NAME_MAX_LENGTH}
        disabled={rename.isPending}
        className="col-start-1 row-start-1 min-w-24 truncate rounded-sm bg-transparent px-2 py-1.5 text-md font-semibold text-text outline-none focus-visible:shadow-(--shadow-ring-accent) disabled:text-text-3"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) {
            return;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}
      />
    </span>
  );
}
