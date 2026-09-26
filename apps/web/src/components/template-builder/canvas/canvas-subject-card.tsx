"use client";

import type { ReactNode } from "react";
import { format } from "date-fns";
import { Inbox, Mail, TextCursorInput } from "lucide-react";
import { cn } from "@repo/ui/client";
import { useBuilder } from "../builder-provider";

const SUBJECT_LIMIT = 60;
const PREHEADER_LIMIT = 90;

function CardRow({
  icon,
  label,
  className,
  children,
}: {
  icon: ReactNode;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-10 items-center gap-2.5 px-3.5 [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-text-3",
        className,
      )}
    >
      {icon}
      <span className="w-[66px] shrink-0 text-xs font-semibold text-text-2">
        {label}
      </span>
      {children}
    </div>
  );
}

function CharCount({ length, limit }: { length: number; limit: number }) {
  return (
    <span
      className={cn(
        "shrink-0 text-[11.5px] font-medium tabular-nums text-text-2",
        length > limit && "text-warning-700",
      )}
    >
      {length} / {limit}
    </span>
  );
}

export function CanvasSubjectCard({ width }: { width: number }) {
  const canEdit = useBuilder((s) => s.canEdit);
  const settings = useBuilder((s) => s.content.settings);
  const updateSettings = useBuilder((s) => s.updateSettings);
  const subject = settings.subject ?? "";
  const preheader = settings.preheader ?? "";
  const inputClass =
    "-mx-1.5 h-7 min-w-0 flex-1 rounded-sm bg-transparent px-1.5 text-sm text-text outline-none transition-[background-color] duration-150 ease-out placeholder:text-text-3 hover:bg-bg focus:bg-bg disabled:bg-transparent disabled:text-text-3";

  return (
    <div
      className="overflow-hidden rounded-md border border-border bg-surface"
      style={{ width }}
    >
      <label className="block">
        <CardRow
          icon={<Mail strokeWidth={1.5} />}
          label="Subject"
          className="border-b border-border"
        >
          <input
            value={subject}
            disabled={!canEdit}
            placeholder="Email subject"
            className={inputClass}
            onChange={(event) => updateSettings({ subject: event.target.value })}
          />
          <CharCount length={subject.length} limit={SUBJECT_LIMIT} />
        </CardRow>
      </label>
      <label className="block">
        <CardRow
          icon={<TextCursorInput strokeWidth={1.5} />}
          label="Preheader"
          className="border-b border-border"
        >
          <input
            value={preheader}
            disabled={!canEdit}
            placeholder="Preview text"
            className={inputClass}
            onChange={(event) =>
              updateSettings({ preheader: event.target.value })
            }
          />
          <CharCount length={preheader.length} limit={PREHEADER_LIMIT} />
        </CardRow>
      </label>
      <CardRow
        icon={<Inbox strokeWidth={1.5} />}
        label="Inbox"
        className="bg-bg"
      >
        <p className="min-w-0 flex-1 truncate text-sm">
          <span className="font-semibold text-text">
            {settings.fromName || "Sender"}
          </span>
          <span className="ml-1.5 font-medium text-text">
            {subject || "No subject"}
          </span>
          {preheader ? (
            <span className="ml-1.5 text-text-3">{preheader}</span>
          ) : null}
        </p>
        <span className="shrink-0 text-[11.5px] font-medium text-text-2">
          {format(new Date(), "h:mm a")}
        </span>
      </CardRow>
    </div>
  );
}
