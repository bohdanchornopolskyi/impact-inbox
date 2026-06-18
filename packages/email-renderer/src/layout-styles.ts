import type { RowBlock, SectionBlock, TemplateContentData } from "@repo/shared";

function rowReverseOnMobile(
  row: RowBlock,
  sectionProps: SectionBlock["props"],
): boolean {
  return row.props.reverseOnMobile ?? sectionProps.reverseColumnsOnMobile ?? false;
}

export function buildLayoutMobileStyles(content: TemplateContentData): string {
  const rules: string[] = [
    `@media only screen and (max-width: 480px) {
      .stack-column {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
      }
    }`,
  ];

  for (const section of content.body) {
    for (const row of section.children) {
      const reverse = rowReverseOnMobile(row, section.props);

      if (reverse) {
        rules.push(
          `@media only screen and (max-width: 480px) {
            .row-${row.id} tbody {
              display: flex !important;
              flex-direction: column-reverse !important;
            }
            .row-${row.id} .stack-column {
              display: block !important;
              width: 100% !important;
            }
          }`,
        );
      }
    }
  }

  return rules.join("\n");
}
