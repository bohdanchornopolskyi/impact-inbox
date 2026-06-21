"use client";

import type { SocialBlock, TableBlock } from "@repo/shared";
import { Button } from "@repo/ui/client";
import { SelectField, TextField, UrlField } from "./fields";

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
          <SelectField
            label="Platform"
            value={link.platform}
            onChange={(platform) => {
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
          <UrlField
            label="URL"
            value={link.url}
            onChange={(url) => {
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
      <TextField
        label="Headers (comma separated)"
        value={block.props.columns.map((column) => column.header).join(", ")}
        onChange={(value) =>
          updateProps({
            columns: value
              .split(",")
              .map((header) => ({ header: header.trim() }))
              .filter((column) => column.header),
          })
        }
      />
      <TextField
        label="Rows (one row per line, cells comma separated)"
        value={block.props.rows.map((row) => row.join(", ")).join("\n")}
        multiline
        onChange={(value) =>
          updateProps({
            rows: value
              .split("\n")
              .map((row) => row.split(",").map((cell) => cell.trim()))
              .filter((row) => row.length > 0),
          })
        }
      />
    </>
  );
}
