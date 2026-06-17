import {
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties } from "react";
import type {
  ButtonBlock,
  ColumnBlock,
  ContentBlock,
  DividerBlock,
  HeadingBlock,
  HtmlBlock,
  ImageBlock,
  RichtextBlock,
  RowBlock,
  SectionBlock,
  ShapeBlock,
  SocialBlock,
  SocialLink,
  SpacerBlock,
  TableBlock,
  TableColumn,
  TemplateContentData,
  TextBlock,
} from "@repo/shared";
import { blockStylesToCss } from "../styles";
import {
  registerContentBlockRenderer,
  renderContentBlockHtml,
  type RenderContext,
} from "./content-block-registry";
import { renderContentBlockText } from "./plain-text";

function renderHeadingBlock(block: HeadingBlock, context: RenderContext) {
  const { text, level, color, fontSize, fontWeight } = block.props;
  const headingAs = {
    1: "h1",
    2: "h2",
    3: "h3",
    4: "h4",
    5: "h5",
    6: "h6",
  } as const;

  return (
    <Heading
      key={block.id}
      as={headingAs[level]}
      style={{
        ...blockStylesToCss(block.styles),
        color: color ?? context.settings.textColor ?? "#111111",
        fontSize: fontSize ?? undefined,
        fontWeight: fontWeight ?? undefined,
        fontFamily: context.settings.fontFamily,
        lineHeight: context.settings.lineHeight,
        margin: 0,
      }}
    >
      {text}
    </Heading>
  );
}

function renderTextBlock(block: TextBlock, context: RenderContext) {
  const { text, color, fontSize, fontWeight, lineHeight } = block.props;

  return (
    <Text
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        color: color ?? context.settings.textColor ?? "#333333",
        fontSize: fontSize ?? context.settings.fontSize ?? 16,
        fontWeight: fontWeight ?? undefined,
        lineHeight: lineHeight ?? context.settings.lineHeight ?? 1.5,
        fontFamily: context.settings.fontFamily,
        margin: 0,
      }}
    >
      {text}
    </Text>
  );
}

function renderRichtextBlock(block: RichtextBlock, context: RenderContext) {
  const { html, color, fontSize, lineHeight } = block.props;

  return (
    <Text
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        color: color ?? context.settings.textColor ?? "#333333",
        fontSize: fontSize ?? context.settings.fontSize ?? 16,
        lineHeight: lineHeight ?? context.settings.lineHeight ?? 1.5,
        fontFamily: context.settings.fontFamily,
        margin: 0,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderButtonBlock(block: ButtonBlock, context: RenderContext) {
  const {
    text,
    href,
    backgroundColor,
    textColor,
    borderRadius,
    borderWidth,
    borderColor,
    fontSize,
    fullWidth,
    paddingX,
    paddingY,
  } = block.props;

  return (
    <Section key={block.id} style={blockStylesToCss(block.styles)}>
      <Button
        href={href}
        style={{
          backgroundColor: backgroundColor ?? context.settings.linkColor ?? "#2563eb",
          color: textColor ?? "#ffffff",
          borderRadius: `${borderRadius ?? 6}px`,
          borderWidth: borderWidth ?? 0,
          borderColor: borderColor ?? "transparent",
          borderStyle: "solid",
          fontSize: fontSize ?? 16,
          fontFamily: context.settings.fontFamily,
          padding: `${paddingY ?? 12}px ${paddingX ?? 24}px`,
          display: fullWidth ? "block" : "inline-block",
          width: fullWidth ? "100%" : undefined,
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        {text}
      </Button>
    </Section>
  );
}

function renderImageBlock(block: ImageBlock) {
  const { src, alt, href, width, height, borderRadius } = block.props;
  const image = (
    <Img
      src={src}
      alt={alt ?? ""}
      width={width === "100%" ? undefined : width}
      height={height}
      style={{
        ...blockStylesToCss(block.styles),
        width: width === "100%" ? "100%" : width ? `${width}px` : "100%",
        maxWidth: "100%",
        borderRadius: borderRadius ? `${borderRadius}px` : undefined,
        display: "block",
      }}
    />
  );

  return (
    <Section key={block.id}>
      {href ? <Link href={href}>{image}</Link> : image}
    </Section>
  );
}

function renderDividerBlock(block: DividerBlock) {
  const { color, thickness, style, width } = block.props;

  return (
    <Hr
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        borderColor: color ?? "#e5e7eb",
        borderWidth: `${thickness ?? 1}px`,
        borderStyle: style ?? "solid",
        width: typeof width === "number" ? `${width}px` : width ?? "100%",
        margin: 0,
      }}
    />
  );
}

function renderSpacerBlock(block: SpacerBlock) {
  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        height: `${block.props.height}px`,
        lineHeight: `${block.props.height}px`,
        fontSize: "1px",
      }}
    >
      &nbsp;
    </Section>
  );
}

function renderSocialBlock(block: SocialBlock, context: RenderContext) {
  const { links, iconSize, gap, iconColor, backgroundColor } = block.props;

  return (
    <Section key={block.id} style={blockStylesToCss(block.styles)}>
      <Row>
        {links.map((link: SocialLink) => (
          <Column
            key={`${block.id}-${link.platform}`}
            style={{
              width: "auto",
              paddingRight: gap ?? 8,
            }}
          >
            <Link
              href={link.url}
              style={{
                color: iconColor ?? context.settings.linkColor ?? "#2563eb",
                backgroundColor: backgroundColor,
                fontSize: iconSize ?? 24,
                fontFamily: context.settings.fontFamily,
                textDecoration: "none",
                textTransform: "capitalize",
              }}
            >
              {link.label ?? link.platform}
            </Link>
          </Column>
        ))}
      </Row>
    </Section>
  );
}

function renderHtmlBlock(block: HtmlBlock) {
  return (
    <Section
      key={block.id}
      style={blockStylesToCss(block.styles)}
      dangerouslySetInnerHTML={{ __html: block.props.html }}
    />
  );
}

function renderTableBlock(block: TableBlock, context: RenderContext) {
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

function renderShapeBlock(block: ShapeBlock) {
  const { shape, color, width, height, borderRadius } = block.props;

  const shapeStyles: CSSProperties = {
    ...blockStylesToCss(block.styles),
    backgroundColor: color ?? "#2563eb",
    width: `${width ?? 80}px`,
    height: `${height ?? 80}px`,
    borderRadius:
      shape === "circle"
        ? "50%"
        : shape === "line"
          ? "0"
          : `${borderRadius ?? 0}px`,
    display: "inline-block",
  };

  if (shape === "line") {
    shapeStyles.height = `${height ?? 2}px`;
    shapeStyles.width = `${width ?? 120}px`;
  }

  return (
    <Section key={block.id}>
      <div style={shapeStyles} />
    </Section>
  );
}

registerContentBlockRenderer("heading", { html: renderHeadingBlock });
registerContentBlockRenderer("text", { html: renderTextBlock });
registerContentBlockRenderer("richtext", { html: renderRichtextBlock });
registerContentBlockRenderer("button", { html: renderButtonBlock });
registerContentBlockRenderer("image", { html: renderImageBlock });
registerContentBlockRenderer("divider", { html: renderDividerBlock });
registerContentBlockRenderer("spacer", { html: renderSpacerBlock });
registerContentBlockRenderer("social", { html: renderSocialBlock });
registerContentBlockRenderer("html", { html: renderHtmlBlock });
registerContentBlockRenderer("table", { html: renderTableBlock });
registerContentBlockRenderer("shape", { html: renderShapeBlock });

export function renderContentBlock(block: ContentBlock, context: RenderContext) {
  return renderContentBlockHtml(block, context);
}

function renderColumnBlock(column: ColumnBlock, context: RenderContext) {
  const width = column.props.width ? `${column.props.width}%` : undefined;

  return (
    <Column
      key={column.id}
      style={{
        ...blockStylesToCss(column.styles),
        width,
        verticalAlign: column.styles?.verticalAlign ?? "top",
      }}
    >
      {column.children.map((child) => renderContentBlock(child, context))}
    </Column>
  );
}

function renderRowBlock(row: RowBlock, context: RenderContext) {
  return (
    <Row key={row.id} style={blockStylesToCss(row.styles)}>
      {row.children.map((column, index) => {
        const explicitWidth = row.props.columnWidths?.[index];
        const columnWithWidth =
          explicitWidth !== undefined
            ? {
                ...column,
                props: { ...column.props, width: explicitWidth },
              }
            : column;

        return renderColumnBlock(columnWithWidth, context);
      })}
    </Row>
  );
}

function renderSectionBlock(section: SectionBlock, context: RenderContext) {
  return (
    <Section
      key={section.id}
      style={{
        ...blockStylesToCss(section.styles),
        width: section.props.fullWidth ? "100%" : undefined,
      }}
    >
      {section.children.map((row) => renderRowBlock(row, context))}
    </Section>
  );
}

type TemplateEmailProps = {
  content: TemplateContentData;
};

export function TemplateEmail({ content }: TemplateEmailProps) {
  const settings = content.settings;
  const context: RenderContext = { settings };

  return (
    <Html>
      <Head />
      {settings.preheader ? <Preview>{settings.preheader}</Preview> : null}
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: settings.backgroundColor ?? "#f3f4f6",
          fontFamily: settings.fontFamily ?? "Arial, sans-serif",
        }}
      >
        <Container
          style={{
            width: `${settings.width}px`,
            maxWidth: "100%",
            margin: "0 auto",
            backgroundColor: settings.contentBackgroundColor ?? "#ffffff",
          }}
        >
          {content.body.map((section) => renderSectionBlock(section, context))}
        </Container>
      </body>
    </Html>
  );
}

export function renderTemplatePlainText(content: TemplateContentData): string {
  const lines: string[] = [];

  if (content.settings.preheader) {
    lines.push(content.settings.preheader);
    lines.push("");
  }

  for (const section of content.body) {
    for (const row of section.children) {
      for (const column of row.children) {
        for (const block of column.children) {
          const line = renderContentBlockText(block);
          if (line) {
            lines.push(line);
          }
        }
      }
    }
  }

  return lines.join("\n").trim();
}
