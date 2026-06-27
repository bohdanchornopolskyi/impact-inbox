import { registerBlock } from "./content-block-registry";
import {
  renderButtonBlock,
  renderDividerBlock,
  renderFooterBlock,
  renderHeadingBlock,
  renderHtmlBlock,
  renderImageBlock,
  renderLogoBlock,
  renderQrBlock,
  renderRichtextBlock,
  renderShapeBlock,
  renderSocialBlock,
  renderSpacerBlock,
  renderTableBlock,
  renderTextBlock,
  renderVideoBlock,
} from "./template-email";
import {
  renderButtonBlockText,
  renderDividerBlockText,
  renderFooterBlockText,
  renderHeadingBlockText,
  renderHtmlBlockText,
  renderImageBlockText,
  renderLogoBlockText,
  renderQrBlockText,
  renderRichtextBlockText,
  renderShapeBlockText,
  renderSocialBlockText,
  renderSpacerBlockText,
  renderTableBlockText,
  renderTextBlockText,
  renderVideoBlockText,
} from "./plain-text";

registerBlock("heading", { html: renderHeadingBlock, text: renderHeadingBlockText });
registerBlock("text", { html: renderTextBlock, text: renderTextBlockText });
registerBlock("richtext", { html: renderRichtextBlock, text: renderRichtextBlockText });
registerBlock("button", { html: renderButtonBlock, text: renderButtonBlockText });
registerBlock("image", { html: renderImageBlock, text: renderImageBlockText });
registerBlock("logo", { html: renderLogoBlock, text: renderLogoBlockText });
registerBlock("video", { html: renderVideoBlock, text: renderVideoBlockText });
registerBlock("divider", { html: renderDividerBlock, text: renderDividerBlockText });
registerBlock("spacer", { html: renderSpacerBlock, text: renderSpacerBlockText });
registerBlock("social", { html: renderSocialBlock, text: renderSocialBlockText });
registerBlock("html", { html: renderHtmlBlock, text: renderHtmlBlockText });
registerBlock("table", { html: renderTableBlock, text: renderTableBlockText });
registerBlock("shape", { html: renderShapeBlock, text: renderShapeBlockText });
registerBlock("footer", { html: renderFooterBlock, text: renderFooterBlockText });
registerBlock("qr", { html: renderQrBlock, text: renderQrBlockText });
