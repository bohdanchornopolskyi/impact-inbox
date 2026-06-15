import type { ContentBlock } from "@repo/shared";

export function renderContentBlockText(block: ContentBlock): string | null {
  switch (block.type) {
    case "heading":
    case "text":
      return block.props.text;
    case "richtext":
      return block.props.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    case "button":
      return `${block.props.text}: ${block.props.href}`;
    case "image":
      return block.props.alt ?? block.props.src;
    case "divider":
      return "---";
    case "spacer":
      return "";
    case "social":
      return block.props.links
        .map((link) => `${link.label ?? link.platform}: ${link.url}`)
        .join("\n");
    case "html":
      return block.props.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    case "table": {
      const headers = block.props.columns.map((column) => column.header).join(" | ");
      const rows = block.props.rows
        .map((row) => row.join(" | "))
        .join("\n");
      return `${headers}\n${rows}`;
    }
    case "shape":
      return "";
  }
}
