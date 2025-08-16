"use client";

import { useState } from "react";
import {
  Plus,
  Type,
  Image as ImageIcon,
  RectangleHorizontal,
  Link,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBuilder } from "@/app/build/BuilderContext";
import {
  createTextBlock,
  createButtonBlock,
  createContainerBlock,
  createImageBlock,
} from "@/lib/blockFactory";

const availableBlocks = [
  {
    name: "Container",
    type: "container",
    icon: <RectangleHorizontal className="h-5 w-5" />,
  },
  { name: "Text", type: "text", icon: <Type className="h-5 w-5" /> },
  {
    name: "Button",
    type: "button",
    icon: <Link className="h-5 w-5" />,
  },
  { name: "Image", type: "image", icon: <ImageIcon className="h-5 w-5" /> },
  // { name: "List", type: "list", icon: <List className="h-5 w-5" /> },
];

export default function AddBlock() {
  const [isOpen, setIsOpen] = useState(false);
  const { blocks, dispatch, selectedBlockId } = useBuilder();

  const handleAddBlock = (blockType: string) => {
    let newBlock;
    switch (blockType) {
      case "text":
        newBlock = createTextBlock(selectedBlockId);
        break;
      case "button":
        newBlock = createButtonBlock(selectedBlockId);
        break;
      case "image":
        newBlock = createImageBlock(selectedBlockId);
        break;
      case "container":
        newBlock = createContainerBlock(selectedBlockId);
        break;
      // case "list":
      //   newBlock = createListBlock(selectedBlockId);
      //   break;
      default:
        return;
    }

    dispatch({
      type: "ADD_BLOCK",
      payload: { block: newBlock, index: 0, parentId: selectedBlockId },
    });
    console.log(blocks);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="max-w-xs cursor-pointer w-full flex items-center justify-center rounded-full bg-accent p-4 border border-border hover:bg-accent/80 transition-colors">
          <Plus className="h-5 w-5" />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new block</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-4">
          {availableBlocks.map((block) => (
            <button
              key={block.type}
              onClick={() => handleAddBlock(block.type)}
              className="cursor-pointer flex flex-col items-center justify-center gap-2 p-4 border rounded-md hover:bg-accent transition-colors"
            >
              {block.icon}
              <span className="text-sm font-medium">{block.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
