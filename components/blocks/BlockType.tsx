import ContainerBlock from "@/components/blocks/ContainerBlock";
import { TextBlock } from "@/components/blocks/TextBlock";
import { AnyUiBlock } from "@/lib/types";

function BlockType({ block }: { block: AnyUiBlock }) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} />;
    case "button":
      break;
    case "image":
      break;
    case "container":
      return <ContainerBlock block={block} />;
    default:
      return;
  }
}

export default BlockType;
