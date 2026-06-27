import { walkRows, type TemplateContentData } from "@repo/shared";
import { rowReverseOnMobile } from "./blocks/layout";

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

  walkRows(content, ({ row, section }) => {
    if (rowReverseOnMobile(row, section.props)) {
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
  });

  return rules.join("\n");
}
