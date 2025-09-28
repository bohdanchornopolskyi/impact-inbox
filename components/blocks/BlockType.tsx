import ContainerBlock from "@/components/blocks/ContainerBlock";
import TextBlock from "@/components/blocks/TextBlock";
import ImageBlock from "@/components/blocks/ImageBlock";
import { AnyUiBlock } from "@/lib/types";

function BlockType({ block }: { block: AnyUiBlock }) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} />;
    case "button":
      break;
    case "image":
      return <ImageBlock block={block} />;
    case "container":
      return <ContainerBlock block={block} />;
    default:
      return;
  }
}

export default BlockType;
