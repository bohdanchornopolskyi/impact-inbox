import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnyBlock, ROOT_CONTAINER_ID } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildLayerTree(flatBlocks: AnyBlock[]): AnyBlock[] {
  const tree: AnyBlock[] = [];
  const blockMap = new Map<string, AnyBlock>();

  // First pass: Create a map for easy lookup and ensure every container
  // has a `children` array initialized for the UI.
  flatBlocks.forEach((block) => {
    const newBlock = { ...block };
    if (newBlock.type === "container") {
      newBlock.children = [];
    }
    blockMap.set(newBlock.id, newBlock);
  });

  // Second pass: Link blocks to their parents to build the tree structure.
  blockMap.forEach((block) => {
    if (block.parentId === ROOT_CONTAINER_ID) {
      tree.push(block);
    } else if (block.parentId && blockMap.has(block.parentId)) {
      const parent = blockMap.get(block.parentId)!;
      // This is safe because we initialized `children` in the first pass
      if (parent.type === "container") {
        parent.children!.push(block);
      }
    }
  });

  return tree;
}
