import type { ContentBlock } from "../schemas/template/blocks/content";
import type {
  ColumnBlock,
  RowBlock,
  SectionBlock,
} from "../schemas/template/blocks/layout";

type CloneableBlock = SectionBlock | RowBlock | ColumnBlock | ContentBlock;

function createId(): string {
  return globalThis.crypto.randomUUID();
}

function retargetIds(node: { id: string; children?: unknown[] }): void {
  node.id = createId();
  if (!node.children) {
    return;
  }
  for (const child of node.children) {
    retargetIds(child as { id: string; children?: unknown[] });
  }
}

/**
 * Deep copy of a block subtree with fresh ids at every level. Clones never share
 * ids with their source, so duplicate and saved-module insert stay independent.
 */
export function cloneBlockWithNewIds<T extends CloneableBlock>(block: T): T {
  const cloned = structuredClone(block);
  retargetIds(cloned);
  return cloned;
}
