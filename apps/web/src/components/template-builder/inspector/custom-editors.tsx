"use client";

import type { SocialBlock, TableBlock } from "@repo/shared";
import { Button, Input, Select, Textarea } from "@repo/ui/client";
import {
  formatTableHeaders,
  formatTableRows,
  parseTableHeaders,
  parseTableRows,
} from "./text-draft";
import { useTextDraft } from "./use-text-draft";

const SOCIAL_PLATFORMS = [
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "pinterest",
  "website",
  "email",
] as const;

type UpdateProps = (props: Record<string, unknown>) => void;

export function SocialLinksEditor({
  block,
  updateProps,
  canEdit,
}: {
  block: SocialBlock;
  updateProps: UpdateProps;
  canEdit: boolean;
}) {
  const { links } = block.props;

  return (
    <>
      {links.map((link, index) => (
        <div
          key={`${link.platform}-${index}`}
          className="space-y-2 rounded-md border border-border-subtle p-3"
        >
          <Select
            label="Platform"
            value={link.platform}
            onChange={(event) => {
              const platform = event.target.value;
              const next = [...links];
              const current = next[index];
              if (!current) {
                return;
              }
              next[index] = {
                ...current,
                platform: platform as typeof current.platform,
              };
              updateProps({ links: next });
            }}
            options={SOCIAL_PLATFORMS.map((platform) => ({
              value: platform,
              label: platform,
            }))}
          />
          <Input
            label="URL"
            value={link.url}
            mono
            onChange={(event) => {
              const url = event.target.value;
              const next = [...links];
              const current = next[index];
              if (!current) {
                return;
              }
              next[index] = { ...current, url };
              updateProps({ links: next });
            }}
          />
        </div>
      ))}
      {canEdit ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            updateProps({
              links: [
                ...links,
                { platform: "website", url: "https://example.com" },
              ],
            })
          }
        >
          Add link
        </Button>
      ) : null}
    </>
  );
}

export function TableEditor({
  block,
  updateProps,
}: {
  block: TableBlock;
  updateProps: UpdateProps;
}) {
  const headerValue = formatTableHeaders(block.props.columns);
  const rowValue = formatTableRows(block.props.rows);
  const headers = useTextDraft(headerValue);
  const rows = useTextDraft(rowValue);

  return (
    <>
      <Input
        label="Headers (comma separated)"
        value={headers.value}
        onChange={(event) => headers.onChange(event.target.value)}
        onKeyDown={headers.onEnterBlur}
        onBlur={(event) => {
          const columns = parseTableHeaders(event.currentTarget.value);
          headers.finish(formatTableHeaders(columns), () =>
            updateProps({ columns }),
          );
        }}
      />
      <Textarea
        label="Rows (one row per line, cells comma separated)"
        value={rows.value}
        onChange={(event) => rows.onChange(event.target.value)}
        onBlur={(event) => {
          const nextRows = parseTableRows(event.currentTarget.value);
          rows.finish(formatTableRows(nextRows), () =>
            updateProps({ rows: nextRows }),
          );
        }}
      />
    </>
  );
}
