import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnyBlock, AnyUiBlock, ROOT_CONTAINER_ID } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildLayerTree(flatBlocks: AnyBlock[]): AnyUiBlock[] {
  const tree: AnyUiBlock[] = [];
  const blockMap = new Map<string, AnyUiBlock>();

  for (const block of flatBlocks) {
    blockMap.set(block.id, {
      ...block,
      ...(block.type === "container" && { children: [] }),
    } as AnyUiBlock);
  }

  for (const block of flatBlocks) {
    const blockFromMap = blockMap.get(block.id)!;

    if (block.parentId === ROOT_CONTAINER_ID) {
      tree.push(blockFromMap);
    } else {
      const parentFromMap = blockMap.get(block.parentId);
      if (parentFromMap?.type === "container") {
        parentFromMap.children!.push(blockFromMap);
      }
    }
  }

  return tree;
}
