import {
  TEMPLATE_BLOCK_DEFINITIONS,
  type TemplateBlockType,
} from "../constants/template";
import type { TemplateBlock } from "./tree-ops";

export function getBlockTypeLabel(type: TemplateBlockType): string {
  return TEMPLATE_BLOCK_DEFINITIONS[type].label;
}

export function getBlockLabel(block: TemplateBlock): string {
  return getBlockTypeLabel(block.type);
}
