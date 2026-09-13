"use client";

import type { SocialBlock, TableBlock } from "@repo/shared";
import { Button, Input, Select, Textarea } from "@repo/ui/client";

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
  return (
    <>
      <Input
        label="Headers (comma separated)"
        value={block.props.columns.map((column) => column.header).join(", ")}
        onChange={(event) =>
          updateProps({
            columns: event.target.value
              .split(",")
              .map((header) => ({ header: header.trim() }))
              .filter((column) => column.header),
          })
        }
      />
      <Textarea
        label="Rows (one row per line, cells comma separated)"
        value={block.props.rows.map((row) => row.join(", ")).join("\n")}
        onChange={(event) =>
          updateProps({
            rows: event.target.value
              .split("\n")
              .map((row) => row.split(",").map((cell) => cell.trim()))
              .filter((row) => row.length > 0),
          })
        }
      />
    </>
  );
}
