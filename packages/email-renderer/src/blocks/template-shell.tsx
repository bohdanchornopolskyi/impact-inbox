import {
  Container,
  Head,
  Html,
  Preview,
} from "@react-email/components";
import {
  walkContentBlocks,
  CANVAS_BODY_ATTR,
  TEMPLATE_DEFAULT_COLORS,
  type TemplateContentData,
} from "@repo/shared";
import { buildLayoutMobileStyles } from "../layout-styles";
import { renderSectionBlock } from "./layout";
import { renderContentBlockText } from "./content-block-registry";
import type { RenderContext } from "./content-block-registry";

export type TemplateEmailProps = {
  content: TemplateContentData;
  qrImages: Map<string, string>;
};

function buildGlobalStyles(content: TemplateContentData): string {
  const { settings } = content;
  const linkColor = settings.linkColor ?? TEMPLATE_DEFAULT_COLORS.link;
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
          backgroundColor:
            settings.backgroundColor ?? TEMPLATE_DEFAULT_COLORS.pageBackground,
          fontFamily: settings.fontFamily ?? "Arial, sans-serif",
        }}
      >
        <Container
          {...{ [CANVAS_BODY_ATTR]: "" }}
          style={{
            width: `${settings.width}px`,
            maxWidth: "100%",
            margin: "0 auto",
            backgroundColor:
              settings.contentBackgroundColor ??
              TEMPLATE_DEFAULT_COLORS.contentBackground,
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

  walkContentBlocks(content, ({ block }) => {
    const line = renderContentBlockText(block);
    if (line) {
      lines.push(line);
    }
  });

  return lines.join("\n").trim();
}
