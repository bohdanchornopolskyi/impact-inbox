"use client";

import { useState } from "react";
import { Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBuilder } from "@/app/build/BuilderContext";
import { ROOT_CONTAINER_ID } from "@/lib/types";

interface BlockContextMenuProps {
  blockId: string;
  blockName: string;
  children: React.ReactNode;
}

export function BlockContextMenu({
  blockId,
  blockName,
  children,
}: BlockContextMenuProps) {
  const { dispatch, selectedBlockId, setSelectedBlockId } = useBuilder();
  const [showPopover, setShowPopover] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const canDelete = blockId !== ROOT_CONTAINER_ID;

  const handleDelete = () => {
    dispatch({
      type: "DELETE_BLOCK",
      payload: { blockId },
    });
    setShowPopover(false);
    setShowDeleteConfirmation(false);

    if (selectedBlockId === blockId) {
      setSelectedBlockId(ROOT_CONTAINER_ID);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canDelete) {
      setShowPopover(true);
    }
  };

  return (
    <>
      <div className="relative group" onContextMenu={handleContextMenu}>
        {children}
        {canDelete && (
          <Popover open={showPopover} onOpenChange={setShowPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-4 max-w-xs">
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Delete Block
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </>
  );
}
