"use client";

import { Mail, Text } from "lucide-react";
import { useBuilder } from "../builder-provider";

export function CanvasSubjectCard({ width }: { width: number }) {
  const canEdit = useBuilder((s) => s.canEdit);
  const settings = useBuilder((s) => s.content.settings);
  const updateSettings = useBuilder((s) => s.updateSettings);

  return (
    <div
      className="overflow-hidden rounded-md bg-surface"
      style={{ width }}
    >
      <label className="flex h-9 items-center gap-2.5 border-b border-border px-3.5">
        <Mail className="size-3.5 shrink-0 text-text-3" strokeWidth={1.5} />
        <span className="w-[66px] shrink-0 text-xs font-semibold text-text-3">
          Subject
        </span>
        <input
          value={settings.subject ?? ""}
          disabled={!canEdit}
          placeholder="Email subject"
          className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-3 disabled:text-text-3"
          onChange={(event) => updateSettings({ subject: event.target.value })}
        />
      </label>
      <label className="flex h-9 items-center gap-2.5 px-3.5">
        <Text className="size-3.5 shrink-0 text-text-3" strokeWidth={1.5} />
        <span className="w-[66px] shrink-0 text-xs font-semibold text-text-3">
          Preheader
        </span>
        <input
          value={settings.preheader ?? ""}
          disabled={!canEdit}
          placeholder="Preview text"
          className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-3 disabled:text-text-3"
          onChange={(event) => updateSettings({ preheader: event.target.value })}
        />
      </label>
    </div>
  );
}
