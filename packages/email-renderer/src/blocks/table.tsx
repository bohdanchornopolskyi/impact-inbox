import { Section } from "@react-email/components";
import type { TableBlock, TableColumn } from "@repo/shared";
import { blockStylesToCss } from "../styles";
import { registerBlock, type RenderContext } from "./content-block-registry";

export function renderTableBlock(block: TableBlock, context: RenderContext) {
  const {
    columns,
    rows,
    headerBackgroundColor,
    headerTextColor,
    cellBackgroundColor,
    cellTextColor,
    borderColor,
    striped,
    bordered,
  } = block.props;

  const border = bordered ? `1px solid ${borderColor ?? "#e5e7eb"}` : "none";

  return (
    <Section key={block.id} style={blockStylesToCss(block.styles)}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: context.settings.fontFamily,
        }}
      >
        <thead>
          <tr>
            {columns.map((column: TableColumn) => (
              <th
                key={`${block.id}-header-${column.header}`}
                style={{
                  textAlign: column.align ?? "left",
                  backgroundColor: headerBackgroundColor ?? "#f3f4f6",
                  color: headerTextColor ?? "#111111",
                  padding: "12px",
                  border,
                  width:
                    column.width === "auto"
                      ? undefined
                      : column.width
                        ? `${column.width}px`
                        : undefined,
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: string[], rowIndex: number) => (
            <tr
              key={`${block.id}-row-${rowIndex}`}
              style={{
                backgroundColor:
                  striped && rowIndex % 2 === 1
                    ? (cellBackgroundColor ?? "#f9fafb")
                    : undefined,
              }}
            >
              {row.map((cell: string, cellIndex: number) => (
                <td
                  key={`${block.id}-cell-${rowIndex}-${cellIndex}`}
                  style={{
                    textAlign: columns[cellIndex]?.align ?? "left",
                    color: cellTextColor ?? context.settings.textColor ?? "#333333",
                    padding: "12px",
                    border,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function renderTableBlockText(block: TableBlock): string {
  const headers = block.props.columns.map((column) => column.header).join(" | ");
  const rows = block.props.rows.map((row) => row.join(" | ")).join("\n");
  return `${headers}\n${rows}`;
}

registerBlock("table", { html: renderTableBlock, text: renderTableBlockText });
