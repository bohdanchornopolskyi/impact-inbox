import {
  Container,
  Head,
  Html,
  Preview,
} from "@react-email/components";
import { walkContentBlocks, type TemplateContentData } from "@repo/shared";
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

  walkContentBlocks(content, ({ block }) => {
    const line = renderContentBlockText(block);
    if (line) {
      lines.push(line);
    }
  });

  return lines.join("\n").trim();
}
