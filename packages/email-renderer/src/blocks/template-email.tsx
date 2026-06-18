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
  FooterBlock,
  HeadingBlock,
  HtmlBlock,
  ImageBlock,
  LogoBlock,
  QrBlock,
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
  VideoBlock,
} from "@repo/shared";
import { alignedBlockStyle, alignedImageStyle } from "../align";
import { buildLayoutMobileStyles } from "../layout-styles";
import { getSocialIconSrc } from "../social-icons";
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

function renderImageBlock(block: ImageBlock, context: RenderContext) {
  const { src, alt, href, width, height, borderRadius, align } = block.props;
  const image = (
    <Img
      src={src}
      alt={alt ?? ""}
      width={width === "100%" ? undefined : width}
      height={height}
      style={{
        ...alignedImageStyle(align),
        width: width === "100%" ? "100%" : width ? `${width}px` : "100%",
        borderRadius: borderRadius ? `${borderRadius}px` : undefined,
      }}
    />
  );

  const content = href ? (
    <Link href={href} style={{ color: context.settings.linkColor }}>
      {image}
    </Link>
  ) : (
    image
  );

  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        ...alignedBlockStyle(align),
      }}
    >
      {content}
    </Section>
  );
}

function renderLogoBlock(block: LogoBlock, context: RenderContext) {
  const { src, alt, href, width, maxHeight, borderRadius, align } = block.props;
  const logo = (
    <Img
      src={src}
      alt={alt ?? "Logo"}
      width={width}
      style={{
        ...alignedImageStyle(align),
        width: width ? `${width}px` : undefined,
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        height: "auto",
        borderRadius: borderRadius ? `${borderRadius}px` : undefined,
      }}
    />
  );

  const content = href ? (
    <Link href={href} style={{ color: context.settings.linkColor }}>
      {logo}
    </Link>
  ) : (
    logo
  );

  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        ...alignedBlockStyle(align),
      }}
    >
      {content}
    </Section>
  );
}

function renderVideoBlock(block: VideoBlock, context: RenderContext) {
  const {
    thumbnailSrc,
    videoUrl,
    alt,
    width,
    borderRadius,
    align,
    playButtonColor,
    playLabel,
  } = block.props;

  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        ...alignedBlockStyle(align),
      }}
    >
      <Link href={videoUrl} style={{ textDecoration: "none", color: "inherit" }}>
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          style={{
            ...alignedImageStyle(align),
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: 0, lineHeight: 0 }}>
                <Img
                  src={thumbnailSrc}
                  alt={alt ?? "Video thumbnail"}
                  width={width === "100%" ? undefined : width}
                  style={{
                    width: width === "100%" ? "100%" : width ? `${width}px` : "100%",
                    maxWidth: "100%",
                    borderRadius: borderRadius ? `${borderRadius}px` : undefined,
                    display: "block",
                  }}
                />
              </td>
            </tr>
            <tr>
              <td
                align="center"
                style={{
                  backgroundColor: playButtonColor ?? "#111827",
                  padding: "10px 16px",
                  borderRadius: borderRadius
                    ? `0 0 ${borderRadius}px ${borderRadius}px`
                    : undefined,
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 14,
                    fontFamily: context.settings.fontFamily,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {playLabel ?? "▶ Watch Video"}
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Link>
    </Section>
  );
}

function renderFooterBlock(block: FooterBlock, context: RenderContext) {
  const {
    companyName,
    address,
    copyright,
    unsubscribeUrl,
    unsubscribeLabel,
    links,
    textColor,
    fontSize,
    align,
  } = block.props;

  const color = textColor ?? context.settings.textColor ?? "#6b7280";
  const size = fontSize ?? 12;
  const textStyle: CSSProperties = {
    color,
    fontSize: size,
    fontFamily: context.settings.fontFamily,
    lineHeight: 1.6,
    margin: "4px 0",
    textAlign: align ?? "center",
  };

  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        ...alignedBlockStyle(align ?? "center"),
      }}
    >
      {companyName ? <Text style={textStyle}>{companyName}</Text> : null}
      {address ? <Text style={textStyle}>{address}</Text> : null}
      {links?.map((link) => (
        <Text key={`${block.id}-${link.href}`} style={textStyle}>
          <Link
            href={link.href}
            style={{ color: context.settings.linkColor ?? color, textDecoration: "underline" }}
          >
            {link.text}
          </Link>
        </Text>
      ))}
      {unsubscribeUrl ? (
        <Text style={textStyle}>
          <Link
            href={unsubscribeUrl}
            style={{ color: context.settings.linkColor ?? color, textDecoration: "underline" }}
          >
            {unsubscribeLabel ?? "Unsubscribe"}
          </Link>
        </Text>
      ) : null}
      {copyright ? <Text style={textStyle}>{copyright}</Text> : null}
    </Section>
  );
}

function renderQrBlock(block: QrBlock, context: RenderContext) {
  const { align, size } = block.props;
  const src = context.qrImages.get(block.id);

  if (!src) {
    throw new Error(`QR image not generated for block: ${block.id}`);
  }

  const dimension = size ?? 150;

  return (
    <Section
      key={block.id}
      style={{
        ...blockStylesToCss(block.styles),
        ...alignedBlockStyle(align),
      }}
    >
      <Img
        src={src}
        alt="QR code"
        width={dimension}
        height={dimension}
        style={{
          ...alignedImageStyle(align),
          display: "block",
        }}
      />
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
  const { links, iconSize, gap, backgroundColor } = block.props;
  const size = iconSize ?? 24;

  return (
    <Section key={block.id} style={blockStylesToCss(block.styles)}>
      <Row>
        {links.map((link: SocialLink, index: number) => (
          <Column
            key={`${block.id}-${link.platform}`}
            style={{
              width: "auto",
              paddingRight: index < links.length - 1 ? (gap ?? 8) : 0,
            }}
          >
            <Link href={link.url} style={{ textDecoration: "none" }}>
              <Img
                src={getSocialIconSrc(link.platform)}
                alt={link.label ?? link.platform}
                width={size}
                height={size}
                style={{
                  display: "block",
                  backgroundColor,
                  borderRadius: backgroundColor ? "50%" : undefined,
                }}
              />
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
  const fill = color ?? "#2563eb";

  if (shape === "triangle") {
    const triangleWidth = width ?? 80;
    const triangleHeight = height ?? 80;

    return (
      <Section key={block.id} style={blockStylesToCss(block.styles)}>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${triangleWidth / 2}px solid transparent`,
            borderRight: `${triangleWidth / 2}px solid transparent`,
            borderBottom: `${triangleHeight}px solid ${fill}`,
            display: "inline-block",
          }}
        />
      </Section>
    );
  }

  const shapeStyles: CSSProperties = {
    ...blockStylesToCss(block.styles),
    backgroundColor: fill,
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
registerContentBlockRenderer("logo", { html: renderLogoBlock });
registerContentBlockRenderer("video", { html: renderVideoBlock });
registerContentBlockRenderer("divider", { html: renderDividerBlock });
registerContentBlockRenderer("spacer", { html: renderSpacerBlock });
registerContentBlockRenderer("social", { html: renderSocialBlock });
registerContentBlockRenderer("html", { html: renderHtmlBlock });
registerContentBlockRenderer("table", { html: renderTableBlock });
registerContentBlockRenderer("shape", { html: renderShapeBlock });
registerContentBlockRenderer("footer", { html: renderFooterBlock });
registerContentBlockRenderer("qr", { html: renderQrBlock });

export function renderContentBlock(block: ContentBlock, context: RenderContext) {
  return renderContentBlockHtml(block, context);
}

function renderColumnBlock(
  column: ColumnBlock,
  context: RenderContext,
  gapPadding: number,
) {
  const width = column.props.width ? `${column.props.width}%` : undefined;

  return (
    <Column
      key={column.id}
      className="stack-column"
      style={{
        ...blockStylesToCss(column.styles),
        width,
        verticalAlign: column.styles?.verticalAlign ?? "top",
        paddingRight: gapPadding > 0 ? gapPadding : undefined,
      }}
    >
      {column.children.map((child) => renderContentBlock(child, context))}
    </Column>
  );
}

function renderRowBlock(
  row: RowBlock,
  context: RenderContext,
  sectionProps: SectionBlock["props"],
) {
  const reverseOnMobile =
    row.props.reverseOnMobile ?? sectionProps.reverseColumnsOnMobile ?? false;
  const gap = row.props.gap ?? 0;

  return (
    <Row
      key={row.id}
      className={reverseOnMobile ? `row-${row.id}` : undefined}
      style={blockStylesToCss(row.styles)}
    >
      {row.children.map((column, index) => {
        const explicitWidth = row.props.columnWidths?.[index];
        const columnWithWidth =
          explicitWidth !== undefined
            ? {
                ...column,
                props: { ...column.props, width: explicitWidth },
              }
            : column;
        const isLast = index === row.children.length - 1;

        return renderColumnBlock(
          columnWithWidth,
          context,
          isLast ? 0 : gap,
        );
      })}
    </Row>
  );
}

function renderSectionBlock(
  section: SectionBlock,
  context: RenderContext,
) {
  const {
    fullWidth,
    backgroundImage,
    backgroundSize,
    backgroundPosition,
    backgroundRepeat,
  } = section.props;

  return (
    <Section
      key={section.id}
      style={{
        ...blockStylesToCss(section.styles),
        width: fullWidth ? "100%" : undefined,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: backgroundImage ? (backgroundSize ?? "cover") : undefined,
        backgroundPosition: backgroundImage
          ? (backgroundPosition ?? "center center")
          : undefined,
        backgroundRepeat: backgroundImage
          ? (backgroundRepeat ?? "no-repeat")
          : undefined,
      }}
    >
      {section.children.map((row) =>
        renderRowBlock(row, context, section.props),
      )}
    </Section>
  );
}

type TemplateEmailProps = {
  content: TemplateContentData;
  qrImages: Map<string, string>;
};

function buildGlobalStyles(content: TemplateContentData): string {
  const { settings } = content;
  const linkColor = settings.linkColor ?? "#2563eb";
  const mobileStyles = buildLayoutMobileStyles(content);

  return `
    a { color: ${linkColor}; }
    ${mobileStyles}
  `;
}

export function TemplateEmail({ content, qrImages }: TemplateEmailProps) {
  const settings = content.settings;
  const context: RenderContext = { settings, qrImages };

  return (
    <Html>
      <Head>
        <style>{buildGlobalStyles(content)}</style>
      </Head>
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
