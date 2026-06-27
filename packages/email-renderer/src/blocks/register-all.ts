import { registerBlock } from "./content-block-registry";
import "./button";
import "./heading";
import "./richtext";
import "./text";
import {
  renderDividerBlock,
  renderFooterBlock,
  renderHtmlBlock,
  renderImageBlock,
  renderLogoBlock,
  renderQrBlock,
  renderShapeBlock,
  renderSocialBlock,
  renderSpacerBlock,
  renderTableBlock,
  renderVideoBlock,
} from "./template-email";
import {
  renderDividerBlockText,
  renderFooterBlockText,
  renderHtmlBlockText,
  renderImageBlockText,
  renderLogoBlockText,
  renderQrBlockText,
  renderShapeBlockText,
  renderSocialBlockText,
  renderSpacerBlockText,
  renderTableBlockText,
  renderVideoBlockText,
} from "./plain-text";
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
